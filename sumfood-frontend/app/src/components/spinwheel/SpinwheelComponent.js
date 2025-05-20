import React, { useState } from 'react';
import '../../styles/spinwheel.css';

const SpinwheelComponent = ({ items = [], onSpinComplete, readOnly = false }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);

  // Simple implementation for testing
  const spinWheel = () => {
    if (spinning || readOnly || items.length === 0) return;
    
    setSpinning(true);
    setResult(null);
    
    // Select a random item
    const selectedItem = items[Math.floor(Math.random() * items.length)];
    
    // Add animation
    const newRotation = rotation + 1800 + Math.random() * 360;
    setRotation(newRotation);
    
    // After animation completes, set the result
    setTimeout(() => {
      setResult(selectedItem);
      setSpinning(false);
      if (onSpinComplete) {
        onSpinComplete(selectedItem);
      }
    }, 3000);
  };

  return (
    <div className="spinwheel-container">
      <div 
        className={`spinwheel ${spinning ? 'spinning' : ''}`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {items.length === 0 ? (
          <div className="empty-wheel">No items added</div>
        ) : (
          <div className="wheel-items">
            {/* Simplified wheel visualization for testing */}
            <div className="wheel-display">Spinwheel</div>
          </div>
        )}
      </div>
      
      <div className="spinwheel-controls">
        {!readOnly && (
          <button 
            className="spin-button" 
            onClick={spinWheel} 
            disabled={spinning || items.length === 0}
          >
            {spinning ? 'Spinning...' : 'SPIN'}
          </button>
        )}
        
        {result && (
          <div className="spin-result">
            <h4>Result: {result.name}</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinwheelComponent;
