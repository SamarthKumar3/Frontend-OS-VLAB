import React, { useEffect, useRef } from 'react';

const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 500;
      canvas.height = 500;
    }
  }, []);

  return <canvas id="canvas" ref={canvasRef} />;
};

export default CanvasComponent;