import React, { useState } from 'react';

export function TabGroup({ defaultValue, children, className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const elements = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { activeTab, setActiveTab });
    }
    return child;
  });

  return <div className={`w-full ${className}`}>{elements}</div>;
}

export function TabList({ children, activeTab, setActiveTab, className = '' }) {
  const elements = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { activeTab, setActiveTab });
    }
    return child;
  });

  return (
    <div className={`flex border-b border-white/5 mb-6 gap-6 ${className}`}>
      {elements}
    </div>
  );
}

export function Tab({ value, children, activeTab, setActiveTab, className = '' }) {
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
        isActive 
          ? 'border-glow-violet text-cyber-white' 
          : 'border-transparent text-slate-muted hover:text-cyber-white'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabPanels({ children, activeTab, className = '' }) {
  const elements = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { activeTab });
    }
    return child;
  });

  return <div className={`${className}`}>{elements}</div>;
}

export function TabPanel({ value, children, activeTab, className = '' }) {
  if (activeTab !== value) return null;

  return (
    <div className={`animate-stagger-fade ${className}`}>
      {children}
    </div>
  );
}
