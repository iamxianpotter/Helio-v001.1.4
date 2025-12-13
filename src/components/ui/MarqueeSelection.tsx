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
      className="fixed bg-white bg-opacity-40 border border-white/50 pointer-events-none z-[9999]"
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