import React, { useState } from 'react';

export function FlipCard({ frontContent, backContent, className = '' }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`perspective-1000 w-full h-full cursor-pointer ${className}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden z-10 w-full h-full">
          {frontContent}
        </div>
        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 z-0 w-full h-full">
          {backContent}
        </div>
      </div>
    </div>
  );
}
