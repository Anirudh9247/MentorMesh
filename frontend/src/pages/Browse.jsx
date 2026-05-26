import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import MentorCard from '../components/MentorCard';

const POPULAR_DOMAINS = [
  'Web Development',
  'AI/ML',
  'Mobile Apps',
  'UI/UX Design',
  'Data Science',
  'Cloud Architecture',
  'Product Management'
];

export default function Browse() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Student state
  const [student, setStudent] = useState(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [localOnly, setLocalOnly] = useState(false);

  // Fetch current user and mentors list on mount
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      setError('');
      try {
        const userRes = await client.get('/auth/me');
        setStudent(userRes.data);
        localStorage.setItem('studentDetails', JSON.stringify(userRes.data));
      } catch (err) {
        console.error("Failed to load user info:", err);
        const cachedUser = localStorage.getItem('user');
        if (!cachedUser) {
          navigate('/login');
          return;
        }
      }

      try {
        const mentorsRes = await client.get('/mentors');
        setMentors(mentorsRes.data);
      } catch (err) {
        setError('Failed to fetch mentors list. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [navigate]);

  const fetchFilteredMentors = async (domainVal = selectedDomain, localOnlyVal = localOnly) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (domainVal) params.domain = domainVal;
      
      if (localOnlyVal && student?.city) {
        params.city = student.city;
      }

      const res = await client.get('/mentors', { params });
      setMentors(res.data);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await fetchFilteredMentors();
  };

  const handleDomainSelect = async (domain) => {
    const newVal = selectedDomain === domain ? '' : domain;
    setSelectedDomain(newVal);
    await fetchFilteredMentors(newVal, localOnly);
  };

  const handleLocalToggle = async () => {
    const newVal = !localOnly;
    setLocalOnly(newVal);
    await fetchFilteredMentors(selectedDomain, newVal);
  };

  const handleClearFilters = async () => {
    setSearchQuery('');
    setSelectedDomain('');
    setLocalOnly(false);
    setLoading(true);
    try {
      const res = await client.get('/mentors');
      setMentors(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-950/15 via-dark-950 to-dark-950 pb-20 font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-dark-950/80 backdrop-blur-xl border-b border-slate-900/80 py-4.5 px-6 md:px-12 flex items-center justify-between shadow-sm">
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
            <span className="text-sm font-bold text-slate-200">{student?.name || 'Loading student...'}</span>
            <span className="text-xs text-primary-400 font-semibold flex items-center gap-1 justify-end">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {student?.city} (Student)
            </span>
          </div>
          
          <button
            onClick={handleSignOut}
            className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition-all duration-300 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-8">
        
        {/* Welcome & Overview Banner (Fills empty section, enhances hierarchy) */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-primary-900/20 via-indigo-900/10 to-dark-900 border border-slate-800/60 shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-400 bg-primary-500/10 py-1 px-3 border border-primary-500/20 rounded-full">
              Locality-First Platform
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Discover Mentors in <span className="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">{student?.city || 'Your City'}</span>
            </h1>
            <p className="text-slate-350 text-sm md:text-base leading-relaxed">
              Bypass cold LinkedIn outreach. Find working professionals and researchers in your immediate locality, apply with a structured 3-question intent form, and coordinate structured face-to-face or virtual learning sessions.
            </p>
          </div>
        </div>

        {/* 2-Column Professional Layout (Cleans up clutter & organization) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Search & Filters sidebar (1/4 width) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search Card */}
            <div className="bg-dark-900/50 border border-slate-900 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest">Search Keywords</h3>
              
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="e.g. Harsha, Bio, Tech"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-550 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
                <svg className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>

              {/* Local Only Checkbox Button */}
              <button
                onClick={handleLocalToggle}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all duration-300 cursor-pointer ${
                  localOnly
                    ? 'bg-primary-500/10 border-primary-500/40 text-primary-400'
                    : 'bg-slate-950 border-slate-800 text-slate-350 hover:border-slate-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Local Match Only ({student?.city})
              </button>
            </div>

            {/* Popular Domains selection (Pill group) */}
            <div className="bg-dark-900/50 border border-slate-900 p-6 rounded-3xl space-y-3">
              <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest">Filter by Domain</h3>
              <div className="flex flex-col gap-1.5">
                {POPULAR_DOMAINS.map((domain) => {
                  const isSelected = selectedDomain === domain;
                  return (
                    <button
                      key={domain}
                      onClick={() => handleDomainSelect(domain)}
                      className={`text-left py-2 px-3 rounded-lg font-bold text-xs transition-all border cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                          : 'bg-transparent border-transparent hover:bg-slate-900/60 text-slate-300'
                      }`}
                    >
                      <span>{domain}</span>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* "How it Works" guide widget (Populates empty space beautifully) */}
            <div className="p-6 bg-slate-950/80 border border-slate-900 rounded-3xl space-y-4">
              <h4 className="text-xs font-bold text-primary-400 uppercase tracking-wider">How Mesh Works</h4>
              <div className="space-y-3 text-xs text-slate-400">
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center shrink-0 font-bold">1</span>
                  <p>Discover matches sorted by your city first.</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center shrink-0 font-bold">2</span>
                  <p>Open profile and answer the 3 validation questions.</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center shrink-0 font-bold">3</span>
                  <p>Coordinate a session once accepted by the mentor.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Active Filters, Mentors Grid or empty state (3/4 width) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Filter tags header */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2">
              <div className="text-xs text-slate-400">
                Showing <strong className="text-white">{mentors.length}</strong> available mentors
              </div>

              {/* Reset filter button */}
              {(searchQuery || selectedDomain || localOnly) && (
                <button
                  onClick={handleClearFilters}
                  className="py-1 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reset Active Filters
                </button>
              )}
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-sm animate-pulse">
                {error}
              </div>
            )}

            {/* Grid display */}
            {loading ? (
              // Loading Skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="bg-dark-900/30 border border-slate-900 p-6 rounded-3xl flex flex-col justify-between h-80 animate-pulse">
                    <div>
                      <div className="flex gap-4 mb-4">
                        <div className="w-14 h-14 bg-slate-800 rounded-2xl shrink-0"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="h-3 bg-slate-800 rounded w-1/3 mb-4"></div>
                      <div className="space-y-2 mb-6">
                        <div className="h-3 bg-slate-800 rounded w-full"></div>
                        <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                      </div>
                    </div>
                    <div className="h-10 bg-slate-800 rounded-xl w-full"></div>
                  </div>
                ))}
              </div>
            ) : mentors.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center p-12 bg-dark-900/25 border border-slate-900/50 rounded-3xl text-center max-w-lg mx-auto mt-6 backdrop-blur-md">
                <div className="inline-flex p-4 rounded-2xl bg-slate-900/50 border border-slate-850 mb-4 text-slate-500">
                  <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Mentors Match Your Filters</h3>
                <p className="text-slate-400 text-xs mb-6 max-w-sm leading-relaxed">
                  Adjust your search terms or uncheck the locality/domain toggles to view matching profiles across other categories and cities.
                </p>
                {(searchQuery || selectedDomain || localOnly) && (
                  <button
                    onClick={handleClearFilters}
                    className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-all duration-300"
                  >
                    Clear All Active Toggles
                  </button>
                )}
              </div>
            ) : (
              // Grid View of Mentors
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    studentCity={student?.city}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
