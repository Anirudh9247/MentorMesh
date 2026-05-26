import React from 'react';
import { Link } from 'react-router-dom';

export default function MentorCard({ mentor, studentCity }) {
  // Check if this card represents an AI match result
  const isAiMatched = mentor?.score !== undefined;
  const mentorProfile = isAiMatched ? mentor.mentor_data : mentor;
  const { user, domains, bio, avg_rating, session_count } = mentorProfile || {};
  
  // Extract matching details
  const matchScore = isAiMatched ? mentor.score : null;
  const matchReason = isAiMatched ? mentor.reason : null;

  // Check if this is a local match (same city)
  const isLocal = studentCity && user?.city && studentCity.toLowerCase().trim() === user.city.toLowerCase().trim();

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

  // Render gold rating stars
  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round((rating || 0) * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i - 0.5 === roundedRating) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="halfStarGradCard">
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#475569" />
              </linearGradient>
            </defs>
            <path fill="url(#halfStarGradCard)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-4 h-4 text-slate-600 fill-slate-600" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div className={`relative group p-6 rounded-3xl transition-all duration-300 border flex flex-col justify-between h-full ${
      isLocal 
        ? 'bg-gradient-to-br from-primary-950/40 to-dark-900/60 border-primary-500/30 shadow-lg shadow-primary-950/20 hover:border-primary-400/50' 
        : 'bg-dark-900/40 hover:bg-dark-900/60 border-slate-800 hover:border-slate-700'
    } backdrop-blur-xl`}>
      
      {/* Badges Container */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 flex-wrap justify-end">
        {/* AI Match Score Badge */}
        {isAiMatched && (
          <div className="flex items-center gap-1 py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wider uppercase shadow-sm">
            ⚡ {matchScore}% Match
          </div>
        )}

        {/* Local Match Badge */}
        {isLocal && (
          <div className="flex items-center gap-1 py-1 px-3 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-bold tracking-wide animate-pulse">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            Local Match
          </div>
        )}
      </div>

      <div>
        {/* Profile Card Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0 animate-pulse-subtle">
            {getInitials(user?.name)}
          </div>
          
          <div className="flex-1 min-w-0 pr-24">
            <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors duration-300 truncate">
              {user?.name || 'Anonymous Mentor'}
            </h3>
            
            <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
              <svg className="w-4 h-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="truncate">{user?.city || 'Unknown Location'}</span>
            </div>
          </div>
        </div>

        {/* Rating and Session Stats */}
        <div className="flex items-center gap-3 mb-4 py-1.5 px-3 rounded-xl bg-dark-950/60 border border-slate-800 w-fit">
          <div className="flex items-center gap-1">
            {renderStars(avg_rating)}
            <span className="text-white text-sm font-bold ml-1">{avg_rating?.toFixed(1) || '0.0'}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-xs text-slate-400">
            <strong className="text-slate-200">{session_count || 0}</strong> sessions completed
          </div>
        </div>

        {/* Bio Snippet */}
        <p className="text-slate-300 text-sm line-clamp-3 mb-5 leading-relaxed">
          {bio || "This mentor hasn't filled out their bio yet."}
        </p>

        {/* Domain Badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {domains && domains.length > 0 ? (
            domains.map((domain, index) => (
              <span
                key={index}
                className="py-1 px-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-300 text-xs font-medium"
              >
                {domain}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">No specific domains listed</span>
          )}
        </div>

        {/* AI Match Reason Badge (Vibrant addition for AI view) */}
        {isAiMatched && matchReason && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-350 text-xs leading-relaxed flex items-start gap-2.5 animate-pulse-subtle">
            <span className="text-base shrink-0 select-none">💡</span>
            <div>
              <strong className="text-slate-250 font-bold block mb-0.5">Match Reason:</strong>
              {matchReason}
            </div>
          </div>
        )}
      </div>

      {/* Button */}
      <Link
        to={`/mentor/${user?.id}`}
        className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-center transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
          isLocal || isAiMatched
            ? 'bg-primary-500 hover:bg-primary-400 text-dark-950 shadow-lg shadow-primary-500/15'
            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
        }`}
      >
        View Full Profile
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
