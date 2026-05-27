import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import IntentForm from '../components/IntentForm';

export default function MentorProfile() {
  const { id } = useParams(); // user_id of the mentor
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Connection modal state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [studentCity, setStudentCity] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-canvas text-silver flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-white"></div>
        <p className="mt-4 text-slate-muted text-xs font-semibold">Loading profile...</p>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-dark-canvas text-silver flex flex-col justify-center items-center p-6 text-center">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-3xl mb-4 text-red-400 max-w-sm">
          <span className="font-bold">{error || 'Mentor not found'}</span>
        </div>
        <Link to="/browse" className="py-2.5 px-6 rounded-xl bg-slate-900 border border-slate-800 text-silver font-bold hover:bg-slate-800 transition-all duration-300">
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

  // Render rating stars
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
        <Link to="/browse" className="inline-flex items-center gap-2 text-slate-muted hover:text-cyber-white transition-colors duration-300 font-semibold group text-xs">
          ← Back to Discovery Grid
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Profile details - Left column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Info Card */}
          <div className="premium-card p-8 shadow-lg relative overflow-hidden">
            {isLocal && (
              <div className="absolute top-6 right-6 flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-glow-blue/10 border border-glow-blue/20 text-glow-blue text-[9px] font-black uppercase tracking-wider animate-pulse">
                📍 Local Match
              </div>
            )}
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-glow-violet to-glow-blue flex items-center justify-center text-cyber-white font-extrabold text-2xl shadow-xl shrink-0">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              
              <div className="text-center md:text-left space-y-2">
                <h1 className="text-2xl font-black text-cyber-white tracking-tight">{user?.name}</h1>
                
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-slate-muted text-xs">
                  <span className="flex items-center gap-1">
                    📍 {user?.city}
                  </span>
                  <span className="text-slate-dark">•</span>
                  <span className="text-cyber-white font-bold bg-white/5 py-0.5 px-2 border border-white/5 rounded">
                    Mentor Account
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center md:justify-start gap-2.5 pt-1.5">
                  <div className="flex items-center gap-1">
                    {renderStars(avg_rating)}
                  </div>
                  <span className="text-cyber-white text-sm font-black">{avg_rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-white/10">|</span>
                  <span className="text-slate-muted text-xs">
                    <strong className="text-cyber-white">{session_count || 0}</strong> conducted sessions
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About & Bio Card */}
          <div className="premium-card p-8 space-y-6">
            <div>
              <h2 className="text-base font-black text-cyber-white uppercase tracking-wider mb-3">About Me</h2>
              <p className="text-slate-muted text-xs md:text-sm leading-relaxed whitespace-pre-line font-medium">
                {bio || "This mentor hasn't provided a bio yet."}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-black text-cyber-white uppercase tracking-wider mb-3">Expertise & Domains</h2>
              <div className="flex flex-wrap gap-2">
                {domains && domains.length > 0 ? (
                  domains.map((domain, index) => (
                    <span
                      key={index}
                      className="py-1 px-3 rounded-full bg-[#1E1E24] text-cyber-white text-[11px] font-bold"
                    >
                      {domain}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-dark italic">No specific domains listed</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel - Right column */}
        <div className="space-y-8">
          <div className="premium-card p-6 flex flex-col justify-between space-y-6 shadow-xl">
            
            <div className="space-y-3">
              <h3 className="text-xs font-black text-cyber-white uppercase tracking-wider">Availability</h3>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-[#050505] border border-white/5 text-xs">
                <div>
                  <div className="text-slate-muted text-[10px]">Monthly Connection Threshold</div>
                  <div className="text-cyber-white font-bold mt-0.5">{max_sessions_per_month} slots maximum</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-black text-cyber-white uppercase tracking-wider">Discussable Coordinates</h3>
              <p className="text-slate-muted text-xs leading-relaxed bg-[#050505]/40 p-4 rounded-xl border border-white/5">
                {what_ill_discuss || "Topics have not been specified. Coordinate an agenda upon connection acceptance."}
              </p>
            </div>

            {/* Connect Call-to-action */}
            {currentUser?.role === 'student' ? (
              <div className="space-y-3 pt-2">
                {existingRequest?.status === 'pending' ? (
                  <div className="w-full py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold text-xs text-center flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    Pending Mentor Approval
                  </div>
                ) : existingRequest?.status === 'accepted' ? (
                  <div className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs text-center flex items-center justify-center gap-2">
                    ✓ Connection Active
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowConnectModal(true)}
                      className="w-full py-3 px-4 rounded-xl bg-cyber-white text-black font-extrabold text-xs uppercase tracking-wider hover:scale-102 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      Request Connection
                    </button>
                    {existingRequest?.status === 'declined' && (
                      <p className="text-[10px] text-slate-muted text-center leading-normal">
                        Your previous invitation was declined. You can submit an updated request targets checklist.
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="w-full py-3 px-4 rounded-xl bg-[#050505] border border-white/8 text-slate-dark font-bold text-center text-xs">
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

    </div>
  );
}
