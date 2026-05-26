import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    domains: '',
    bio: '',
    max_sessions_per_month: 4,
    what_ill_discuss: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [mentorUser, setMentorUser] = useState(null);
  
  // Requests list states
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' or 'settings'
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState({});

  // Real-time calculated stats from DB profile
  const [stats, setStats] = useState({
    avgRating: 0.0,
    sessionCount: 0,
    profileStrength: 0,
  });

  // Calculate Profile Strength (gamified UI component)
  useEffect(() => {
    let score = 0;
    if (profile.bio && profile.bio.trim().length > 10) score += 30;
    if (profile.domains && profile.domains.trim().length > 3) score += 30;
    if (profile.what_ill_discuss && profile.what_ill_discuss.trim().length > 10) score += 30;
    if (profile.max_sessions_per_month > 0) score += 10;
    setStats((prev) => ({ ...prev, profileStrength: score }));
  }, [profile]);

  const fetchReceivedRequestsList = async () => {
    setRequestsLoading(true);
    try {
      const res = await client.get('/requests/received');
      setReceivedRequests(res.data);
    } catch (err) {
      console.error("Failed to load received requests:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Load current mentor user details and profile details
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userRes = await client.get('/auth/me');
        setMentorUser(userRes.data);

        const profileRes = await client.get('/mentors/me');
        const data = profileRes.data;
        setProfile({
          domains: data.domains ? data.domains.join(', ') : '',
          bio: data.bio || '',
          max_sessions_per_month: data.max_sessions_per_month || 4,
          what_ill_discuss: data.what_ill_discuss || '',
        });
        setStats({
          avgRating: data.avg_rating || 0.0,
          sessionCount: data.session_count || 0,
          profileStrength: 0, // calculated in the other useEffect
        });

        // Load requests inbox
        await fetchReceivedRequestsList();
      } catch (err) {
        if (err.response?.status === 404) {
          setMessage({
            type: 'info',
            text: "Welcome to MentorMesh! Please complete your profile configuration below to appear in local student search results.",
          });
        } else {
          console.error("Failed to load mentor info:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: name === 'max_sessions_per_month' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const domainsArray = profile.domains
      .split(',')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const payload = {
      domains: domainsArray,
      bio: profile.bio,
      max_sessions_per_month: profile.max_sessions_per_month,
      what_ill_discuss: profile.what_ill_discuss,
    };

    try {
      const res = await client.put('/mentors/me', payload);
      setMessage({ type: 'success', text: 'Mentor settings committed successfully!' });
      
      setProfile((prev) => ({
        ...prev,
        domains: res.data.domains ? res.data.domains.join(', ') : '',
      }));
      setStats((prev) => ({
        ...prev,
        avgRating: res.data.avg_rating || 0.0,
        sessionCount: res.data.session_count || 0,
      }));
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to save profile settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestResponse = async (requestId, newStatus) => {
    setMessage({ type: '', text: '' });
    try {
      await client.patch(`/requests/${requestId}`, { status: newStatus });
      setMessage({
        type: 'success',
        text: `Request was successfully ${newStatus === 'accepted' ? 'accepted' : 'declined'}.`
      });
      await fetchReceivedRequestsList();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update request status.'
      });
    }
  };

  const toggleRequestExpand = (id) => {
    setExpandedRequests(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDay}d ago`;
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-slate-400 font-semibold">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-950/15 via-dark-950 to-dark-950 pb-20 font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-dark-950/80 backdrop-blur-xl border-b border-slate-900/80 py-4 px-6 md:px-12 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-500/10 rounded-xl border border-primary-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h3a2 2 0 002-2v-3.571M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09A13.916 13.916 0 0115 11v7a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-3a2 2 0 00-2 2v3.571" />
            </svg>
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-white via-slate-200 to-primary-400 bg-clip-text text-transparent tracking-tight">
            MentorMesh
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-bold text-slate-200">{mentorUser?.name || 'Mentor'}</span>
            <span className="text-xs text-primary-400 font-semibold flex items-center gap-1 justify-end">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {mentorUser?.city} (Mentor)
            </span>
          </div>
          
          <button
            onClick={handleSignOut}
            className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm transition-all duration-300 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 mt-10 space-y-8">
        
        {/* Banner with Vibrant Accent Colors */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 p-8 rounded-3xl bg-gradient-to-br from-primary-950/40 via-dark-900 to-dark-950 border border-primary-500/25 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="space-y-2">
            <div className="inline-flex py-1 px-3.5 bg-gradient-to-r from-primary-500/10 to-indigo-500/10 border border-primary-500/30 rounded-full text-[10px] font-black tracking-widest uppercase text-primary-400">
              Mentor Dashboard
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Manage Your Matching Rules
            </h1>
            <p className="text-slate-450 text-sm max-w-xl">
              Maintain your active domains, discussable parameters, and monthly chat thresholds. Verified local matching searches will prioritize your profile.
            </p>
          </div>

          {/* Gamified Profile Strength Card */}
          <div className="w-full md:w-60 p-4 bg-slate-950/70 border border-slate-850 rounded-2xl shrink-0 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Profile Completeness</span>
              <span className="text-primary-400">{stats.profileStrength}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-850">
              <div 
                className="bg-gradient-to-r from-primary-500 to-indigo-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stats.profileStrength}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              {stats.profileStrength < 100 
                ? "Add bios, domains, and discussion topics to reach 100% matching power."
                : "Your profile is fully optimized for matching!"}
            </p>
          </div>
        </div>

        {/* Dynamic Statistics Widgets (Vibrant accent cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat 1: Completed Sessions */}
          <div className="p-6 bg-gradient-to-br from-indigo-950/30 to-dark-900 border border-indigo-500/20 rounded-2xl flex items-center gap-4 shadow-md hover:border-indigo-400/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h3a2 2 0 002-2v-3.571M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09A13.916 13.916 0 0115 11v7a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-3a2 2 0 00-2 2v3.571" />
              </svg>
            </div>
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sessions Conducted</div>
              <div className="text-3xl font-extrabold text-white mt-0.5">{stats.sessionCount}</div>
            </div>
          </div>

          {/* Stat 2: Avg Rating */}
          <div className="p-6 bg-gradient-to-br from-amber-950/20 to-dark-900 border border-amber-500/15 rounded-2xl flex items-center gap-4 shadow-md hover:border-amber-400/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Average Rating</div>
              <div className="text-3xl font-extrabold text-white mt-0.5">{stats.avgRating.toFixed(1)} / 5.0</div>
            </div>
          </div>

          {/* Stat 3: Slots Left */}
          <div className="p-6 bg-gradient-to-br from-emerald-950/20 to-dark-900 border border-emerald-500/15 rounded-2xl flex items-center gap-4 shadow-md hover:border-emerald-400/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Monthly Limit</div>
              <div className="text-3xl font-extrabold text-white mt-0.5">{profile.max_sessions_per_month} Slots</div>
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-900 gap-6">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`pb-3 font-bold text-sm transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === 'inbox' ? 'text-primary-400' : 'text-slate-450 hover:text-white'
            }`}
          >
            Received Requests Inbox
            {receivedRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="py-0.5 px-2 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-black animate-pulse">
                {receivedRequests.filter(r => r.status === 'pending').length} pending
              </span>
            )}
            {activeTab === 'inbox' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
              activeTab === 'settings' ? 'text-primary-400' : 'text-slate-455 hover:text-white'
            }`}
          >
            Profile & Matching Settings
            {activeTab === 'settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"></div>
            )}
          </button>
        </div>

        {/* Info alerts */}
        {message.text && (
          <div className={`p-4 border rounded-2xl text-sm flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : message.type === 'error'
              ? 'bg-red-500/10 border-red-500/25 text-red-400'
              : 'bg-primary-500/10 border-primary-500/25 text-primary-400'
          }`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{message.text}</span>
          </div>
        )}

        {activeTab === 'inbox' ? (
          // Received Requests CRM list
          requestsLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : receivedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-dark-900/25 border border-slate-900/50 rounded-3xl text-center max-w-md mx-auto mt-6 backdrop-blur-md">
              <div className="inline-flex p-4 rounded-2xl bg-slate-900/50 border border-slate-850 mb-4 text-slate-500">
                <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 4h-2.586a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 00-.707-.293h-3.172a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293H4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Inbox Empty</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs text-center">
                You haven't received any connection invitations yet. Complete your profile matching rules so students can find you!
              </p>
            </div>
          ) : (
            <div className="space-y-4 font-sans">
              {receivedRequests.map((req) => {
                const isExpanded = !!expandedRequests[req.id];
                let statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                if (req.status === 'accepted') statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                if (req.status === 'declined') statusColor = 'text-red-400 bg-red-500/10 border-red-500/20';

                return (
                  <div 
                    key={req.id}
                    className="bg-dark-900/40 border border-slate-900 rounded-3xl p-6 shadow-md hover:border-slate-800/80 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Collapsed details */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0">
                          {req.student?.name ? req.student.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'S'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-bold text-base leading-snug">{req.student?.name}</h4>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className="text-[10px] text-slate-400 font-medium">{formatTimeAgo(req.created_at)}</span>
                          </div>
                          <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-slate-550" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {req.student?.city}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions & Status */}
                      <div className="flex items-center gap-3 self-start sm:self-center">
                        <span className={`py-1.5 px-3 rounded-lg border text-xs font-black uppercase tracking-wider ${statusColor}`}>
                          {req.status}
                        </span>
                        
                        <button
                          onClick={() => toggleRequestExpand(req.id)}
                          className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-900 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          {isExpanded ? 'Hide Answers' : 'View Answers'}
                          <svg className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-5 border-t border-slate-900/80 space-y-5 text-sm animate-fadeIn">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">1. What specifically do you want to learn or achieve?</span>
                          <p className="text-slate-200 bg-slate-950/40 p-4 rounded-2xl border border-slate-950/60 leading-relaxed font-medium">
                            {req.answer_1}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">2. What have you already tried or explored on your own?</span>
                          <p className="text-slate-200 bg-slate-950/40 p-4 rounded-2xl border border-slate-950/60 leading-relaxed font-medium">
                            {req.answer_2}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">3. What is your concrete ask for the first session?</span>
                          <p className="text-slate-200 bg-slate-950/40 p-4 rounded-2xl border border-slate-950/60 leading-relaxed font-medium">
                            {req.answer_3}
                          </p>
                        </div>

                        {req.status === 'pending' && (
                          <div className="flex gap-4 pt-2 border-t border-slate-950/50">
                            <button
                              onClick={() => handleRequestResponse(req.id, 'accepted')}
                              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-950/10 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                              Accept Request
                            </button>
                            <button
                              onClick={() => handleRequestResponse(req.id, 'declined')}
                              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-750 font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Decline Request
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // Settings Tab: Profile form
          <form onSubmit={handleSubmit} className="bg-dark-900/40 border border-slate-900 backdrop-blur-xl p-8 rounded-3xl space-y-6 shadow-xl">
            {/* Domains field */}
            <div>
              <label htmlFor="domains" className="text-xs font-bold text-slate-350 block mb-2 uppercase tracking-wider font-mono">
                Expert Domains (Comma separated)
              </label>
              <input
                type="text"
                name="domains"
                id="domains"
                required
                value={profile.domains}
                onChange={handleChange}
                placeholder="e.g. Web Development, AI/ML, UI/UX Design"
                className="w-full bg-slate-950 border border-slate-800/85 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all text-sm"
              />
              <span className="text-slate-500 text-[10px] mt-1.5 block">Separate each domain with a comma (e.g. AI/ML, Data Science)</span>
            </div>

            {/* Max Sessions Limit */}
            <div>
              <label htmlFor="max_sessions_per_month" className="text-xs font-bold text-slate-350 block mb-2 uppercase tracking-wider font-mono">
                Max Connection Sessions Per Month
              </label>
              <input
                type="number"
                name="max_sessions_per_month"
                id="max_sessions_per_month"
                required
                min="1"
                max="20"
                value={profile.max_sessions_per_month}
                onChange={handleChange}
                className="w-32 bg-slate-950 border border-slate-800/85 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all text-sm"
              />
            </div>

            {/* Bio area */}
            <div>
              <label htmlFor="bio" className="text-xs font-bold text-slate-350 block mb-2 uppercase tracking-wider font-mono">
                Short Professional Bio
              </label>
              <textarea
                name="bio"
                id="bio"
                required
                rows="4"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Describe your role, academic background, or goals to help students find you..."
                className="w-full bg-slate-950 border border-slate-800/85 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all text-sm resize-none"
              ></textarea>
            </div>

            {/* Discuss details */}
            <div>
              <label htmlFor="what_ill_discuss" className="text-xs font-bold text-slate-350 block mb-2 uppercase tracking-wider font-mono">
                What are you open to discuss?
              </label>
              <textarea
                name="what_ill_discuss"
                id="what_ill_discuss"
                required
                rows="3"
                value={profile.what_ill_discuss}
                onChange={handleChange}
                placeholder="e.g. I am open to discussing resume reviews, entry-level interview prep, or academic research methodologies."
                className="w-full bg-slate-950 border border-slate-800/85 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all text-sm resize-none"
              ></textarea>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-primary-600/15 hover:shadow-primary-500/25 active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving settings...
                </>
              ) : (
                'Save Profile Settings'
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
