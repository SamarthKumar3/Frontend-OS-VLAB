export interface Options {
    delay: [number, number];
    count: number;
    capacity: number;
    boundary?: boolean;
    semaphore?: boolean;
}

interface Chunk {
    id: number;
    progress: number;
}

interface Scene {
    producer: ProducerState;
    consumer: ConsumerState;
}

interface ProducerState {
    state: string;
    chunk: Chunk | null;
    backpressure: boolean;
}

interface ConsumerState {
    state: string;
    chunk: Chunk | undefined;
    queue: {
        cap: number;
        chunks: Chunk[];
    };
    drained: boolean;
}

interface Event {
    delay: number;
    run: () => void;
    time: number;
    parent?: Event;
}

class EventLoop {
    private _events: Event[] = [];
    private _current: Event | undefined;
    private _startAt: number = Date.now();

    push(ev: Event): void {
        ev.time = ((this._current && this._current.time !== undefined) ? this._current.time : 0) + ev.delay;
        ev.parent = this._current;
        this._events.push(ev);
        this._events.sort((e1, e2) => e1.time - e2.time);
    }

    pushImmediate(ev: Event): void {
        ev.time = this._current && this._current.time !== undefined ? this._current.time : 0;
        ev.parent = this._current;
        this._events.unshift(ev);
    }

    nextEventDelay(): number {
        return (this._current && this._events.length)
            ? this._events[0].time - this._current.time
            : 0;
    }

    execute(): void {
        this._current = this._events.shift();
        this._current?.run();
    }

    empty(): boolean {
        return this._events.length === 0;
    }
}

class Producer {
    private _eventLoop: EventLoop;
    private _consumer: Consumer;
    private _state: string;
    private _delay: { value: number; range: [number, number] };
    private _count: number;
    private _chunk: Chunk | null;
    private _produced: number;
    private _backpressure: boolean;

    constructor(eventLoop: EventLoop, consumer: Consumer, options: Options) {
        this._eventLoop = eventLoop;
        this._consumer = consumer;
        this._state = 'idling';
        this._delay = delayFromRange(options.delay);
        this._count = options.count;
        this._chunk = { id: 0, progress: 0 };
        this._produced = 0;
        this._backpressure = false;
        this._consumer.subOnDrained(() => {
            this._backpressure = false;
            this.resume();
        });
    }

    toJSON(): ProducerState {
        return {
            state: this._state,
            chunk: this._chunk,
            backpressure: this._backpressure,
        };
    }

    resume(): void {
        if (this._produced === this._count) return;
        this._state = 'resuming';
        this._eventLoop.pushImmediate({
            delay: 0,
            run: () => this._produce(),
            time: this._currentTime(),
        });
    }

    private _produce(): void {
        if (this._chunk === null) return this._end();

        this._state = 'producing';
        if (this._chunk.progress === 100) {
            this._delay = delayFromRange(this._delay.range);
            this._produced++;
            this._eventLoop.push({
                delay: 0,
                run: () => this._push(),
                time: this._currentTime(),
            });
        } else {
            this._chunk.progress += 20; //increase this to increase the speed of production
            this._eventLoop.push({
                delay: this._delay.value / 20,
                run: () => this._produce(),
                time: this._currentTime(),
            });
        }
    }

    private _push(): void {
        this._state = 'pushing';
        this._eventLoop.pushImmediate({
            delay: 0,
            run: () => {
                this._backpressure = !this._consumer.write(this._chunk!);
                this._chunk = this._produced < this._count ? { id: this._chunk!.id + 1, progress: 0 } : null;
                if (this._backpressure) {
                    if (this._produced === this._count) {
                        this._state = 'finished';
                        this._end();
                    } else {
                        this._state = 'idling';
                    }
                } else {
                    this._produce();
                }
            },
            time: this._currentTime(), // add this line to initialize the time property
        });
    }

    private _end(): void {
        this._state = 'finished';
        this._backpressure = false;
        this._eventLoop.push({
            delay: 0,
            run: () => this._consumer.write(null),
            time: this._currentTime(), // add this line to initialize the time property
        });
    }

    private _currentTime(): number {
        return this._eventLoop.empty() ? 0 : this._eventLoop.nextEventDelay();
    }
}

