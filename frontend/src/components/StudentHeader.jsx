import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeTogglerButton } from './animate-ui/ThemeTogglerButton';
import { NotificationList } from './animate-ui/NotificationList';

export default function StudentHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const studentDetails = localStorage.getItem('studentDetails');
    if (studentDetails) {
      setStudent(JSON.parse(studentDetails));
    }
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/');
  };

  const navLinks = [
    { name: 'Browse Mentors', path: '/browse' },
    { name: 'Dashboard', path: '/student-dashboard' },
    { name: 'Data Showcase', path: '/results' },
    { name: 'Workspace Chat', path: '/chat' },
  ];

  return (
    <header className="sticky top-4 z-40 mx-4 md:mx-8 h-16 rounded-full border border-white/8 glass-nav px-6 flex items-center justify-between interactive-element">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-glow-violet to-glow-blue flex items-center justify-center text-white font-extrabold text-sm">
            M
          </div>
          <span className="text-base font-black text-cyber-white tracking-tight hidden sm:inline">
            MentorMesh
          </span>
        </Link>
      </div>

      <nav className="flex items-center gap-1 md:gap-4">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`py-1.5 px-3 rounded-full text-xs font-bold interactive-element cursor-pointer ${
                isActive
                  ? 'bg-white/10 text-cyber-white border border-white/10 shadow-inner'
                  : 'text-slate-muted hover:text-cyber-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 relative">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-full border border-white/8 flex items-center justify-center bg-white/5 hover:bg-white/10 text-cyber-white interactive-element cursor-pointer relative"
            aria-label="Notifications"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-glow-violet rounded-full animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 z-50">
              <NotificationList />
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <ThemeTogglerButton />

        <div className="hidden lg:flex flex-col text-right">
          <span className="text-xs font-bold text-cyber-white">{student?.name || 'Student'}</span>
          <span className="text-[10px] text-glow-blue font-black tracking-wider uppercase">
            {student?.city}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="py-1.5 px-4 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-silver font-bold text-xs interactive-element cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

  );
}
