import React, { useEffect, useRef } from 'react';
import { ProducerConsumer, EventLoop, Producer, Consumer, Renderer, Options } from './ProducerConsumer';

interface CanvasComponentProps {
  chunksCount: number;
  queueCapacity: number;
  scenario: string;
}

const CanvasComponent: React.FC<CanvasComponentProps> = ({ chunksCount, queueCapacity, scenario }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const startModel = () => {
      const options: Options = {
        delay: [500, 500],
        count: chunksCount,
        capacity: queueCapacity,
        boundary: scenario === 'boundary',
        semaphore: scenario === 'semaphore',
      };

      const eventLoop = new EventLoop();
      const consumer = new Consumer(eventLoop, options);
      const producer = new Producer(eventLoop, consumer, options);

      if (canvasRef.current) {
        const dimX = 10;
        const dimY = 10;
        const renderer = new Renderer(canvasRef.current, dimX, dimY);
        const model = new ProducerConsumer(eventLoop, producer, consumer, renderer);
        model.start();
      }
    };

    startModel();
  }, [chunksCount, queueCapacity, scenario]);

  return <canvas ref={canvasRef} width={800} height={600} />;
};

export default CanvasComponent;