class Consumer {
    private _eventLoop: EventLoop;
    private _state: string;
    private _delay: { value: number; range: [number, number] };
    private _queue: Chunk[] = [];
    private _queueCap: number;
    private _chunk: Chunk | undefined;
    private _drained: boolean;
    private _drainedListeners: (() => void)[] = [];
    private _endCalled: boolean;
    private _boundary: boolean;
    private _semaphore: boolean;

    constructor(eventLoop: EventLoop, options: Options) {
        this._eventLoop = eventLoop;
        this._state = 'idling';
        this._delay = delayFromRange(options.delay);
        this._queueCap = options.capacity;
        this._chunk = undefined;
        this._drained = false;
        this._endCalled = false;
        this._boundary = !!options.boundary;
        this._semaphore = !!options.semaphore;
    }

    toJSON(): ConsumerState {
        return {
            state: this._state,
            chunk: this._chunk,
            queue: {
                cap: this._queueCap,
                chunks: this._queue,
            },
            drained: this._drained,
        };
    }

    write(chunk: Chunk | null): boolean {
        if (chunk === null) {
            this.end();
            return false;
        }

        if (this._queue.length >= this._queueCap) {
            if (this._boundary) {
                this._state = 'backpressure';
                return false;
            }
            throw new Error('Out of memory');
        }
        this._queue.push(chunk);
        if (this._queue.length == this._queueCap) {
            this._resume();
        }

        return this._state === 'idling';
    }

    subOnDrained(cb: () => void): void {
        this._drainedListeners.push(cb);
    }

    end(): void {
        this._resume();
        this._endCalled = true;
    }

    private _resume(): void {
        if (this._state == 'finished') return;
        this._state = 'resuming';
        this._eventLoop.pushImmediate(createEvent(0, () => this._pull(), this._currentTime()));
    }

    private _pull(): void {
        this._state = 'pulling';
        this._chunk = this._queue.shift();
        if (this._chunk) {
            this._eventLoop.pushImmediate(createEvent(0, () => this._consume(), this._currentTime()));
        }
    }

    private _consume(): void {
        if (!this._chunk) return;
        this._state = 'consuming';
        this._drained = false;
        if (this._chunk.progress === 0 && this._state != 'finished') {
            this._delay = delayFromRange(this._delay.range);
            this._eventLoop.push(createEvent(0, () => {
                if (this._queue.length === 0) {
                    this._drained = true;
                    this._drainedListeners.forEach(cb => cb());
                    this._chunk = undefined;
                    this._state = this._endCalled ? 'finished' : 'idling';
                } else if (this._state !== 'idling' && this._state !== 'finished') {
                    this._pull();
                }
            }, this._currentTime()));
        } else {
            this._chunk.progress -= 20; // Increase the progress decrement to consume faster
            this._eventLoop.push(createEvent(this._delay.value / 20, () => this._consume(), this._currentTime()));
        }
    }

    private _currentTime(): number {
        return this._eventLoop.empty() ? 0 : this._eventLoop.nextEventDelay();
    }
}



class Renderer {
    private _ctx: CanvasRenderingContext2D;
    private _width: number;
    private _height: number;
    private _dimX: number;
    private _dimY: number;
    private _unitX: number;
    private _unitY: number;
    private _fps: number;
    private semaphore: { state: number };
    private _prodW: number;
    private _prodH: number;
    private _consW: number;
    private _consH: number;
    private _semaW: number;
    private _semaH: number;
    private _chunkW: number;
    private _chunkH: number;
    private _queueW: number;

    constructor(canvas: HTMLCanvasElement, dimX: number, dimY: number, fps: number = 60) {
        this._ctx = canvas.getContext('2d')!;
        this._width = canvas.width;
        this._height = canvas.height;
        this._dimX = dimX;
        this._dimY = dimY;
        this._unitX = Math.floor(this._width / this._dimX);
        this._unitY = Math.floor(this._height / this._dimY);
        this._fps = fps;
        this.semaphore = { state: 1 };
        this._prodW = 5;
        this._prodH = 2;
        this._consW = 5;
        this._consH = 2;
        this._semaW = 2;
        this._semaH = 2;
        this._chunkW = 1;
        this._chunkH = 1;
        this._queueW = 1;
    }

    clear(): void {
        this._ctx.clearRect(0, 0, this._width, this._height);
    }

