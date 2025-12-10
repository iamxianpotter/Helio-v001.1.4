import React from 'react';

interface MarqueeSelectionProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MarqueeSelection: React.FC<MarqueeSelectionProps> = ({ x, y, width, height }) => {
  return (
    <div
      className="fixed bg-blue-500 bg-opacity-20 border border-blue-500 pointer-events-none z-[9999]"
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    />
  );
};

export default MarqueeSelection;