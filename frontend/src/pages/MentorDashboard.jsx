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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h3a2 2 0 002-2v-3.571" />
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

        {/* Profile Editing Form */}
        <form onSubmit={handleSubmit} className="bg-dark-900/40 border border-slate-900 backdrop-blur-xl p-8 rounded-3xl space-y-6 shadow-xl">
          {/* Domains field */}
          <div>
            <label htmlFor="domains" className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
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
            <label htmlFor="max_sessions_per_month" className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
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
            <label htmlFor="bio" className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
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
            <label htmlFor="what_ill_discuss" className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
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
      </main>
    </div>
  );
}