    draw(scene: Scene): Promise<void> {
        const producer = scene.producer;
        const consumer = scene.consumer;
        return new Promise<void>((resolve) => {
            if (producer.state === 'pushing') {
                return this._animatePushing(producer, consumer).then(() => resolve());
            }
            if (consumer.state === 'pulling') {
                return this._animatePulling(producer, consumer).then(() => resolve());
            }

            this.clear();
            this._drawProducer(producer, consumer.queue);
            this._drawSemaphore();
            this._drawQueue(consumer.queue);
            this._drawConsumer(consumer);
            resolve();
        });
    }

    drawText(message: string, x: number, y: number, options: { align?: string, color?: string, font?: string, rotate?: number } = {}): void {
        x = x * this._unitX;
        y = y * this._unitY;
        if (options.rotate !== void 0) {
            options.align = 'center';
            this._ctx.save();
            this._ctx.translate(x, y);
            this._ctx.rotate((options.rotate * Math.PI) / 180.0);
            x = 0;
            y = 16;
        }

        this._ctx.fillStyle = options.color || '#000';
        this._ctx.font = options.font || '24px Plus Jakarta Sans';
        this._ctx.textAlign = options.align as CanvasTextAlign || 'left';
        this._ctx.fillText(message, x, y);

        if (options.rotate !== void 0) {
            this._ctx.restore();
        }
    }

    drawRect(x: number, y: number, w: number, h: number, options: { color?: string, border?: string, radius?: number } = {}): void {
        this._fillRect(x, y, w, h, options);
        if (options.border) {
            this._strokeRect(x, y, w, h, {
                radius: options.radius,
                color: options.border,
            });
        }
    }

    private _fillRect(x: number, y: number, w: number, h: number, options: { color?: string, radius?: number }): void {
        if (options.radius) {
            this._rectRounded(x, y, w, h, options.radius);
        } else {
            this._rectPlain(x, y, w, h);
        }
        this._ctx.fillStyle = options.color || '#000';
        this._ctx.fill();
    }

    private _strokeRect(x: number, y: number, w: number, h: number, options: { color?: string, radius?: number }): void {
        if (options.radius) {
            this._rectRounded(x, y, w, h, options.radius);
        } else {
            this._rectPlain(x, y, w, h);
        }
        this._ctx.strokeStyle = options.color || '#000';
        this._ctx.stroke();
    }

    private _rectPlain(x: number, y: number, w: number, h: number): void {
        this._ctx.beginPath();
        this._ctx.rect(x * this._unitX, y * this._unitY, w * this._unitX, h * this._unitY);
    }

    private _rectRounded(x: number, y: number, w: number, h: number, r: number): void {
        x = x * this._unitX;
        y = y * this._unitY;
        w = w * this._unitX;
        h = h * this._unitY;

        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;

        this._ctx.beginPath();
        this._ctx.moveTo(x + r, y);
        this._ctx.arcTo(x + w, y, x + w, y + h, r);
        this._ctx.arcTo(x + w, y + h, x, y + h, r);
        this._ctx.arcTo(x, y + h, x, y, r);
        this._ctx.arcTo(x, y, x + w, y, r);
    }

    private _drawProducer(producer: ProducerState, queue: { cap: number, chunks: Chunk[] }): void {
        const x = this._prodX();
        const y = this._prodY();
        this.drawRect(x, y, this._prodW, this._prodH, {
            color: '#7F4EBD',
            border: '#331A53',
            radius: 6,
        });
        this.drawText(producerText(producer), (this._dimX - 3) / 2, y + 0.6, {
            align: 'center',
            color: '#FFFFFFCC',
        });

        if (producer.state === 'producing') {
            this._drawChunk(producer.chunk!, this._chunkX(), y + 1);
        }

        if (producer.backpressure) {
            this._drawBackpressureWarn(queue);
        }
    }

    private _drawBackpressureWarn(queue: { cap: number, chunks: Chunk[] }): void {
        this.drawText(
            'Backpressure',
            this._queueX() + this._queueW + 1.5,
            this._queueY() + this._queueH(queue) / 2,
            { align: 'center', color: 'red', font: '20px Plus Jakarta Sans' }
        );
    }

