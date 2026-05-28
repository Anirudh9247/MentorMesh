import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MentorCard({ mentor, studentCity, isTopMatch = false }) {
  // Check if this card represents an AI match result
  const isAiMatched = mentor?.score !== undefined;
  const mentorProfile = isAiMatched ? mentor.mentor_data : mentor;
  const { user, domains, bio, avg_rating, session_count } = mentorProfile || {};
  
  // Extract matching details
  const matchScore = isAiMatched ? mentor.score : null;
  const matchReason = isAiMatched ? mentor.reason : null;

  // Check if this is a local match (same city)
  const isLocal = studentCity && user?.city && studentCity.toLowerCase().trim() === user.city.toLowerCase().trim();

  // 1. Score Counting Animation
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (isAiMatched && matchScore > 0) {
      let start = 0;
      const end = matchScore;
      const duration = 800; // 0.8s animation
      const stepTime = Math.max(Math.floor(duration / end), 12);
      
      const timer = setInterval(() => {
        start += 1;
        if (start >= end) {
          setDisplayScore(end);
          clearInterval(timer);
        } else {
          setDisplayScore(start);
        }
      }, stepTime);
      return () => clearInterval(timer);
    }
  }, [matchScore, isAiMatched]);

  // 2. Typing Match Reason Animation
  const [typedReason, setTypedReason] = useState('');
  useEffect(() => {
    if (isAiMatched && matchReason) {
      setTypedReason('');
      let index = 0;
      const timer = setInterval(() => {
        setTypedReason((prev) => prev + matchReason.charAt(index));
        index++;
        if (index >= matchReason.length) {
          clearInterval(timer);
        }
      }, 10); // typing speed (10ms per character)
      return () => clearInterval(timer);
    }
  }, [matchReason, isAiMatched]);

  // Helper to generate initials for avatar
  const getInitials = (name) => {
    if (!name) return 'MM';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Render rating stars
  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round((rating || 0) * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(
          <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-3.5 h-3.5 text-slate-700 fill-slate-700" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    return stars;
  };

  const userIdSeed = user?.id || 1;
  const replyTime = userIdSeed % 3 === 0 ? 'Replies in <1 hr' : userIdSeed % 3 === 1 ? 'Replies in <2 hrs' : 'Replies in <4 hrs';
  const mentorStyle = userIdSeed % 3 === 0 ? '🎯 Practical projects' : userIdSeed % 3 === 1 ? '💡 Career strategy' : '📖 Theory & research';

  const avState = mentorProfile?.availability_state || 'available';
  const avLabels = {
    available: { text: '🟢 Available', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    limited: { text: '🟠 Limited slots', class: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    busy: { text: '🔴 Fully Booked', class: 'text-red-400 bg-red-500/10 border-red-500/20' },
    offline: { text: '⚫ Offline', class: 'text-slate-500 bg-slate-500/10 border-slate-500/20' }
  };
  const currentAv = avLabels[avState] || avLabels['available'];

  return (
    <div className={`relative premium-card p-6 flex flex-col justify-between h-full transition-all duration-350 ${
      isTopMatch 
        ? 'premium-card-active shadow-[0_0_40px_-5px_rgba(99,102,241,0.25)] border border-glow-violet/30' 
        : 'hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)] hover:-translate-y-1'
    } animate-stagger-fade`}>
      
      {/* Badges Container - placed in relative layout flow at the top of the card */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 z-20">
        {isTopMatch && (
          <span className="py-1 px-3 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-yellow-500/35 text-yellow-400 text-[9px] font-black tracking-wider uppercase shadow-md flex items-center gap-1">
            🏆 Best Match
          </span>
        )}

        {isAiMatched && (
          <div className="flex items-center gap-1 py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black tracking-wider uppercase">
            ⚡ {displayScore}% Match
          </div>
        )}

        {isLocal && (
          <div className="flex items-center gap-1 py-1 px-3 rounded-full bg-glow-blue/15 border border-glow-blue/30 text-glow-blue text-[9px] font-black tracking-wider uppercase animate-pulse">
            📍 Local
          </div>
        )}

        {session_count === 0 && (
          <div className="flex items-center gap-1 py-1 px-3 rounded-full bg-glow-violet/15 border border-glow-violet/30 text-glow-violet text-[9px] font-black tracking-wider uppercase">
            🆕 New Guide
          </div>
        )}
      </div>

      {isTopMatch ? (
        /* Top Match 2-Column Responsive Layout */
        <div className="md:grid md:grid-cols-2 md:gap-8 flex-grow">
          {/* Left Column - Profile info */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {/* Profile Card Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl border border-white/8 shrink-0 overflow-hidden relative">
                  <div className="w-full h-full bg-gradient-to-tr from-glow-violet to-glow-blue flex items-center justify-center text-cyber-white font-extrabold text-lg">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.name)
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-cyber-white tracking-tight text-xl truncate">
                    {user?.name || 'Anonymous Mentor'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-slate-muted text-xs mt-1 font-semibold">
                    <span>📍 {user?.city || 'Unknown Location'}</span>
                    <span className="inline-flex items-center gap-1 ml-2 text-[9px] text-emerald-400 bg-emerald-500/10 py-0.5 px-1.5 border border-emerald-500/20 rounded-full font-bold uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating and Session Stats */}
              <div className="flex items-center gap-3 mb-4 py-1 px-2.5 rounded-lg bg-[#050505] border border-white/5 w-fit">
                <div className="flex items-center gap-1">
                  {renderStars(avg_rating)}
                  <span className="text-cyber-white text-[11px] font-black ml-1">{avg_rating?.toFixed(1) || '0.0'}</span>
                </div>
                <span className="text-white/10">|</span>
                <div className="text-[11px] text-slate-muted font-semibold">
                  <strong className="text-cyber-white">{session_count || 0}</strong> sessions
                </div>
              </div>

              {/* Personality Cues */}
              <div className="flex flex-wrap gap-1.5 mb-4 font-mono text-[9px]">
                <span className={`py-0.5 px-2 rounded border font-semibold ${currentAv.class}`}>
                  {currentAv.text}
                </span>
                <span className="py-0.5 px-2 rounded bg-[#050505] border border-white/5 text-slate-muted font-semibold">
                  ⏰ {replyTime}
                </span>
                <span className="py-0.5 px-2 rounded bg-[#050505] border border-white/5 text-glow-violet font-semibold">
                  {mentorStyle}
                </span>
              </div>

              {/* Bio Snippet */}
              <p className="text-slate-muted text-xs leading-relaxed font-medium mb-4">
                {bio || "This mentor hasn't filled out their bio yet."}
              </p>
            </div>

            {/* Domain Badges */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {domains && domains.map((domain, index) => (
                <span
                  key={index}
                  className="py-1 px-2.5 rounded-full bg-[#1E1E24] text-cyber-white text-[10px] font-bold tracking-tight"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column - Matching Coordinates */}
          <div className="flex flex-col justify-between mt-6 md:mt-0 space-y-4">
            {isAiMatched && (
              <div className="p-4 rounded-2xl bg-glow-violet/5 border border-white/5 text-xs leading-relaxed space-y-3 flex-grow">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-glow-violet uppercase tracking-widest block">AI Match Insights</span>
                  <div className="flex flex-wrap gap-1.5">
                    {isLocal && (
                      <span className="py-0.5 px-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[8px] font-bold rounded">
                        ✓ Same City
                      </span>
                    )}
                    {domains && domains.slice(0, 1).map((domain) => (
                      <span key={domain} className="py-0.5 px-1.5 bg-glow-violet/10 border border-glow-violet/20 text-glow-violet text-[8px] font-bold rounded">
                        ✓ {domain}
                      </span>
                    ))}
                  </div>
                </div>

                {matchReason && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[8px] font-black text-slate-dark uppercase tracking-widest block mb-1">Match Reason</span>
                    <p className="text-silver text-[11px] leading-normal font-sans typing-cursor">
                      {typedReason}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Link
              to={`/mentor/${user?.id}`}
              className="w-full py-3 px-4 rounded-xl bg-cyber-white text-black font-extrabold text-xs text-center uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:bg-silver"
            >
              View Full Profile
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        /* Standard Single-Column Card Layout */
        <div className="flex flex-col justify-between h-full flex-grow">
          <div>
            {/* Profile Card Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl border border-white/8 shrink-0 overflow-hidden relative">
                <div className="w-full h-full bg-gradient-to-tr from-glow-violet to-glow-blue flex items-center justify-center text-cyber-white font-extrabold text-lg transform group-hover:scale-[1.025] transition-all duration-400">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.name)
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-cyber-white tracking-tight text-base truncate group-hover:text-glow-blue transition-colors">
                  {user?.name || 'Anonymous Mentor'}
                </h3>
                <div className="flex items-center gap-1.5 text-slate-muted text-[11px] mt-1 font-semibold">
                  <span className="truncate">📍 {user?.city || 'Unknown Location'}</span>
                  <span className="inline-flex items-center gap-1 ml-2 text-[9px] text-emerald-400 bg-emerald-500/10 py-0.5 px-1.5 border border-emerald-500/20 rounded-full font-bold uppercase tracking-wider">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Rating and Session Stats */}
            <div className="flex items-center gap-3 mb-4 py-1 px-2.5 rounded-lg bg-[#050505] border border-white/5 w-fit">
              <div className="flex items-center gap-1">
                {renderStars(avg_rating)}
                <span className="text-cyber-white text-[11px] font-black ml-1">{avg_rating?.toFixed(1) || '0.0'}</span>
              </div>
              <span className="text-white/10">|</span>
              <div className="text-[11px] text-slate-muted font-semibold">
                <strong className="text-cyber-white">{session_count || 0}</strong> sessions
              </div>
            </div>

            {/* Personality Cues */}
            <div className="flex flex-wrap gap-1.5 mb-4 font-mono text-[9px]">
              <span className={`py-0.5 px-2 rounded border font-semibold ${currentAv.class}`}>
                {currentAv.text}
              </span>
              <span className="py-0.5 px-2 rounded bg-[#050505] border border-white/5 text-slate-muted font-semibold">
                ⏰ {replyTime}
              </span>
              <span className="py-0.5 px-2 rounded bg-[#050505] border border-white/5 text-glow-violet font-semibold">
                {mentorStyle}
              </span>
            </div>

            {/* Bio Snippet */}
            <p className="text-slate-muted text-xs line-clamp-2 mb-5 leading-relaxed font-medium">
              {bio || "This mentor hasn't filled out their bio yet."}
            </p>

            {/* Domain Badges */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {domains && domains.map((domain, index) => (
                <span
                  key={index}
                  className="py-1 px-2.5 rounded-full bg-[#1E1E24] text-cyber-white text-[10px] font-bold tracking-tight"
                >
                  {domain}
                </span>
              ))}
            </div>

            {/* AI Match Reason */}
            {isAiMatched && (
              <div className="mb-6 p-4 rounded-2xl bg-glow-violet/5 border border-white/5 text-xs leading-relaxed space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-glow-violet uppercase tracking-widest block">AI Match Insights</span>
                  <div className="flex flex-wrap gap-1.5">
                    {isLocal && (
                      <span className="py-0.5 px-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[8px] font-bold rounded">
                        ✓ Same City
                      </span>
                    )}
                    {domains && domains.slice(0, 1).map((domain) => (
                      <span key={domain} className="py-0.5 px-1.5 bg-glow-violet/10 border border-glow-violet/20 text-glow-violet text-[8px] font-bold rounded">
                        ✓ {domain}
                      </span>
                    ))}
                  </div>
                </div>

                {matchReason && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[8px] font-black text-slate-dark uppercase tracking-widest block mb-1">Match Reason</span>
                    <p className="text-silver text-[11px] leading-normal font-sans typing-cursor">
                      {typedReason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link
            to={`/mentor/${user?.id}`}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-cyber-white border border-white/8 font-extrabold text-[10px] text-center uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            View Full Profile
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
