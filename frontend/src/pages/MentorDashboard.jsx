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

  // Load current mentor user details and profile details
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Fetch current user details
        const userRes = await client.get('/auth/me');
        setMentorUser(userRes.data);

        // Fetch current mentor profile details
        const profileRes = await client.get('/mentors/me');
        const data = profileRes.data;
        setProfile({
          domains: data.domains ? data.domains.join(', ') : '',
          bio: data.bio || '',
          max_sessions_per_month: data.max_sessions_per_month || 4,
          what_ill_discuss: data.what_ill_discuss || '',
        });
      } catch (err) {
        // A 404 means the mentor hasn't created a profile yet
        if (err.response?.status === 404) {
          setMessage({
            type: 'info',
            text: "Welcome! Please configure your mentor profile details below to start matching with students in your city.",
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

    // Parse domains from comma separated list
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
      setMessage({ type: 'success', text: 'Mentor profile updated successfully!' });
      
      // Update form state with parsed domains list format
      setProfile((prev) => ({
        ...prev,
        domains: res.data.domains ? res.data.domains.join(', ') : '',
      }));
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to save profile. Please verify your fields.',
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
    <div className="min-h-screen bg-dark-950 text-white bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-950/15 via-dark-950 to-dark-950 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-dark-950/80 backdrop-blur-xl border-b border-slate-900/80 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-500/10 rounded-xl border border-primary-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

      <main className="max-w-4xl mx-auto px-6 mt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Mentor Profile Settings</h1>
          <p className="text-slate-400 text-sm">
            Manage your domains, session limits, and discussable topics. This information helps us match you with local students.
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 border rounded-2xl text-sm flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : message.type === 'error'
              ? 'bg-red-500/10 border-red-500/25 text-red-400'
              : 'bg-primary-500/10 border-primary-500/25 text-primary-400'
          }`}>
            {message.type === 'success' ? (
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-dark-900/40 border border-slate-900 backdrop-blur-xl p-8 rounded-3xl space-y-6 shadow-xl">
          {/* Domains field */}
          <div>
            <label htmlFor="domains" className="text-sm font-semibold text-slate-300 block mb-2">
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
              className="w-full bg-slate-950 border border-slate-800/80 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300 text-sm"
            />
            <span className="text-slate-500 text-xs mt-1.5 block">Separate each domain with a comma (e.g. AI/ML, Cloud Architecture)</span>
          </div>

          {/* Max Sessions Limit */}
          <div>
            <label htmlFor="max_sessions_per_month" className="text-sm font-semibold text-slate-300 block mb-2">
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
              className="w-32 bg-slate-950 border border-slate-800/80 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300 text-sm"
            />
            <span className="text-slate-500 text-xs mt-1.5 block">Limit the number of student sessions you accept per month (range 1 to 20)</span>
          </div>

          {/* Bio area */}
          <div>
            <label htmlFor="bio" className="text-sm font-semibold text-slate-300 block mb-2">
              Short Professional Bio
            </label>
            <textarea
              name="bio"
              id="bio"
              required
              rows="4"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Describe your current role, background, research papers, or journey to help students learn about you..."
              className="w-full bg-slate-950 border border-slate-800/80 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300 text-sm resize-none"
            ></textarea>
          </div>

          {/* Discuss details */}
          <div>
            <label htmlFor="what_ill_discuss" className="text-sm font-semibold text-slate-300 block mb-2">
              What are you open to discuss?
            </label>
            <textarea
              name="what_ill_discuss"
              id="what_ill_discuss"
              required
              rows="3"
              value={profile.what_ill_discuss}
              onChange={handleChange}
              placeholder="e.g. I am open to discussing resume reviews, entry-level ML engineer interview prep, or QRNG research methodology."
              className="w-full bg-slate-950 border border-slate-800/80 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300 text-sm resize-none"
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-primary-600/15 hover:shadow-primary-500/25 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving profile changes...
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
