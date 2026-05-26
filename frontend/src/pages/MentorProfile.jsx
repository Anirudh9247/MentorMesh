import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function MentorProfile() {
  const { id } = useParams(); // user_id of the mentor
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Connection modal state (Day 4 preview)
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [studentCity, setStudentCity] = useState('');

  // Fetch mentor profile details
  useEffect(() => {
    const fetchMentorDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await client.get(`/mentors/${id}`);
        setMentor(res.data);
        
        // Grab student city from details saved during Browse load
        const studentDetails = localStorage.getItem('studentDetails');
        if (studentDetails) {
          const sObj = JSON.parse(studentDetails);
          setStudentCity(sObj.city || '');
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load mentor profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-slate-400 font-semibold">Loading profile...</p>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex flex-col justify-center items-center p-6 text-center">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-3xl mb-4 text-red-400">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-bold">{error || 'Mentor not found'}</span>
        </div>
        <Link to="/browse" className="py-2.5 px-6 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 transition-all duration-300">
          Back to Browse
        </Link>
      </div>
    );
  }

  const { user, domains, bio, max_sessions_per_month, what_ill_discuss, avg_rating, session_count } = mentor;
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
    const roundedRating = Math.round(rating * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i - 0.5 === roundedRating) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-amber-400" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="halfStarGradProfile">
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#475569" />
              </linearGradient>
            </defs>
            <path fill="url(#halfStarGradProfile)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-5 h-5 text-slate-600 fill-slate-600" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-950/15 via-dark-950 to-dark-950 pb-20">
      
      {/* Navigation bar */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link to="/browse" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-400 transition-colors duration-300 font-semibold group text-sm">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Browse
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile details - Left column (2 columns wide) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="bg-dark-900/40 border border-slate-900 backdrop-blur-xl p-8 rounded-3xl shadow-lg relative overflow-hidden">
            {isLocal && (
              <div className="absolute top-6 right-6 flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-black tracking-wider uppercase animate-pulse">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Local Match
              </div>
            )}
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-3xl shadow-xl shadow-indigo-950/20 shrink-0">
                {getInitials(user?.name)}
              </div>
              
              <div className="text-center md:text-left space-y-3">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{user?.name}</h1>
                
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-slate-400 text-sm">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {user?.city}
                  </span>
                  <span className="text-slate-700">•</span>
                  <span className="text-slate-300 font-bold bg-slate-800/40 py-1 px-3 border border-slate-700/30 rounded-lg">
                    Mentor Account
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center md:justify-start gap-2.5 pt-2">
                  <div className="flex items-center gap-1">
                    {renderStars(avg_rating)}
                  </div>
                  <span className="text-white text-base font-extrabold">{avg_rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400 text-sm">
                    <strong className="text-slate-200">{session_count || 0}</strong> completed sessions
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About & Bio Card */}
          <div className="bg-dark-900/40 border border-slate-900 backdrop-blur-xl p-8 rounded-3xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-3">About Me</h2>
              <p className="text-slate-300 text-base leading-relaxed whitespace-pre-line">
                {bio || "This mentor hasn't provided a bio yet."}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-3">Expertise & Domains</h2>
              <div className="flex flex-wrap gap-2">
                {domains && domains.length > 0 ? (
                  domains.map((domain, index) => (
                    <span
                      key={index}
                      className="py-1.5 px-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-slate-200 text-xs font-semibold"
                    >
                      {domain}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500 italic">No specific domains listed</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel - Right column (1 column wide) */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-dark-900/50 to-slate-900/30 border border-slate-900 backdrop-blur-xl p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Availability</h3>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-900 text-sm">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="text-slate-400 text-xs">Monthly Session Limit</div>
                  <div className="text-slate-200 font-bold">{max_sessions_per_month} sessions max</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">Discussion Topics</h3>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/30 p-4 rounded-2xl border border-slate-900/80">
                {what_ill_discuss || "Topics have not been specified. Reach out to coordinate an agenda!"}
              </p>
            </div>

            {/* Connect Call-to-action */}
            <button
              onClick={() => setShowConnectModal(true)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black text-base shadow-lg shadow-primary-600/15 hover:shadow-primary-500/25 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              Request Connection
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* Connection Modal (Day 4 Preview Dialog) */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-md" onClick={() => setShowConnectModal(false)}></div>
          
          {/* Dialog box */}
          <div className="bg-dark-900 border border-slate-800 p-8 rounded-3xl max-w-lg w-full relative z-10 shadow-2xl space-y-6">
            <button 
              onClick={() => setShowConnectModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center justify-center p-2.5 bg-primary-500/10 rounded-2xl border border-primary-500/20 text-primary-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-white">Intent-Gated Connection</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                MentorMesh eliminates cold, generic networking requests. To request a session with <strong>{user?.name}</strong>, you will need to fill out 3 structured questions.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl space-y-3 text-xs leading-relaxed text-slate-400">
              <div className="font-bold text-slate-300">The 3 Required Questions (Day 4 Feature):</div>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>What specifically do you want to learn or achieve?</li>
                <li>What have you already tried or explored on your own?</li>
                <li>What is your concrete ask for the first session?</li>
              </ol>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer border border-slate-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  alert("Day 4 Intent-Gated request flow is coming up in our roadmap! Stay tuned.");
                  setShowConnectModal(false);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-400 text-dark-950 font-bold text-sm cursor-pointer transition-colors"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
