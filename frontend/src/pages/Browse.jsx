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
        // 1. Fetch current logged-in user profile
        const userRes = await client.get('/auth/me');
        setStudent(userRes.data);
        
        // Save full user details to localStorage for convenience
        localStorage.setItem('studentDetails', JSON.stringify(userRes.data));
      } catch (err) {
        console.error("Failed to load user info:", err);
        // If JWT validation fails (401), client.js automatically clears storage and redirects to /login.
        // We fallback to checking localStorage user role just in case.
        const cachedUser = localStorage.getItem('user');
        if (!cachedUser) {
          navigate('/login');
          return;
        }
      }

      try {
        // 2. Fetch mentors list (initially no filters)
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

  // Handle dynamic filters (call API or filter locally)
  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchFilteredMentors();
  };

  const fetchFilteredMentors = async (domainVal = selectedDomain, localOnlyVal = localOnly) => {
    setLoading(true);
    setError('');
    try {
      // Build query parameters
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (domainVal) params.domain = domainVal;
      
      // If "Show Local Only" is checked, we pass the student's city as filter
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

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-950/20 via-dark-950 to-dark-950 pb-16">
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
            <span className="text-sm font-bold text-slate-200">{student?.name || 'Loading student...'}</span>
            <span className="text-xs text-primary-400 font-semibold flex items-center gap-1 justify-end">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {student?.city}
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

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
            Find an Expert in <span className="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">{student?.city || 'Your City'}</span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
            Discover and connect with professionals and researchers near you. Connect locally for face-to-face meetups, mock interviews, or research feedback.
          </p>
        </div>

        {/* Search & Filtering Panel */}
        <div className="bg-dark-900/40 border border-slate-900 backdrop-blur-xl p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="w-full md:max-w-md relative flex items-center">
            <input
              type="text"
              placeholder="Search mentors by name or bio keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300"
            />
            <svg className="w-5 h-5 text-slate-500 absolute left-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              type="submit"
              className="absolute right-2 px-3 py-1.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-950 font-bold text-xs cursor-pointer transition-all duration-300"
            >
              Search
            </button>
          </form>

          {/* Toggle buttons */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-start md:justify-end">
            <button
              onClick={handleLocalToggle}
              className={`py-3 px-5 rounded-2xl font-bold text-sm flex items-center gap-2 border transition-all duration-300 cursor-pointer ${
                localOnly
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-400 shadow-md shadow-primary-950/20'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Local Matches Only ({student?.city})
            </button>
          </div>
        </div>

        {/* Domain Selection Badges */}
        <div className="mb-10">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Popular Domains</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_DOMAINS.map((domain) => {
              const isSelected = selectedDomain === domain;
              return (
                <button
                  key={domain}
                  onClick={() => handleDomainSelect(domain)}
                  className={`py-2 px-4 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer border ${
                    isSelected
                      ? 'bg-primary-500/10 border-primary-500/40 text-primary-400'
                      : 'bg-dark-900/30 border-slate-850 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  {domain}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid View */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm mb-6 max-w-md">
            {error}
          </div>
        )}

        {loading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((num) => (
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
                    <div className="h-3 bg-slate-800 rounded w-4/6"></div>
                  </div>
                </div>
                <div className="h-10 bg-slate-800 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : mentors.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center p-12 bg-dark-900/25 border border-slate-900/50 rounded-3xl text-center max-w-xl mx-auto mt-12 backdrop-blur-md">
            <div className="inline-flex p-4 rounded-2xl bg-slate-900/50 border border-slate-850 mb-4 text-slate-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Mentors Found</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md leading-relaxed">
              We couldn't find any mentors matching your search query or filters. Try adjusting your keywords, toggling the local matching, or clearing the active domain filter.
            </p>
            {(searchQuery || selectedDomain || localOnly) && (
              <button
                onClick={async () => {
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
                }}
                className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer transition-all duration-300"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          // Grid View of Mentors
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                studentCity={student?.city}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
