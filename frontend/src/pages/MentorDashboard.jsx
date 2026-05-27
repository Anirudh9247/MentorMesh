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

  // Calculate Profile Strength
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
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-canvas text-silver flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-white"></div>
        <p className="mt-4 text-slate-muted text-xs font-semibold">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-canvas text-silver pb-20 relative overflow-hidden bg-grid-dots">
      <div className="radial-spotlight"></div>
      
      {/* Top Navbar */}
      <header className="sticky top-4 z-40 mx-4 md:mx-8 h-16 rounded-full border border-white/8 glass-nav px-6 flex items-center justify-between interactive-element">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-glow-violet to-glow-blue flex items-center justify-center text-cyber-white font-extrabold text-sm">
            M
          </div>
          <span className="text-base font-black text-cyber-white tracking-tight hidden sm:inline">
            MentorMesh
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-bold text-cyber-white">{mentorUser?.name || 'Mentor'}</span>
            <span className="text-[10px] text-glow-blue font-black tracking-wider uppercase">
              {mentorUser?.city} (Mentor)
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

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 mt-10 space-y-8 relative z-10">
        
        {/* Banner with Vibrant Accent Colors */}
        <div className="premium-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg overflow-hidden">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex py-1 px-3 bg-white/5 border border-white/8 rounded-full text-[9px] font-black tracking-widest uppercase text-glow-blue">
              Mentor Dashboard
            </div>
            <h1 className="text-3xl font-extrabold text-cyber-white tracking-tight">
              Manage Your Matching Rules
            </h1>
            <p className="text-slate-muted text-xs">
              Configure expert domains and monthly slots limit to guide local matches.
            </p>
          </div>

          {/* Gamified Profile Strength Card */}
          <div className="w-full md:w-56 p-4 bg-[#050505]/45 border border-white/5 rounded-2xl shrink-0 space-y-2">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-muted">Profile Strength</span>
              <span className="text-glow-blue">{stats.profileStrength}%</span>
            </div>
            <div className="w-full bg-[#050505] rounded-full h-1.5 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-glow-violet to-glow-blue h-full rounded-full transition-all duration-500" 
                style={{ width: `${stats.profileStrength}%` }}
              ></div>
            </div>
            <p className="text-[9px] text-slate-dark leading-normal">
              {stats.profileStrength < 100 
                ? "Complete settings fields to reach 100% matching potency."
                : "Your profile is fully optimized for matching!"}
            </p>
          </div>
        </div>

        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-stagger-fade">
          {/* Conducted */}
          <div className="premium-card p-6 flex items-center gap-4 group">
            <div className="w-10 h-10 bg-glow-violet/10 rounded-xl flex items-center justify-center border border-glow-violet/20 text-glow-violet group-hover:scale-105 transition-transform duration-300">
              ⚡
            </div>
            <div>
              <div className="text-slate-muted text-[10px] font-black uppercase tracking-wider">Sessions Conducted</div>
              <div className="text-2xl font-extrabold text-cyber-white mt-0.5">{stats.sessionCount}</div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="premium-card p-6 flex items-center gap-4 group">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform duration-300">
              ★
            </div>
            <div>
              <div className="text-slate-muted text-[10px] font-black uppercase tracking-wider">Average Rating</div>
              <div className="text-2xl font-extrabold text-cyber-white mt-0.5">{stats.avgRating.toFixed(1)} / 5.0</div>
            </div>
          </div>

          {/* Limit */}
          <div className="premium-card p-6 flex items-center gap-4 group">
            <div className="w-10 h-10 bg-glow-blue/10 rounded-xl flex items-center justify-center border border-glow-blue/20 text-glow-blue group-hover:scale-105 transition-transform duration-300">
              📅
            </div>
            <div>
              <div className="text-slate-muted text-[10px] font-black uppercase tracking-wider">Monthly Limit</div>
              <div className="text-2xl font-extrabold text-cyber-white mt-0.5">{profile.max_sessions_per_month} Slots</div>
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-white/8 gap-6">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`pb-3 font-bold text-sm transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === 'inbox' ? 'text-cyber-white' : 'text-slate-muted hover:text-cyber-white'
            }`}
          >
            Received Invitations
            {receivedRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="py-0.5 px-2 text-[9px] bg-white/10 text-glow-blue border border-white/10 rounded-full font-black animate-pulse">
                {receivedRequests.filter(r => r.status === 'pending').length} pending
              </span>
            )}
            {activeTab === 'inbox' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-white rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
              activeTab === 'settings' ? 'text-cyber-white' : 'text-slate-muted hover:text-cyber-white'
            }`}
          >
            Matching Coordinates
            {activeTab === 'settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-white rounded-full"></div>
            )}
          </button>
        </div>

        {/* Info alerts */}
        {message.text && (
          <div className={`p-4 border rounded-2xl text-xs flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-450'
              : 'bg-white/5 border-white/10 text-cyber-white'
          }`}>
            <span>{message.type === 'success' ? '✓' : 'ℹ'} {message.text}</span>
          </div>
        )}

        {activeTab === 'inbox' ? (
          // Received Requests CRM list
          requestsLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/10 border-t-white"></div>
            </div>
          ) : receivedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-dark-card border border-white/8 rounded-3xl text-center max-w-md mx-auto mt-6">
              <h3 className="text-base font-bold text-cyber-white mb-2">Inbox Empty</h3>
              <p className="text-slate-muted text-xs leading-relaxed">
                You haven't received any connection invitations yet. Configure matching variables to appear in discovery.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((req) => {
                const isExpanded = !!expandedRequests[req.id];
                let statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                if (req.status === 'accepted') statusColor = 'text-emerald-450 bg-emerald-500/10 border-emerald-500/20';
                if (req.status === 'declined') statusColor = 'text-red-400 bg-red-500/10 border-red-500/20';

                return (
                  <div 
                    key={req.id}
                    className="premium-card p-6 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-glow-violet to-glow-blue flex items-center justify-center text-cyber-white font-extrabold text-lg shadow-md shrink-0">
                          {req.student?.name ? req.student.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'S'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-cyber-white font-bold text-base leading-snug">{req.student?.name}</h4>
                            <span className="text-[10px] text-slate-dark">•</span>
                            <span className="text-[10px] text-slate-muted font-medium">{formatTimeAgo(req.created_at)}</span>
                          </div>
                          <p className="text-slate-muted text-xs flex items-center gap-1 mt-0.5">
                            📍 {req.student?.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-center">
                        <span className={`py-1.5 px-3 rounded-lg border text-xs font-black uppercase tracking-wider ${statusColor}`}>
                          {req.status}
                        </span>
                        
                        <button
                          onClick={() => toggleRequestExpand(req.id)}
                          className="py-1.5 px-3 rounded-lg bg-[#050505] border border-white/8 text-slate-muted hover:text-cyber-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          {isExpanded ? 'Hide Answers' : 'View Answers'}
                          <svg className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Answers */}
                    {isExpanded && (
                      <div className="mt-6 pt-5 border-t border-white/8 space-y-4 text-xs animate-stagger-fade">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-muted uppercase tracking-widest block">1. What specifically do you want to learn?</span>
                          <p className="text-silver bg-[#050505] p-3.5 rounded-2xl border border-white/5 leading-relaxed font-medium">
                            {req.answer_1}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-muted uppercase tracking-widest block">2. What have you already explored?</span>
                          <p className="text-silver bg-[#050505] p-3.5 rounded-2xl border border-white/5 leading-relaxed font-medium">
                            {req.answer_2}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-muted uppercase tracking-widest block">3. Concrete ask for first session?</span>
                          <p className="text-silver bg-[#050505] p-3.5 rounded-2xl border border-white/5 leading-relaxed font-medium">
                            {req.answer_3}
                          </p>
                        </div>

                        {req.status === 'pending' && (
                          <div className="flex gap-4 pt-2 border-t border-white/5">
                            <button
                              onClick={() => handleRequestResponse(req.id, 'accepted')}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-cyber-white text-black font-extrabold text-xs cursor-pointer shadow-md hover:scale-102 transition-colors flex items-center justify-center gap-1.5"
                            >
                              Accept Request
                            </button>
                            <button
                              onClick={() => handleRequestResponse(req.id, 'declined')}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyber-white font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                            >
                              Decline Invitation
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
          <form onSubmit={handleSubmit} className="premium-card p-8 space-y-6 shadow-xl">
            <div>
              <label htmlFor="domains" className="text-[10px] font-black text-slate-muted block mb-2 uppercase tracking-wider font-mono">
                Expert Domains (Comma separated)
              </label>
              <input
                type="text"
                name="domains"
                id="domains"
                required
                value={profile.domains}
                onChange={handleChange}
                placeholder="e.g. Web Development, AI/ML"
                className="w-full bg-[#050505] border border-white/8 text-cyber-white rounded-xl px-4 py-3 outline-none focus:border-white focus:ring-0 transition-all text-xs"
              />
            </div>

            <div>
              <label htmlFor="max_sessions_per_month" className="text-[10px] font-black text-slate-muted block mb-2 uppercase tracking-wider font-mono">
                Max connection slots per month
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
                className="w-28 bg-[#050505] border border-white/8 text-cyber-white rounded-xl px-4 py-3 outline-none focus:border-white focus:ring-0 transition-all text-xs"
              />
            </div>

            <div>
              <label htmlFor="bio" className="text-[10px] font-black text-slate-muted block mb-2 uppercase tracking-wider font-mono">
                Short Professional Bio
              </label>
              <textarea
                name="bio"
                id="bio"
                required
                rows="4"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Describe your role, background or mentorship approach..."
                className="w-full bg-[#050505] border border-white/8 text-cyber-white rounded-xl px-4 py-3 outline-none focus:border-white focus:ring-0 transition-all text-xs resize-none"
              ></textarea>
            </div>

            <div>
              <label htmlFor="what_ill_discuss" className="text-[10px] font-black text-slate-muted block mb-2 uppercase tracking-wider font-mono">
                What are you open to discuss?
              </label>
              <textarea
                name="what_ill_discuss"
                id="what_ill_discuss"
                required
                rows="3"
                value={profile.what_ill_discuss}
                onChange={handleChange}
                placeholder="e.g. Resume reviews, startup feedback..."
                className="w-full bg-[#050505] border border-white/8 text-cyber-white rounded-xl px-4 py-3 outline-none focus:border-white focus:ring-0 transition-all text-xs resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-cyber-white text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 hover:scale-102 interactive-element"
            >
              {saving ? 'Saving coordinates...' : 'Save Settings'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