    private _animatePushing(producer: ProducerState, consumer: ConsumerState): Promise<void> {
        const chunk = producer.chunk!;
        const queue = consumer.queue;
        this.semaphore.state = 1;
        return new Promise<void>((resolve) => {
            const startY = this._prodY() + 1.5;
            const endY = this._queueY() + (queue.cap - queue.chunks.length - 1);
            let chunkY = startY;
            const totalDuration = 150 * (endY - startY);
            const frameDuration = 1000 / this._fps;
            const dY = (endY - startY) / (totalDuration / frameDuration);
            const int = setInterval(() => {
                chunkY = Math.min(endY, chunkY + dY);
                this.clear();
                this._drawProducer(producer, queue);
                this._drawQueue(queue);
                this._drawSemaphore();
                this._drawConsumer(consumer);
                this._drawChunk(chunk, this._chunkX(), chunkY);
                if (chunkY >= endY) {
                    clearInterval(int);
                    if (producer.backpressure) {
                        setTimeout(resolve, 150);
                    } else {
                        resolve();
                    }
                }
            }, frameDuration);
        });
    }

    private _animatePulling(producer: ProducerState, consumer: ConsumerState): Promise<void> {
        const chunk = consumer.chunk!;
        const queue = consumer.queue;
        this.semaphore.state = 0;

        return new Promise<void>((resolve) => {
            const startY = this._queueY() + this._queueH(queue) - 1;
            const endY = this._consY(consumer);
            let chunkY = startY;
            const totalDuration = 150 * (endY - startY);
            const frameDuration = 1000 / this._fps;
            const dY = (endY - startY) / (totalDuration / frameDuration);
            const anim = setInterval(() => {
                chunkY = Math.min(endY, chunkY + dY);
                this.clear();
                this._drawProducer(producer, queue);
                this._drawQueue(queue, 1);
                this._drawSemaphore();
                this._drawConsumer(consumer);
                this._drawChunk(chunk, this._chunkX(), chunkY);
                if (chunkY >= endY) {
                    clearInterval(anim);
                    this._animateQueueShift(queue).then(() => resolve());
                }
            }, frameDuration);
        });
    }

    private _animateQueueShift(queue: { cap: number, chunks: Chunk[] }): Promise<void> {
        return new Promise<void>((resolve) => {
            if (queue.chunks.length === 0) {
                return resolve();
            }

            const totalDuration = 150;
            let elapsed = 0;
            const frameDuration = 1000 / this._fps;
            const anim = setInterval(() => {
                if (elapsed >= totalDuration) {
                    clearInterval(anim);
                    return resolve();
                }

                this._drawQueue(queue, (totalDuration - elapsed) / totalDuration);
                elapsed += frameDuration;
            }, frameDuration);
        });
    }

    private _prodX(): number {
        return (this._dimX - this._prodW - 3) / 2;
    }

    private _prodY(): number {
        return 1;
    }

    private _consX(): number {
        return (this._dimX - this._consW - 3) / 2;
    }

    private _consY(consumer: ConsumerState): number {
        return this._prodX() + this._prodH + 0.5 + this._queueH(consumer.queue) + 0.5;
    }

    private _chunkX(): number {
        return (this._dimX - this._chunkW - 3) / 2;
    }

    private _queueX(): number {
        return this._chunkX();
    }

    private _queueY(): number {
        return this._prodX() + this._prodH + 0.5;
    }

    private _queueH(queue: { cap: number, chunks: Chunk[] }): number {
        return queue.cap;
    }

    private _drawQueue(queue: { cap: number, chunks: Chunk[] }, offset: number = 0): void {
        const x = this._queueX();
        const y = this._queueY();
        this.drawRect(x, y, this._queueW, this._queueH(queue), {
            color: '#FFF',
            border: '#331A53',
        });
        this.drawRect(x - 0.2, y - 1 / this._unitY, this._queueW + 0.4, 2 / this._unitY, {
            color: '#FFF',
        });
        this.drawRect(
            x - 0.2,
            y - 1 / this._unitY + this._queueH(queue),
            this._queueW + 0.4,
            2 / this._unitY,
            { color: '#FFF' }
        );
        for (let i = 0; i < queue.chunks.length; i++) {
            this._drawChunk(queue.chunks[i], x, y + queue.cap - i - 1 - offset);
        }
    }

    private _drawSemaphore(): void {
        const x = this._dimX - 3;
        const y = this._dimY / 2 - 1;
        const state = this.semaphore.state;
        const text = state === 1 ? 'Signal' : state === 0 ? 'Wait' : 'Finished';

        this.drawRect(x, y, this._semaW, this._semaH, {
            color: '#C7BFD1',
            border: '#7F4EBD',
            radius: 6,
        });

        this.drawText(state.toString(), x + 1, y + 1, {
            align: 'center',
            color: '#7F4EBD',
        });

        this.drawText(text, x + 1, y + 1.5, {
            align: 'center',
            color: '#7F4EBD',
            font: '600 18px Plus Jakarta Sans',
        });
    }

