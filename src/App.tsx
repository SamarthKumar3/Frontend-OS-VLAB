import React, { useEffect, useState } from 'react';

import './App.css';

interface Process {
    size: number;
}

interface MemoryBlock {
    size: number;
    isAllocated: boolean;
    blockId: number;
    allocatedProcessSize: number
}

const VirtualLab: React.FC = () => {
    const [processes, setProcesses] = useState<Process[]>([]);
    const [processSize, setProcessSize] = useState<number>(0);
    const [allocationStrategy, setAllocationStrategy] = useState<string>('firstFit');
    const [simulation, setSimulation] = useState<boolean>(false);
    const [totalBlockSize, setTotalBlockSize] = useState<number>(0);

    const memoryBlocks: MemoryBlock[] = [
        { size: 100, isAllocated: false, blockId: 0, allocatedProcessSize: 0 },
        { size: 500, isAllocated: false, blockId: 1, allocatedProcessSize: 0 },
        { size: 200, isAllocated: false, blockId: 2, allocatedProcessSize: 0 },
        { size: 300, isAllocated: false, blockId: 3, allocatedProcessSize: 0 },
        { size: 600, isAllocated: false, blockId: 4, allocatedProcessSize: 0 }
    ];
    const [allocatedMemoryBlocks, setAllocatedMemoryBlocks] = useState<MemoryBlock[]>([]);

    const allocationCallback = (modifiedMemoryBlocks: MemoryBlock[]) => {
        setAllocatedMemoryBlocks([...modifiedMemoryBlocks]);
    };

    useEffect(() => {
        for (let i = 0; i < memoryBlocks.length; i++) {
            setTotalBlockSize(totalBlockSize => totalBlockSize += memoryBlocks[i].size);
        }
    }, [memoryBlocks.length]);



    const handleProcessSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProcessSize(Number(e.target.value));
    };

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }


    const handleAddProcess = () => {
        setProcesses([...processes, { size: processSize }]);
        setProcessSize(0);
    };

    const deleteProcess = (index: number) => {
        setProcesses(processes.filter((_, idx) => idx !== index));
    };

    const handleSubmit: React.ComponentProps<"form">["onSubmit"] = (e) => {
        e.preventDefault();
        // take input from the user's memory block size and set it
        // setMemorySize()
        setSimulation(true);
        switch (allocationStrategy) {
            case 'firstFit':
                StartFirstFit(processes, memoryBlocks, allocationCallback);
                break;
            case 'bestFit':
                StartBestFit(processes, memoryBlocks);
                break;
            case 'nextFit':
                StartNextFit(processes, memoryBlocks);
                break;
            case 'worstFit':
                StartWorstFit(processes, memoryBlocks);
                break;
            default:
                break;
        }
        setTimeout(() => {
            setSimulation(false);
        }, 100000);
    }

    const handleAllocationStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAllocationStrategy(e.target.value);
    };

    const handleEnter = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter') {
            handleAddProcess();
        }
    }

    const StartFirstFit = (processes: Process[], memoryBlocks: MemoryBlock[], callback: (modifiedMemoryBlocks: MemoryBlock[]) => void) => {
        const modifiedMemoryBlocks = memoryBlocks.slice()
        processes.forEach((process, processId) => {
            let processAllocated = false;
            for (let block of modifiedMemoryBlocks) {
                if (!block.isAllocated && block.size >= process.size) {
                    block.isAllocated = true;
                    // block.blockId = processId;
                    processAllocated = true;
                    block.allocatedProcessSize = process.size;
                    // console.log(process.size + ' allocated in ' + block.size);
                    break;
                }
            }
            if (!processAllocated) {
                console.log(process.size + ' could not be allocated.');
            }
        });
        callback(modifiedMemoryBlocks);
    };

    const StartBestFit = (processes: Process[], memoryBlocks: MemoryBlock[]) => {
        let n = memoryBlocks.length;
        let m = processes.length;

        let allocation = new Array(n).fill(-1);

        for (let i = 0; i < n; i++) {
            let bestIdx = -1;
            for (let j = 0; j < m; j++) {
                if (!memoryBlocks[j].isAllocated && memoryBlocks[j].size >= processes[i].size) {
                    if (bestIdx === -1) {
                        bestIdx = j;
                    } else if (memoryBlocks[bestIdx].size > memoryBlocks[j].size) {
                        bestIdx = j;
                    }
                }
            }

            if (bestIdx !== -1) {
                allocation[i] = bestIdx;
                memoryBlocks[bestIdx].size -= processes[i].size;
                memoryBlocks[bestIdx].isAllocated = true;
            }
        }
    }

    const StartNextFit = (processes: Process[], memoryBlocks: MemoryBlock[]) => {

        let m = memoryBlocks.length;
        let n = processes.length;

        let allocation = new Array(n).fill(-1);
        let j = 0, t = m - 1;

        for (let i = 0; i < n; i++) {

            while (j < m) {
                if (memoryBlocks[j].size >= processes[i].size) {
                    allocation[i] = j;
                    memoryBlocks[j].size -= processes[i].size;
                    t = (j - 1) % m;
                    break;
                }
                if (t == j) {
                    t = (j - 1) % m;
                    break;
                }
                j = (j + 1) % m;
            }
        }

        console.log("\nProcess No.\t Process Size \t Block no.");
        for (let i = 0; i < n; i++) {
            console.log(" " + (i + 1) + "\t" + processes[i].size + "\t");
            if (allocation[i] != -1)
                console.log(allocation[i] + 1);
            else
                console.log("Not Allocated");
        }
    }

    const StartWorstFit = (processes: Process[], memoryBlocks: MemoryBlock[]) => {
        let m = memoryBlocks.length;
        let n = processes.length;

        let allocation = new Array(n).fill(-1);

        for (let i = 0; i < n; i++) {
            let wstIdx = -1;
            for (let j = 0; j < m; j++) {
                if (memoryBlocks[j].size >= processes[i].size) {
                    if (wstIdx == -1)
                        wstIdx = j;
                    else if (memoryBlocks[wstIdx].size <
                        memoryBlocks[j].size)
                        wstIdx = j;
                }
            }

            if (wstIdx != -1) {
                allocation[i] = wstIdx;
                memoryBlocks[wstIdx].size -= processes[i].size;
            }
        }

        console.log("\nProcess No.\t Process Size \t Block no.");
        for (let i = 0; i < n; i++) {
            console.log(" " + (i + 1) + "\t" + processes[i].size + "\t");
            if (allocation[i] != -1)
                console.log(allocation[i] + 1);
            else
                console.log("Not Allocated");
        }

    }
    
    return (
        <div className="virtual-lab">
            <div className="input-section">
                <input
                    type="number"
                    min={0}
                    value={processSize}
                    onChange={handleProcessSizeChange}
                    onKeyDown={handleEnter}
                />
                {simulation || <button onClick={handleAddProcess} >Add Process</button>}
            </div>

            {processes.length >= 1 &&
                <div className="table-section">
                    <table>
                        <thead>
                            <tr>
                                <th>Process Number</th>
                                <th>Process Size (in KB)</th>
                            </tr>
                        </thead>
                        {processes.map((block, index) => (
                            <tbody key={index}>
                                <>
                                    <tr>
                                        <td>{index + 1}</td>
                                        <td>{block.size}</td>
                                        {simulation ||
                                            <td>
                                                <button onClick={() => deleteProcess(index)}>Delete</button>
                                            </td>
                                        }
                                    </tr>
                                </>
                            </tbody>
                        ))}
                    </table>
                </div>}

            <form className="control-panel" onSubmit={handleSubmit}>
                <select value={allocationStrategy} onChange={handleAllocationStrategyChange}>
                    <option value="firstFit">First Fit</option>
                    <option value="bestFit">Best Fit</option>
                    <option value="nextFit">Next Fit</option>
                    <option value="worstFit">Worst Fit</option>
                </select>
                <button type='submit'>Start Simulation</button>
            </form>

            <div className="info-panel">
                <h2 className='info-head'>Current Memory State:</h2>

                <div className='memory-block'>
                    {!simulation ?
                        memoryBlocks.map((block) => {
                            return <div className='block' key={block.blockId} style={{ width: `${(block.size / totalBlockSize) * 10000}%`, maxWidth: '100%', backgroundColor: 'rgb(128 128 128 / 15%)', border: 'solid 1px black', borderRadius: '2px', margin: '1px', height: '100px' }}>
                            </div>
                        })
                        :
                        allocatedMemoryBlocks.map((fragment) => {
                            return <div
                                key={fragment.blockId}
                                className='fragment' style={{
                                    width: `${(fragment.size / totalBlockSize) * 1000}%`,
                                    backgroundColor: 'rgb(128 128 128 / 15%)',
                                    border: 'solid 1px black',
                                    maxWidth: '100%'
                                }}>
                                <div
                                    className='process' style={{
                                        width: `${(fragment.allocatedProcessSize / fragment.size) * 100}%`,
                                        maxWidth: '100%', backgroundColor: getRandomColor(),
                                        border: 'solid 1px white'
                                    }}>
                                </div>
                                <div style={{fontSize:'0.5rem'}}>{fragment.allocatedProcessSize} KB/ {fragment.size} KB</div>
                            </div>
                        })
                    }

                </div>
            </div>
            {/* <div>Current Process:</div> */}
        </div>
    );
};

export default VirtualLab;
