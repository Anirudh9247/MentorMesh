import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import client from '../api/client';
import IntentForm from '../components/IntentForm';

// Helper to color-code domains per design guidelines
const getDomainColor = (domain) => {
  const d = domain.toLowerCase();
  if (d.includes('ai') || d.includes('machine') || d.includes('learning')) return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
  if (d.includes('web') || d.includes('frontend') || d.includes('backend') || d.includes('dev')) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
  if (d.includes('data') || d.includes('science') || d.includes('sql') || d.includes('analyst')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (d.includes('cloud') || d.includes('devops') || d.includes('aws')) return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
  if (d.includes('design') || d.includes('ui') || d.includes('ux') || d.includes('figma')) return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
  if (d.includes('research') || d.includes('academic') || d.includes('paper')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  if (d.includes('finance') || d.includes('business')) return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
  return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
};

export default function MentorProfile() {
  const { id } = useParams(); // user_id of the mentor
  const navigate = useNavigate();
  const location = useLocation();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Match score & caching state
  const [matchScore, setMatchScore] = useState(null);
  const [matchReason, setMatchReason] = useState(null);

  // Connection modal state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [studentCity, setStudentCity] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);
  
  // Review submission state hooks
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewNote.trim()) return;
    setReviewSubmitting(true);
    try {
      await client.post(`/mentors/${id}/reviews`, {
        rating: reviewRating,
        note: reviewNote
      });
      alert("Review submitted successfully! Recalculating ratings...");
      setShowReviewModal(false);
      setReviewNote('');
      const res = await client.get(`/mentors/${id}`);
      setMentor(res.data);
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert(err.response?.data?.detail || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const fetchSentRequests = async (userRole) => {
    if (userRole === 'student') {
      try {
        const res = await client.get('/requests/sent');
        const req = res.data.find(r => r.mentor_id === parseInt(id));
        if (req) {
          setExistingRequest(req);
        } else {
          setExistingRequest(null);
        }
      } catch (err) {
        console.error('Error fetching sent requests:', err);
      }
    }
  };

  // 1. Fetch mentor profile details on load
  useEffect(() => {
    const fetchMentorDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await client.get(`/mentors/${id}`);
        setMentor(res.data);
        
        // Grab student city from local storage
        const studentDetailsStr = localStorage.getItem('studentDetails');
        if (studentDetailsStr) {
          const sObj = JSON.parse(studentDetailsStr);
          setStudentCity(sObj.city || '');
        }

        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          setCurrentUser(u);
          await fetchSentRequests(u.role);
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

  // 2. Load Match Score with localStorage cache lookup & fallback
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') return;

    // A. Check location state
    if (location.state?.matchScore !== undefined) {
      setMatchScore(location.state.matchScore);
      setMatchReason(location.state.matchReason || '');
      return;
    }

    // B. Check localStorage cache
    const cacheStr = localStorage.getItem('mentorMatchScores');
    if (cacheStr) {
      const cacheObj = JSON.parse(cacheStr);
      const mentorMatch = cacheObj[id];
      if (mentorMatch) {
        setMatchScore(mentorMatch.score);
        setMatchReason(mentorMatch.reason || '');
        return;
      }
    }

    // C. Cold-start fallback query to matching backend API
    const fetchMatchScoreFromApi = async () => {
      const studentDetailsStr = localStorage.getItem('studentDetails');
      if (studentDetailsStr) {
        const studentDetails = JSON.parse(studentDetailsStr);
        const goalText = studentDetails.nextTarget || studentDetails.next_target || studentDetails.focusArea || studentDetails.focus_area;
        if (goalText && goalText.trim().length >= 5) {
          try {
            const res = await client.get('/mentors/match-score', {
              params: {
                mentor_id: id,
                student_goal: goalText
              }
            });
            setMatchScore(res.data.score);
            setMatchReason(res.data.reason || '');
          } catch (err) {
            console.error("Failed to query match score endpoint:", err);
          }
        }
      }
    };

    fetchMatchScoreFromApi();
  }, [id, location.state, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-canvas text-silver flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-white"></div>
        <p className="mt-4 text-slate-muted text-xs font-semibold">Loading profile coordinates...</p>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-dark-canvas text-silver flex flex-col justify-center items-center p-6 text-center">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-3xl mb-4 text-red-400 max-w-sm">
          <span className="font-bold">{error || 'Mentor profile not found'}</span>
        </div>
        <Link to="/browse" className="py-2.5 px-6 rounded-xl bg-slate-900 border border-slate-800 text-silver font-bold hover:bg-slate-800 transition-all duration-300">
          Back to Browse
        </Link>
      </div>
    );
  }

  const { user, domains, bio, max_sessions_per_month, what_ill_discuss, avg_rating, session_count, accepted_requests_count, reviews } = mentor;
  const isLocal = studentCity && user?.city && studentCity.toLowerCase().trim() === user.city.toLowerCase().trim();

  // Calculate remaining monthly slots
  const slotsRemaining = Math.max(0, max_sessions_per_month - (accepted_requests_count || 0));

  const getInitials = (name) => {
    if (!name) return 'MM';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round((rating || 0) * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-4 h-4 text-slate-700 fill-slate-700" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-dark-canvas text-silver pb-20 relative overflow-hidden bg-grid-dots">
      <div className="radial-spotlight"></div>
      
      {/* Navigation bar */}
      <div className="max-w-6xl mx-auto px-6 pt-6 relative z-10">
        <Link to="/browse" className="inline-flex items-center gap-2 text-slate-muted hover:text-cyber-white transition-colors duration-300 font-bold group text-xs uppercase tracking-wider">
          ← Back to Discovery Grid
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Profile details - Left column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero Profile Info Card */}
          <div className="premium-card p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-glow-blue/5 rounded-full blur-3xl pointer-events-none"></div>
            {isLocal && (
              <div className="absolute top-6 right-6 flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-glow-blue/10 border border-glow-blue/20 text-glow-blue text-[9px] font-black uppercase tracking-wider animate-pulse z-20">
                📍 Local Match
              </div>
            )}
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
              {/* Dicebear Avatar */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-xl">
                <img 
                  src={user?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.name || 'Mentor')}`} 
                  alt={user?.name} 
                  className="w-full h-full object-cover bg-slate-900"
                />
              </div>
              
              <div className="text-center md:text-left space-y-2.5">
                <h1 className="text-3xl font-black text-cyber-white tracking-tight leading-none">{user?.name}</h1>
                
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-slate-muted text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    📍 {user?.city}
                  </span>
                  <span className="text-slate-dark">•</span>
                  <span className="text-cyber-white font-extrabold bg-white/5 py-0.5 px-2 border border-white/5 rounded uppercase tracking-wider text-[10px]">
                    Verified Mentor
                  </span>
                  {session_count === 0 && (
                    <>
                      <span className="text-slate-dark">•</span>
                      <span className="text-glow-violet font-extrabold bg-glow-violet/10 py-0.5 px-2 border border-glow-violet/20 rounded uppercase tracking-wider text-[10px] animate-pulse">
                        🆕 New Guide
                      </span>
                    </>
                  )}
                </div>

                {/* Rating & Sessions */}
                <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
                  <div className="flex items-center gap-1 bg-[#050505] py-1 px-2 border border-white/5 rounded-lg">
                    {renderStars(avg_rating)}
                    <span className="text-cyber-white text-xs font-black ml-1.5">{avg_rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span className="py-1 px-2 bg-[#050505] border border-white/5 rounded-lg text-xs text-slate-muted font-bold">
                    <strong className="text-cyber-white font-black">{session_count || 0}</strong> completed sessions
                  </span>
                </div>
              </div>
            </div>

            {/* Domain Pills */}
            <div className="mt-8 pt-6 border-t border-white/8">
              <span className="text-[9px] font-black text-slate-dark uppercase tracking-widest block mb-3">Expertise Areas</span>
              <div className="flex flex-wrap gap-2">
                {domains && domains.map((domain, index) => (
                  <span
                    key={index}
                    className={`py-1.5 px-3 rounded-full border text-xs font-extrabold tracking-tight shadow-sm ${getDomainColor(domain)}`}
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* About & Bio Card */}
          <div className="premium-card p-8 space-y-6">
            <div>
              <h2 className="text-sm font-black text-cyber-white uppercase tracking-widest mb-3">Professional Biography</h2>
              <p className="text-slate-muted text-xs md:text-sm leading-relaxed whitespace-pre-line font-medium">
                {bio || "This mentor hasn't provided a biography coordinates yet."}
              </p>
            </div>
          </div>

          {/* Reviews List Section */}
          <div className="premium-card p-8 space-y-6">
            <h2 className="text-sm font-black text-cyber-white uppercase tracking-widest border-b border-white/8 pb-4">
              Student Feedback & Reviews ({reviews?.length || 0})
            </h2>

            {reviews && reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-5 rounded-2xl bg-[#050505]/40 border border-white/5 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-cyber-white text-xs font-black uppercase">
                          {getInitials(rev.student_name)}
                        </div>
                        <span className="text-xs font-extrabold text-cyber-white">{rev.student_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center text-amber-400 fill-amber-400">
                          {renderStars(rev.rating)}
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-muted text-xs leading-relaxed font-semibold italic pl-9">
                      "{rev.note}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#050505]/20 border border-white/5 rounded-2xl">
                <span className="text-xs text-slate-muted italic">No student reviews available yet. Be the first to connection and complete a session!</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel - Right column */}
        <div className="space-y-8">
          
          {/* AI Match Insights (Rendered only if score is valid) */}
          {matchScore !== null && (
            <div className="premium-card p-6 bg-gradient-to-br from-[#0D0D11] to-[#121216] border border-glow-violet/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[10px] font-black text-glow-violet uppercase tracking-widest animate-pulse">⚡ AI Compatibility Score</span>
                <span className="text-base font-black text-emerald-400 tracking-tight">{matchScore}% Match</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-[8px] font-black text-slate-dark uppercase tracking-widest block">AI Match Rationale</span>
                <p className="text-slate-muted text-xs leading-relaxed font-semibold">
                  {matchReason || "Highly compatible match based on student goals, domain alignments, and city locations."}
                </p>
              </div>
            </div>
          )}

          {/* Core Action Coordinates */}
          <div className="premium-card p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
            
            {/* Availability details */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-cyber-white uppercase tracking-widest border-b border-white/5 pb-2">Capacity & Availability</h3>
              
              <div className="space-y-2 pt-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-muted">Monthly Limit</span>
                  <span className="text-cyber-white font-extrabold">{max_sessions_per_month} requests</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-muted">Slots Remaining</span>
                  <span className={`font-extrabold ${slotsRemaining === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {slotsRemaining} of {max_sessions_per_month} slots
                  </span>
                </div>
                
                {/* Visual meter bar */}
                <div className="w-full h-1.5 bg-[#050505] rounded-full overflow-hidden border border-white/5 mt-3">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      slotsRemaining === 0 
                        ? 'bg-red-500' 
                        : slotsRemaining < 2 
                        ? 'bg-amber-500 animate-pulse' 
                        : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${(slotsRemaining / max_sessions_per_month) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* What I will discuss */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black text-cyber-white uppercase tracking-widest border-b border-white/5 pb-2">Session Focus</h3>
              
              <div className="relative p-4 rounded-xl bg-[#050505]/50 border border-white/5 text-xs font-medium">
                {/* SVG Quote Marks */}
                <svg className="w-6 h-6 text-white/5 absolute -top-1.5 -left-1.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-4.795 2.851-4.795 6.314h4.8v9.535h-10zm-11 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-4.796 2.851-4.796 6.314h4.8v9.535h-10z" />
                </svg>
                <p className="text-slate-muted italic leading-relaxed pt-2">
                  {what_ill_discuss || "Topics have not been specified. Coordinate an agenda upon connection request acceptance."}
                </p>
              </div>
            </div>

            {/* Connect CTA Buttons */}
            {currentUser?.role === 'student' ? (
              <div className="space-y-3 pt-4 border-t border-white/5">
                {existingRequest?.status === 'pending' ? (
                  <div className="w-full py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold text-xs text-center flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    Pending Mentor Approval
                  </div>
                ) : existingRequest?.status === 'accepted' ? (
                  <div className="space-y-2">
                    <div className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs text-center flex items-center justify-center gap-2">
                      ✓ Connection Active
                    </div>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-905 hover:bg-slate-850 border border-white/8 text-cyber-white font-bold text-xs text-center cursor-pointer transition-colors"
                    >
                      ★ Leave a Review
                    </button>
                  </div>
                ) : slotsRemaining === 0 ? (
                  <div className="w-full py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-extrabold text-xs text-center">
                    🔒 No slots remaining this month
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowConnectModal(true)}
                      className="w-full py-3.5 px-4 rounded-xl bg-cyber-white text-black font-extrabold text-xs uppercase tracking-wider hover:scale-102 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:bg-white"
                    >
                      Send Connection Request
                    </button>
                    {existingRequest?.status === 'declined' && (
                      <p className="text-[10px] text-slate-muted text-center leading-normal">
                        Your previous request was declined. You can resubmit with updated coordination targets.
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="w-full py-3 px-4 rounded-xl bg-[#050505] border border-white/8 text-slate-dark font-extrabold text-center text-xs uppercase tracking-wider select-none">
                Locked: Registered as Mentor
              </div>
            )}
          </div>
        </div>

      </div>

      {showConnectModal && (
        <IntentForm
          mentorId={id}
          mentorName={user?.name}
          onClose={() => setShowConnectModal(false)}
          onSuccess={() => fetchSentRequests(currentUser?.role)}
        />
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-stagger-fade">
          <div className="bg-[#0D0D11] border border-white/8 p-6 rounded-3xl w-full max-w-md space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-slate-dark hover:text-cyber-white text-base border-0 bg-transparent cursor-pointer font-bold"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[9px] font-black text-glow-violet uppercase tracking-widest block">FEEDBACK FORM</span>
              <h3 className="text-lg font-black text-cyber-white">Rate Your Mentor</h3>
              <p className="text-[10px] text-slate-muted">Share your thoughts on session coordination and technical support.</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-muted uppercase block">Select Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="bg-transparent border-0 cursor-pointer p-0"
                    >
                      <svg 
                        className={`w-6 h-6 ${star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700 fill-slate-700'}`} 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reviewNote" className="text-[9px] font-black text-slate-muted uppercase block">Review Description</label>
                <textarea
                  id="reviewNote"
                  required
                  rows="3"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Describe how the mentor helped you..."
                  className="w-full bg-[#050505] border border-white/8 text-cyber-white rounded-xl p-3 text-xs outline-none focus:border-white transition-all resize-none font-sans"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-cyber-white text-black font-extrabold text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-white/8 text-cyber-white font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
