import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StarsBackground } from '../components/animate-ui/StarsBackground';
import { RippleButton } from '../components/animate-ui/RippleButton';
import MentorMap from '../components/MentorMap';
import client from '../api/client';

export default function Welcome() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [mapMentors, setMapMentors] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      setIsLoggedIn(true);
      const user = JSON.parse(userStr);
      setUserRole(user.role);
    }
  }, []);

  useEffect(() => {
    const fetchPublicMentors = async () => {
      try {
        const res = await client.get('/mentors');
        setMapMentors(res.data);
      } catch (e) {
        console.error("Failed to load map mentors:", e);
      }
    };
    fetchPublicMentors();
  }, []);

  const handleHeroCta = () => {
    if (isLoggedIn) {
      navigate(userRole === 'mentor' ? '/mentor-dashboard' : '/browse');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-dark-canvas text-silver relative overflow-hidden flex flex-col justify-between bg-grid-dots">
      {/* Stars Background */}
      <StarsBackground className="absolute inset-0 z-0 opacity-20 pointer-events-none" />

      {/* Spotlight Ambient Glow */}
      <div className="radial-spotlight"></div>
      
      {/* Floating fixed glassmorphic Header */}
      <header className="fixed top-4 left-4 right-4 md:left-8 md:right-8 h-16 rounded-full border border-white/8 glass-nav z-50 px-6 flex items-center justify-between interactive-element">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-glow-violet to-glow-blue flex items-center justify-center text-white font-extrabold text-sm">
            M
          </div>
          <span className="text-lg font-black text-cyber-white tracking-tight">
            MentorMesh
          </span>
        </div>

        <nav className="flex items-center gap-4">
          {isLoggedIn ? (
            <button
              onClick={handleHeroCta}
              className="py-2 px-5 rounded-full bg-white text-black font-extrabold text-xs interactive-element hover:scale-103 cursor-pointer shadow-lg hover:shadow-white/10"
            >
              Go to Workspace
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-muted hover:text-cyber-white font-bold text-xs interactive-element cursor-pointer"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="py-2 px-5 rounded-full bg-cyber-white text-black font-extrabold text-xs interactive-element hover:scale-103 cursor-pointer shadow-lg hover:shadow-white/15"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow pt-32 pb-16 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center justify-center relative z-10 w-full">
        <div className="text-center max-w-3xl space-y-6 animate-stagger-fade">
          <div className="inline-flex py-1 px-3 bg-white/5 border border-white/8 rounded-full text-[10px] font-black uppercase tracking-wider text-glow-blue shadow-inner">
            ⚡ Reimagining Peer Mentorship
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-cyber-white tracking-tight leading-none bg-gradient-to-b from-white via-white to-slate-muted bg-clip-text text-transparent">
            Master the Future.<br />Learn with Experts.
          </h1>
          
          <p className="text-slate-muted text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            Connect with skilled engineering, research, and design guides in your city. Outline your custom targets and let our AI alignment router rank availability, locations, and skills.
          </p>

          <div className="pt-4">
            <RippleButton
              onClick={handleHeroCta}
              className="shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]"
            >
              {isLoggedIn ? "Access Workspace" : "Explore Mentors Now"}
            </RippleButton>
          </div>
        </div>

        {/* Real-World Map Showcase */}
        <section className="w-full max-w-4xl mx-auto mt-16 animate-stagger-fade delay-100 flex flex-col items-center z-10 w-full">
          <span className="text-[9px] font-black text-glow-blue uppercase tracking-widest block mb-4">
            Live Mentor Network Map // Guides Online
          </span>
          <div className="w-full h-[450px] rounded-3xl overflow-hidden border border-white/8 shadow-2xl relative bg-[#050505]/40 backdrop-blur-md">
            {mapMentors.length > 0 ? (
              <MentorMap mentors={mapMentors} studentCity="Hyderabad" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-muted gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border border-white/20 border-t-white"></div>
                <span>Syncing live guide coordinates...</span>
              </div>
            )}
          </div>
        </section>

        {/* Bento Feature Grid */}
        <section className="w-full mt-24 grid grid-cols-1 md:grid-cols-4 gap-6 animate-stagger-fade delay-200">
          
          {/* Bento Card 1: AI Matchmaker */}
          <div className="md:col-span-2 premium-card p-8 flex flex-col justify-between min-h-[220px] interactive-element group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-glow-violet/10 border border-glow-violet/20 flex items-center justify-center text-glow-violet">
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-cyber-white">Dual-Provider Match Engine</h3>
              <p className="text-slate-muted text-xs leading-relaxed max-w-sm">
                Router system that computes compatibility using OpenAI GPT-4o and Claude 3.5. Computes overlap scores based on text context.
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-dark mt-4">
              AI MATCHING METRIC // STABLE ROUTING
            </div>
          </div>

          {/* Bento Card 2: Animated Graph */}
          <div className="premium-card p-6 flex flex-col justify-between min-h-[220px] interactive-element relative overflow-hidden group">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M10,120 Q50,70 90,130 T170,80" 
                  stroke="#38BDF8" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeDasharray="600"
                  className="animate-line-graph"
                />
                <circle cx="90" cy="130" r="4" fill="#6366F1" />
                <circle cx="170" cy="80" r="4" fill="#38BDF8" />
              </svg>
            </div>
            
            <div className="relative z-10 space-y-2">
              <h3 className="text-sm font-bold text-cyber-white">Locality Routing</h3>
              <p className="text-slate-muted text-[11px] leading-relaxed">
                Connects you with matches in your city for offline session alignment.
              </p>
            </div>
            <div className="relative z-10 text-[9px] font-mono text-glow-blue uppercase tracking-widest font-black">
              ⚡ LIVE GEOMETRY MESH
            </div>
          </div>

          {/* Bento Card 3: Intent Gating */}
          <div className="premium-card p-6 flex flex-col justify-between min-h-[220px] interactive-element group">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-glow-blue/10 border border-glow-blue/20 flex items-center justify-center text-glow-blue">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-cyber-white">Intent-Gated Requests</h3>
              <p className="text-slate-muted text-[11px] leading-relaxed">
                Filter low-effort interactions. 3-step intent validation requires clear learning targets.
              </p>
            </div>
            <div className="text-[9px] font-mono text-slate-dark uppercase">
              Intent Wizard gating
            </div>
          </div>
          
          {/* Bento Card 4: Dashboard Integration */}
          <div className="md:col-span-4 premium-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 interactive-element group">
            <div className="space-y-2 max-w-xl">
              <span className="text-[9px] font-mono text-glow-violet uppercase tracking-widest font-black">
                Performance Dashboard
              </span>
              <h3 className="text-lg font-bold text-cyber-white">Track Milestones & Goals</h3>
              <p className="text-slate-muted text-xs leading-relaxed">
                A structured overview that tracks your academic or technical growth. Log study statistics, review feedback loops, and manage active scheduling coordinates.
              </p>
            </div>
            <button 
              onClick={handleHeroCta}
              className="py-2.5 px-6 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-cyber-white group-hover:border-glow-violet/30 interactive-element cursor-pointer self-start md:self-auto"
            >
              Get Started →
            </button>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t border-white/5 relative z-10 w-full mt-24">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-dark">
          <div>© {new Date().getFullYear()} MentorMesh Inc. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-muted transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-muted transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-muted transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