    private _drawConsumer(consumer: ConsumerState): void {
        const x = this._consX();
        const y = this._consY(consumer);
        this.drawRect(x, y, this._consW, this._consH, {
            color: '#7F4EBD',
            border: '#331A53',
            radius: 6,
        });
        if (consumer.state === 'finished') {
            this.semaphore.state = -1;
            this._drawSemaphore();
        }
        this.drawText(consumerText(consumer), (this._dimX - 3) / 2, y + 1.6, {
            align: 'center',
            color: '#FFFFFFCC',
        });
        if (consumer.state === 'consuming' || consumer.state === 'flushing') {
            this._drawChunk(consumer.chunk!, this._chunkX(), y);
        }
    }

    private _drawChunk(chunk: Chunk, x: number, y: number): void {
        if (y === 2) {
            this.semaphore.state = 1;
        }
        if (chunk == null) {
            return;
        }
        const payloadColor = '#C7BFD1';
        this.drawRect(x, y, this._chunkW, this._chunkH, {
            color: 'white',
            radius: 3,
        });
        this.drawRect(x, y, this._chunkW * (chunk.progress / 100), this._chunkH, {
            color: payloadColor,
            radius: 3,
        });
        this._strokeRect(x, y, this._chunkW, this._chunkH, {
            color: '#7F4EBD',
            radius: 3,
        });
        this.drawText((chunk.id + 1).toString(), x + 0.5, y + 0.65, {
            align: 'center',
            color: '#7F4EBD',
        });
    }
}

//Helper functions
function createEvent(delay: number, run: () => void, currentTime: number): Event {
    return {
        delay,
        run,
        time: currentTime + delay,
        parent: undefined
    };
}

function producerText(producer: ProducerState): string {
    let message = producer.state;
    if (message === 'pushing') {
        message = 'producing';
    }
    return String.fromCharCode(message.charCodeAt(0) - 32) + message.slice(1);
}

function consumerText(consumer: ConsumerState): string {
    let message = consumer.state;
    if (message === 'pulling') {
        message = 'consuming';
    }
    return String.fromCharCode(message.charCodeAt(0) - 32) + message.slice(1);
}

function delayFromRange(range: [number, number]): { value: number, range: [number, number] } {
    return {
        value: rand(range[0], range[1]),
        range: range,
    };
}

function rand(a: number, b: number): number {
    return a + Math.floor(Math.random() * (b - a + 1));
}

class ProducerConsumer {
    private _eventLoop: EventLoop;
    private _producer: Producer;
    private _consumer: Consumer;
    private _renderer: Renderer;
    private _state: string;
    private _tick: number | undefined;

    constructor(eventLoop: EventLoop, producer: Producer, consumer: Consumer, renderer: Renderer) {
        this._eventLoop = eventLoop;
        this._producer = producer;
        this._consumer = consumer;
        this._renderer = renderer;
        this._state = 'initial';
    }

    render(): Promise<void> {
        return this._renderer.draw({
            consumer: this._consumer.toJSON(),
            producer: this._producer.toJSON(),
        });
    }

    start(): void {
        if (this._state === 'initial') {
            this._producer.resume();
        }

        if (this._state !== 'initial' && this._state !== 'paused') {
            throw new Error('Cannot start at this state');
        }
        this._state = 'running';

        const run = () => {
            delete this._tick;

            if (this._eventLoop.empty()) {
                this._state = 'finished';
                return;
            }

            this._next().then(() => {
                if (this._state === 'running') {
                    this._tick = setTimeout(run, this._eventLoop.nextEventDelay());
                }
            });
        };

        run();
    }

    pause(): void {
        if (this._state !== 'running') {
            throw new Error('Cannot pause at this state');
        }

        if (this._tick) {
            clearInterval(this._tick);
            delete this._tick;
        }
        this._state = 'paused';
    }

    isRunning(): boolean {
        return this._state === 'running';
    }

    isPaused(): boolean {
        return this._state === 'paused';
    }

    private _next(): Promise<void> {
        this._eventLoop.execute();
        return this.render();
    }
}

export { ProducerConsumer, EventLoop, Producer, Consumer, Renderer };