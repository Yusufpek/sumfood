/* eslint-disable react-hooks/exhaustive-deps */
// src/components/spinwheel/SpinWheel.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './SpinWheel.css'; // Import the CSS for this component

// Default items for the wheel if none are provided
const DEFAULT_ITEMS = [
  { text: "$100", color: "#FFD700" },
  { text: "Try Again", color: "#FF6347" },
  { text: "$500", color: "#ADFF2F" },
  // Add more default items if needed
];

const degToRad = (deg) => deg * (Math.PI / 180);

function SpinWheel({
  items,
  wheelSize = 360,
  spinDuration = 5,
  minSpins = 3,
  maxSpins = 8,
  onSpinEnd,
}) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const wheelRef = useRef(null);

  const currentItems = items && items.length > 0 ? items : DEFAULT_ITEMS;
  const numItems = currentItems.length;

  const segmentAngleDeg = numItems > 0 ? 360 / numItems : 360;
  const radius = wheelSize / 2;
  const centerX = radius;
  const centerY = radius;
  const pointerSize = wheelSize * 0.1; // Relative pointer size

  const segments = numItems > 0 ? currentItems.map((item, index) => {
    const startAngleDeg = index * segmentAngleDeg;
    const endAngleDeg = (index + 1) * segmentAngleDeg;
    const startAngleRad = degToRad(startAngleDeg);
    const endAngleRad = degToRad(endAngleDeg);

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const pathData = `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${segmentAngleDeg > 180 ? 1 : 0},1 ${x2},${y2} Z`;

    const midAngleDeg = startAngleDeg + segmentAngleDeg / 2;
    const midAngleRad = degToRad(midAngleDeg);
    const textRadius = radius * 0.65;
    const textX = centerX + textRadius * Math.cos(midAngleRad);
    const textY = centerY + textRadius * Math.sin(midAngleRad);
    const textRotation = midAngleDeg;

    return {
      pathData,
      fill: item.color || '#CCCCCC',
      text: item.text,
      fontColor: item.fontColor || '#000000',
      textX,
      textY,
      textRotation,
      originalItem: item,
    };
  }) : [];

  const handleSpin = useCallback(() => {
    if (spinning || numItems === 0) return;
    setSpinning(true);
    setSelectedItem(null);
    const randomExtraSpins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    const randomFinalAngle = Math.random() * 360;
    const newTargetRotation = rotation + (randomExtraSpins * 360) + randomFinalAngle;
    setRotation(newTargetRotation);
  }, [spinning, numItems, maxSpins, minSpins, rotation]);

  useEffect(() => {
    const wheelElement = wheelRef.current;
    if (!wheelElement || numItems === 0) return;

    const handleTransitionEnd = () => {
      if (!spinning) return;
      const finalRotationAngle = rotation % 360;
      let pointerEffectiveAngle = (360 - finalRotationAngle) % 360;
      if (pointerEffectiveAngle < 0) pointerEffectiveAngle += 360;
      const winningIndex = Math.floor(pointerEffectiveAngle / segmentAngleDeg);
      const winnerSegment = segments[winningIndex % numItems];
      const winner = winnerSegment ? winnerSegment.originalItem : null;

      if (winner) {
        setSelectedItem(winner);
        setShowModal(true);
      }
      setSpinning(false);
      if (onSpinEnd && winner) {
        onSpinEnd(winner);
      }
    };

    if (spinning) {
      wheelElement.addEventListener('transitionend', handleTransitionEnd);
    }
    return () => {
      if (wheelElement) {
        wheelElement.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [spinning, rotation, segments, segmentAngleDeg, numItems, onSpinEnd]);

  const closeResultModal = () => {
    setShowModal(false);
  };

  const fontSize = Math.max(8, Math.min(16, Math.floor(wheelSize / Math.max(15, numItems * 1.2))));

  if (numItems === 0) {
    return (
      <div className="spin-wheel-wrapper" style={{ width: wheelSize, height: wheelSize + 100 }}>
        <div className="spin-wheel-empty" style={{ width: wheelSize, height: wheelSize }}>
          <p>Wheel is empty.</p>
        </div>
        <button className="spin-button" disabled>SPIN!</button>
      </div>
    );
  }

  return (
    <div className="spin-wheel-wrapper">
      <div className="spin-wheel-container" style={{ width: wheelSize, height: wheelSize }}>
        <svg
          viewBox={`0 0 ${wheelSize} ${wheelSize}`}
          className="spin-wheel-svg"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? `transform ${spinDuration}s cubic-bezier(0.25, 0.1, 0.25, 1)` : 'none',
          }}
          ref={wheelRef}
        >
          <g>
            {segments.map((segment, index) => (
              <g key={`segment-${index}`} className="spin-wheel-segment-group">
                <path 
                    d={segment.pathData} 
                    fill={segment.fill} 
                    className="spin-wheel-segment-path" 
                />
                <text
                  x={segment.textX}
                  y={segment.textY}
                  transform={`rotate(${segment.textRotation}, ${segment.textX}, ${segment.textY})`}
                  fill={segment.fontColor}
                  style={{ fontSize: `${fontSize}px` }}
                  className="spin-wheel-segment-text"
                >
                  {segment.text}
                </text>
              </g>
            ))}
          </g>
        </svg>
        <div className="spin-wheel-pointer" style={{
          borderTopWidth: `${pointerSize * 0.7}px`,
          borderBottomWidth: `${pointerSize * 0.7}px`,
          borderLeftWidth: `${pointerSize}px`,
          transform: `translateX(${pointerSize * 0.4}px) translateY(-${pointerSize * 0.4}px) rotate(180deg)`
      }}/>
        <div className="spin-wheel-center-pin" style={{ width: wheelSize * 0.1, height: wheelSize * 0.1 }}/>
      </div>
      <button
        onClick={handleSpin}
        disabled={spinning || numItems === 0}
        className="spin-button"
      >
        {spinning ? 'Spinning...' : 'SPIN!'}
      </button>

      {showModal && selectedItem && (
        <div className="spin-wheel-modal-overlay">
          <div className="spin-wheel-modal-content">
            <h2 className="spin-wheel-modal-title">🎉 Prize! 🎉</h2>
            <p className="spin-wheel-modal-text">You landed on:</p>
            <p className="spin-wheel-modal-prize-name" style={{ color: selectedItem.color || '#333' }}>
              {selectedItem.text || selectedItem.name}
            </p>
            <button onClick={closeResultModal} className="spin-wheel-modal-button">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpinWheel;
