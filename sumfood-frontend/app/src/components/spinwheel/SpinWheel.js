import React, { useRef, useState, useEffect } from 'react';
import './SpinWheel.css';

const SpinWheel = ({ 
  segments = [], 
  spinning = false,
  onSpinStart = () => {},
  onSpinEnd = () => {},
  prizeSegment = null
}) => {
  const wheelRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [segmentAngle, setSegmentAngle] = useState(360 / Math.max(segments.length, 1));
  const [winningSegment, setWinningSegment] = useState(null);

  useEffect(() => {
    // Update segment angle if number of segments changes
    if (segments.length > 0) {
      setSegmentAngle(360 / segments.length);
    }
  }, [segments]);

  useEffect(() => {
    if (spinning) {
      let targetSegmentIndex = 0;
      
      // If a prize segment is specified, find its index
      if (prizeSegment !== null) {
        const prizeIndex = segments.findIndex(segment => segment.id === prizeSegment);
        if (prizeIndex !== -1) {
          targetSegmentIndex = prizeIndex;
        }
      } else {
        // Otherwise choose a random segment
        targetSegmentIndex = Math.floor(Math.random() * segments.length);
      }
      
      // Calculate angle to stop at (ensure it's a multiple of 360 + the segment position)
      const segmentPosition = 360 - (targetSegmentIndex * segmentAngle) - (segmentAngle / 2);
      const extraSpins = 5; // Number of full 360 spins before stopping
      const targetAngle = 360 * extraSpins + segmentPosition;
      
      // Start with a high speed, then ease out
      const animateWheel = () => {
        // Reset the wheel position first to start fresh
        setRotation(0);
        
        // Use CSS animation to spin the wheel
        if (wheelRef.current) {
          // Apply the spinning animation
          wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.1, 0.25, 0.1, 1)';
          wheelRef.current.style.transform = `rotate(${targetAngle}deg)`;
          
          // Set the winning segment
          const winSegment = segments[targetSegmentIndex];
          setTimeout(() => {
            setWinningSegment(winSegment);
            setRotation(targetAngle % 360); // Keep track of final position
            onSpinEnd(winSegment);
          }, 5000); // Match animation duration
        }
      };
      
      animateWheel();
    } else {
      // Reset winning segment when not spinning
      setWinningSegment(null);
      
      if (wheelRef.current) {
        // Remove transition when not spinning
        wheelRef.current.style.transition = 'none';
      }
    }
  }, [spinning, segmentAngle, segments, prizeSegment, onSpinEnd]);

  return (
    <div className="spin-wheel-container">
      <div 
        ref={wheelRef} 
        className={`wheel ${spinning ? 'spinning' : ''}`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {segments.map((segment, index) => {
          // Calculate rotation for this segment
          const startAngle = index * segmentAngle;
          
          return (
            <div
              key={segment.id}
              className="wheel-segment"
              style={{
                backgroundColor: segment.color,
                transform: `rotate(${startAngle}deg) skewY(${90 - segmentAngle}deg)`,
                transformOrigin: 'bottom right',
                width: '50%',
                height: '50%',
                position: 'absolute',
                right: '50%',
                bottom: '50%',
                borderLeft: '1px solid #fff',
              }}
            >
              <div 
                className="segment-content"
                style={{
                  transform: `skewY(${-(90 - segmentAngle)}deg) rotate(${segmentAngle / 2}deg)`,
                }}
              >
                <span className="segment-text">{segment.text}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="wheel-center"></div>
    </div>
  );
};

export default SpinWheel;
