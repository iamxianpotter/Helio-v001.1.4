import React from 'react';

interface MarqueeSelectionProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const MarqueeSelection: React.FC<MarqueeSelectionProps> = ({ startX, startY, endX, endY }) => {
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  if (width === 0 || height === 0) {
    return null;
  }

  return (
    <div
      className="absolute border border-dashed border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none"
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        zIndex: 9999,
      }}
    />
  );
};

export default MarqueeSelection;
