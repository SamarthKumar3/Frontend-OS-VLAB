import { FunctionComponent, useState } from 'react';
import CanvasComponent from './Canvas';
import './Logic.css'

const Logic: FunctionComponent = () => {
  const [chunksCount, setChunksCount] = useState(4);
  const [queueCapacity, setQueueCapacity] = useState(4);
  const [scenario, setScenario] = useState('normal');
  const [key, setKey] = useState(0);

  const startModel = () => {
    setKey(prevKey => prevKey + 1);
  };

  return (
    <div className="page-layout">
      <div className="side-control">
        <div className="container">
          <div className="input-group">
            <input
              id="chunks-count"
              type="number"
              min="1"
              className="input"
              value={chunksCount}
              onChange={(e) => setChunksCount(Number(e.target.value))}
            />
            <label className="label">No. of Chunks</label>
          </div>
          <div className="input-group">
            <input
              id="queue-cap"
              type="number"
              min="1"
              max="6"
              className="input"
              value={queueCapacity}
              onChange={(e) => setQueueCapacity(Number(e.target.value))}
            />
            <label className="label">Queue Capacity</label>
          </div>
          <div className="input-group">
            <label className="label">Scenario</label>
            <select value={scenario} onChange={(e) => setScenario(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="boundary">Boundary</option>
              <option value="semaphore">Semaphore</option>
            </select>
          </div>
          <button id="options-apply" className="btn" onClick={startModel}>
            Apply
          </button>
        </div>
      </div>
      <div className="exp-vis">
        <div id="canvas-container">
          <CanvasComponent key={key} chunksCount={chunksCount} queueCapacity={queueCapacity} scenario={scenario} />
        </div>
      </div>
    </div>
  );
}

export default Logic;