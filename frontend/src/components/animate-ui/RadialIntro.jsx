import React from 'react';

export function RadialIntro({ orbitItems = [] }) {
  return (
    <div className="relative w-full h-[320px] flex items-center justify-center overflow-hidden">
      {/* Center Node */}
      <div className="relative z-20 w-14 h-14 rounded-full bg-gradient-to-tr from-glow-violet to-glow-blue flex items-center justify-center text-white font-extrabold text-base shadow-[0_0_25px_rgba(99,102,241,0.4)] animate-pulse">
        M
      </div>

      {/* Orbit Ring 1 (Inner) */}
      <div className="absolute w-[180px] h-[180px] rounded-full border border-white/5 animate-spin" style={{ animationDuration: '25s' }}>
        {orbitItems.slice(0, 3).map((item, idx) => {
          const angle = (idx * 360) / Math.min(3, orbitItems.slice(0, 3).length);
          return (
            <div
              key={item.id}
              className="absolute w-7 h-7 rounded-full border border-white/10 bg-dark-card overflow-hidden"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${angle}deg) translate(90px) rotate(-${angle}deg)`,
                margin: '-14px',
              }}
            >
              <img src={item.src} alt={item.name} className="w-full h-full object-cover" title={item.name} />
            </div>
          );
        })}
      </div>

      {/* Orbit Ring 2 (Outer) */}
      <div className="absolute w-[280px] h-[280px] rounded-full border border-white/5 animate-spin" style={{ animationDuration: '40s', animationDirection: 'reverse' }}>
        {orbitItems.slice(3, 8).map((item, idx) => {
          const angle = (idx * 360) / Math.min(5, orbitItems.slice(3, 8).length);
          return (
            <div
              key={item.id}
              className="absolute w-7 h-7 rounded-full border border-white/10 bg-dark-card overflow-hidden"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${angle}deg) translate(140px) rotate(-${angle}deg)`,
                margin: '-14px',
              }}
            >
              <img src={item.src} alt={item.name} className="w-full h-full object-cover" title={item.name} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
export { RadialIntro as default };
