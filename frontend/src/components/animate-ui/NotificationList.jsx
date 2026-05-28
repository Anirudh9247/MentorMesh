import React, { useState } from 'react';

export function NotificationList({ notifications = [] }) {
  const defaultNotifications = [
    { id: 1, title: 'Request Accepted', message: 'Harsha approved your meeting on Algorithmic Architecture.', time: '5m ago', read: false },
    { id: 2, title: 'High Compatibility Match', message: 'Raj matched your learning coordinate target by 95%.', time: '1h ago', read: false },
    { id: 3, title: 'Workspace Initialized', message: 'Direct workspace is now open with Harsha.', time: '2h ago', read: true },
  ];

  const [list, setList] = useState(notifications.length > 0 ? notifications : defaultNotifications);

  const markAllRead = () => {
    setList(list.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="w-80 rounded-2xl border border-white/8 bg-dark-card p-4 shadow-2xl glass-panel text-left interactive-element text-silver">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
        <h4 className="font-bold text-[10px] text-cyber-white uppercase tracking-wider">Alert Center</h4>
        <button onClick={markAllRead} className="text-[10px] text-glow-blue hover:underline cursor-pointer">
          Mark all read
        </button>
      </div>
      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {list.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-muted">No pings at present.</div>
        ) : (
          list.map((item) => (
            <div 
              key={item.id} 
              className={`p-2.5 rounded-xl border border-white/5 transition-all duration-300 hover:bg-white/5 ${
                !item.read ? 'bg-glow-violet/5 border-l-2 border-l-glow-violet' : 'bg-transparent'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-[11px] text-cyber-white">{item.title}</span>
                <span className="text-[9px] text-slate-muted">{item.time}</span>
              </div>
              <p className="text-[11px] text-slate-muted mt-1 leading-snug">{item.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
