import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function StudentHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

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

      <div className="flex items-center gap-3">
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
