import React, { useState } from 'react';

export function RippleButton({ children, onClick, className = '', variant = 'primary', size = 'default' }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size: Math.max(rect.width, rect.height) * 2,
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    if (onClick) {
      onClick(e);
    }
  };

  const removeRipple = (id) => {
    setRipples(prev => prev.filter(r => r.id !== id));
  };

  const baseStyles = 'relative overflow-hidden font-extrabold rounded-full interactive-element inline-flex items-center justify-center cursor-pointer';
  
  const variants = {
    primary: 'bg-cyber-white text-black hover:scale-103 shadow-lg',
    secondary: 'bg-white/5 hover:bg-white/10 text-cyber-white border border-white/8',
  };

  const sizes = {
    default: 'py-3.5 px-8 text-sm',
    sm: 'py-2 px-5 text-xs',
    icon: 'w-10 h-10 p-0',
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          onAnimationEnd={() => removeRipple(ripple.id)}
          className="absolute rounded-full bg-black/10 dark:bg-white/15 animate-ripple pointer-events-none"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </button>
  );
}
export { RippleButton as default };
