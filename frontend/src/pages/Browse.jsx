import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import MentorCard from '../components/MentorCard';
import MentorMap from '../components/MentorMap';
import StudentHeader from '../components/StudentHeader';

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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // AI Matchmaker state
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [aiProvider, setAiProvider] = useState('anthropic'); // Default to anthropic Claude
  const [aiMatches, setAiMatches] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Live-generated loading steps state
  const [matchLoadingStep, setMatchLoadingStep] = useState(0);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [apiDone, setApiDone] = useState(false);

  // Connection Requests tab & status state
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'requests'
  const [sentRequests, setSentRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState({});

  // Review states in Browse
  const [showBrowseReviewModal, setShowBrowseReviewModal] = useState(false);
  const [selectedMentorForReview, setSelectedMentorForReview] = useState(null);
  const [browseReviewRating, setBrowseReviewRating] = useState(5);
  const [browseReviewNote, setBrowseReviewNote] = useState('');
  const [browseReviewSubmitting, setBrowseReviewSubmitting] = useState(false);
  
  const handleBrowseReviewSubmit = async (e) => {
    e.preventDefault();
    if (!browseReviewNote.trim() || !selectedMentorForReview) return;
    setBrowseReviewSubmitting(true);
    try {
      await client.post(`/mentors/${selectedMentorForReview.id}/reviews`, {
        rating: browseReviewRating,
        note: browseReviewNote
      });
      alert("Review submitted successfully!");
      setShowBrowseReviewModal(false);
      setBrowseReviewNote('');
      setSelectedMentorForReview(null);
      await fetchSentRequestsList();
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert(err.response?.data?.detail || "Failed to submit review.");
    } finally {
      setBrowseReviewSubmitting(false);
    }
  };

  // Fetch current user and mentors list on mount
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      setError('');
      let currentUser = null;
      try {
        const userRes = await client.get('/auth/me');
        currentUser = userRes.data;
        setStudent(userRes.data);
        const mappedDetails = {
          name: currentUser.name,
          city: currentUser.city,
          focusArea: currentUser.focus_area || '',
          learntSoFar: currentUser.learnt_so_far || '',
          achievements: currentUser.achievements || '',
          nextTarget: currentUser.next_target || '',
          focus_area: currentUser.focus_area || '',
          learnt_so_far: currentUser.learnt_so_far || '',
          next_target: currentUser.next_target || ''
        };
        localStorage.setItem('studentDetails', JSON.stringify(mappedDetails));
      } catch (err) {
        console.error("Failed to load user info:", err);
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          currentUser = JSON.parse(cachedUser);
          setStudent(currentUser);
        } else {
          navigate('/login');
          return;
        }
      }

      // If student, pre-fetch sent requests to show count badge
      if (currentUser && currentUser.role === 'student') {
        try {
          const sRes = await client.get('/requests/sent');
          setSentRequests(sRes.data);
        } catch (e) {
          console.error("Error fetching sent requests initially:", e);
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
    setIsAiMode(false); // Disable AI matches view if student types keyword filters
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
    setIsAiMode(false);
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

  // Handle AI Matching call
  const handleAiMatchSubmit = async (e) => {
    e.preventDefault();
    if (!aiGoal || aiGoal.trim().length < 5) {
      alert("Please describe your goals in at least 5 characters so the AI has context to match!");
      return;
    }

    setAiLoading(true);
    setError('');
    setMatchLoadingStep(0);
    setApiDone(false);
    setPendingMatches([]);

    try {
      const payload = {
        student_goal: aiGoal,
        provider: aiProvider
      };
      
      const res = await client.post('/mentors/match', payload);
      setPendingMatches(res.data);
      setApiDone(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'AI Matching failed. Please verify API configuration.');
      console.error(err);
      setAiLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (aiLoading) {
      timer = setInterval(() => {
        setMatchLoadingStep((prev) => {
          if (prev >= 2) {
            clearInterval(timer);
            return 3;
          }
          return prev + 1;
        });
      }, 750);
    }
    return () => clearInterval(timer);
  }, [aiLoading]);

  useEffect(() => {
    if (aiLoading && matchLoadingStep === 3 && apiDone) {
      setAiMatches(pendingMatches);
      setAiLoading(false);
      setIsAiMode(true);

      // Cache matches in localStorage for cold-start page reloads
      const cacheObj = {};
      pendingMatches.forEach(match => {
        cacheObj[match.user_id] = {
          score: match.score,
          reason: match.reason
        };
      });
      localStorage.setItem('mentorMatchScores', JSON.stringify(cacheObj));
    }
  }, [aiLoading, matchLoadingStep, apiDone, pendingMatches]);

  const handleExitAiMode = () => {
    setIsAiMode(false);
    setAiGoal('');
  };

  const fetchSentRequestsList = async () => {
    setRequestsLoading(true);
    try {
      const res = await client.get('/requests/sent');
      setSentRequests(res.data);
    } catch (err) {
      console.error("Failed to load sent requests:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const toggleRequestExpand = (id) => {
    setExpandedRequests(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
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

  return (
    <div className="min-h-screen bg-dark-canvas text-silver pb-20 relative overflow-hidden bg-grid-dots">
      {/* Background bleed */}
      <div className="radial-spotlight"></div>
      
      {/* Dynamic Header */}
      <StudentHeader />

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-10 relative z-10">
        
        {/* Banner with mesh background */}
        <div className="p-8 md:p-10 rounded-3xl premium-card shadow-2xl mb-10 overflow-hidden relative">
          <div className="absolute top-1/2 -translate-y-1/2 -right-12 w-80 h-80 bg-gradient-to-r from-glow-violet/10 to-glow-blue/10 rounded-full blur-3xl pointer-events-none animate-float"></div>
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-glow-blue bg-glow-blue/10 py-1 px-3 border border-glow-blue/20 rounded-full">
                ✨ AI MATCHMAKING CORES
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-cyber-white tracking-tight leading-tight">
              Discover Expert Local Mentors
            </h1>
            
            <p className="text-slate-muted text-xs md:text-sm leading-relaxed max-w-2xl font-medium">
              Filter local matches using proximity and topics. Write concrete goals to let the AI rank matching scores and explanations.
            </p>
          </div>
        </div>

        {/* 2-Column Browse Layout (filters on left, grid on right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Sticky sidebar filters */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 h-fit">
            
            {/* AI Matchmaker card */}
            <div className="premium-card p-6 space-y-4 shadow-md relative overflow-hidden">
              <h3 className="text-xs font-black text-glow-violet uppercase tracking-widest flex items-center gap-1.5">
                <span>✨</span> AI Matchmaker
              </h3>

              <form onSubmit={handleAiMatchSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="aiGoal" className="text-[9px] font-black text-slate-muted uppercase tracking-wider block">Your Mentorship Goals</label>
                  <textarea
                    id="aiGoal"
                    required
                    rows="4"
                    value={aiGoal}
                    onChange={(e) => setAiGoal(e.target.value)}
                    placeholder="e.g. I need guidance on entry-level ML engineer interview prep or Quantum RNG research papers."
                    className="w-full bg-[#050505] border border-white/8 text-cyber-white rounded-xl p-3 text-xs outline-none focus:border-glow-violet transition-all resize-none font-sans"
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="aiProvider" className="text-[9px] font-black text-slate-muted uppercase tracking-wider block">AI Match Provider</label>
                  <select
                    id="aiProvider"
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="w-full bg-[#050505] border border-white/8 text-silver rounded-xl p-3 text-xs font-bold outline-none focus:border-glow-violet transition-all cursor-pointer"
                  >
                    <option value="anthropic">🤖 Anthropic Claude 3.5</option>
                    <option value="openai">🧠 OpenAI GPT-4o Model</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={aiLoading}
                  className="w-full py-3 px-4 rounded-xl bg-cyber-white text-black font-extrabold text-xs shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 hover:scale-102"
                >
                  {aiLoading ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full"></div>
                      Matching...
                    </>
                  ) : (
                    <>
                      Generate AI Matches
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {isAiMode && (
                <button
                  onClick={handleExitAiMode}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-muted font-bold text-xs cursor-pointer transition-all text-center"
                >
                  Exit AI Matchmaker
                </button>
              )}
            </div>

            {/* AI Recommendation Journey */}
            {isAiMode && (
              <div className="premium-card p-6 space-y-4 animate-stagger-fade">
                <h3 className="text-xs font-black text-glow-violet uppercase tracking-widest">AI Matching Journey</h3>
                <div className="relative pl-6 border-l border-glow-violet/20 space-y-4 font-sans text-xs">
                  <div className="relative">
                    <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-glow-violet/20 border border-glow-violet flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-glow-violet animate-pulse"></div>
                    </div>
                    <div className="font-extrabold text-cyber-white">Parsed Target Domain</div>
                    <p className="text-slate-muted mt-0.5">{aiGoal.length > 35 ? `${aiGoal.substring(0, 35)}...` : aiGoal}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-glow-violet/20 border border-glow-violet flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-glow-violet animate-pulse"></div>
                    </div>
                    <div className="font-extrabold text-cyber-white">Filtered Locality</div>
                    <p className="text-slate-muted mt-0.5">Matched in {student?.city}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="font-extrabold text-emerald-400">Matches Ranked</div>
                    <p className="text-slate-muted mt-0.5">Found {aiMatches.length} matching mentors</p>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="premium-card p-6 space-y-4 shadow-md">
              <h3 className="text-xs font-black text-slate-muted uppercase tracking-widest">Keyword Search</h3>
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search name, bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#050505] border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-xs text-cyber-white placeholder-slate-dark outline-none focus:border-glow-blue transition-all"
                />
                <svg className="w-3.5 h-3.5 text-slate-dark absolute left-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>

              <button
                onClick={handleLocalToggle}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all duration-300 cursor-pointer ${
                  localOnly
                    ? 'bg-glow-blue/10 border-glow-blue/30 text-glow-blue'
                    : 'bg-[#050505] border-white/8 text-slate-muted hover:border-white/15'
                }`}
              >
                📍 Local Match ({student?.city})
              </button>
            </div>

            {/* Popular Domains */}
            <div className="premium-card p-6 space-y-3 shadow-md">
              <h3 className="text-xs font-black text-slate-muted uppercase tracking-widest">Filter by Domain</h3>
              <div className="flex flex-col gap-1.5">
                {POPULAR_DOMAINS.map((domain) => {
                  const isSelected = selectedDomain === domain;
                  return (
                    <button
                      key={domain}
                      onClick={() => handleDomainSelect(domain)}
                      className={`text-left py-2 px-3 rounded-lg font-bold text-xs transition-all border cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-glow-violet/10 border-glow-violet/20 text-glow-blue'
                          : 'bg-transparent border-transparent hover:bg-white/5 text-slate-muted'
                      }`}
                    >
                      <span>{domain}</span>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-glow-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Grid and Views */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Tab selection */}
            <div className="flex border-b border-white/8 gap-6">
              <button
                onClick={() => setActiveTab('browse')}
                className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
                  activeTab === 'browse' ? 'text-cyber-white' : 'text-slate-muted hover:text-cyber-white'
                }`}
              >
                Browse Mentors
                {activeTab === 'browse' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-white rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('requests');
                  fetchSentRequestsList();
                }}
                className={`pb-3 font-bold text-sm transition-all relative cursor-pointer flex items-center gap-2 ${
                  activeTab === 'requests' ? 'text-cyber-white' : 'text-slate-muted hover:text-cyber-white'
                }`}
              >
                Requests Tracker
                {sentRequests.length > 0 && (
                  <span className="py-0.5 px-2 text-[9px] bg-white/10 text-cyber-white border border-white/10 rounded-full font-black">
                    {sentRequests.length}
                  </span>
                )}
                {activeTab === 'requests' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-white rounded-full"></div>
                )}
              </button>
            </div>

            {activeTab === 'requests' ? (
              // Sent Requests View
              requestsLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-white"></div>
                </div>
              ) : sentRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-dark-card border border-white/8 rounded-3xl text-center max-w-md mx-auto mt-6">
                  <h3 className="text-base font-bold text-cyber-white mb-1">No Requests Sent</h3>
                  <p className="text-slate-muted text-xs mb-6 max-w-xs leading-relaxed">
                    Submit a connection request to any mentor inside their profile view to start networking.
                  </p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="py-2.5 px-5 rounded-xl bg-cyber-white text-black font-extrabold text-xs cursor-pointer hover:scale-102"
                  >
                    Browse Mentors
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((req) => {
                    const isExpanded = !!expandedRequests[req.id];
                    let statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                    if (req.status === 'accepted') statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                    if (req.status === 'declined') statusColor = 'text-red-400 bg-red-500/10 border-red-500/20';

                    return (
                      <div 
                        key={req.id}
                        className="premium-card p-6 shadow-md"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-glow-violet to-glow-blue flex items-center justify-center text-cyber-white font-extrabold text-lg shadow-md shrink-0">
                              {req.mentor?.name ? req.mentor.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'M'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-cyber-white font-bold text-base leading-snug">{req.mentor?.name}</h4>
                                <span className="text-[10px] text-slate-dark">•</span>
                                <span className="text-[10px] text-slate-muted font-bold">
                                  {req.status === 'accepted' ? 'Accepted' : req.status === 'declined' ? 'Declined' : 'Sent'} {formatTimeAgo(req.updated_at || req.created_at)}
                                </span>
                              </div>
                              <p className="text-slate-muted text-xs flex items-center gap-1 mt-0.5">
                                📍 {req.mentor?.city}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-start sm:self-center">
                            <span className={`py-1.5 px-3 rounded-lg border text-xs font-black uppercase tracking-wider ${statusColor}`}>
                              {req.status}
                            </span>
                            
                            {req.status === 'accepted' && (
                              <button
                                onClick={() => {
                                  setSelectedMentorForReview(req.mentor);
                                  setShowBrowseReviewModal(true);
                                }}
                                className="py-1.5 px-3 rounded-lg bg-glow-blue/15 border border-glow-blue/30 text-glow-blue hover:text-cyber-white text-xs font-black uppercase transition-all cursor-pointer"
                              >
                                ★ Rate
                              </button>
                            )}
                            
                            <button
                              onClick={() => toggleRequestExpand(req.id)}
                              className="py-1.5 px-3 rounded-lg bg-[#050505] border border-white/8 text-slate-muted hover:text-cyber-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              {isExpanded ? 'Hide Details' : 'View Details'}
                              <svg className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        {isExpanded && (
                          <div className="mt-6 pt-5 border-t border-white/8 space-y-4 text-xs animate-stagger-fade">
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-muted uppercase tracking-widest block">1. What specifically do you want to learn or achieve?</span>
                              <p className="text-silver bg-[#050505] p-3.5 rounded-2xl border border-white/5 leading-relaxed font-medium">
                                {req.answer_1}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-muted uppercase tracking-widest block">2. What have you already tried or explored on your own?</span>
                              <p className="text-silver bg-[#050505] p-3.5 rounded-2xl border border-white/5 leading-relaxed font-medium">
                                {req.answer_2}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-muted uppercase tracking-widest block">3. What is your concrete ask for the first session?</span>
                              <p className="text-silver bg-[#050505] p-3.5 rounded-2xl border border-white/5 leading-relaxed font-medium">
                                {req.answer_3}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <>
                {/* Active filters summary */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-1">
                  <div className="text-xs text-slate-muted">
                    {isAiMode ? (
                      <span className="flex items-center gap-1.5 font-bold text-glow-violet">
                        <span className="animate-pulse">⚡</span> AI recommendations computed based on goals.
                      </span>
                    ) : (
                      <span>Showing <strong className="text-cyber-white">{mentors.length}</strong> available mentors in Discovery Grid</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* View Mode Toggle switcher */}
                    <div className="flex rounded-xl bg-slate-950 border border-slate-900 p-1">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'list'
                            ? 'bg-slate-900 border border-slate-800 text-cyber-white shadow-inner'
                            : 'text-slate-muted hover:text-cyber-white'
                        }`}
                      >
                        List View
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'map'
                            ? 'bg-slate-900 border border-slate-800 text-cyber-white shadow-inner'
                            : 'text-slate-muted hover:text-cyber-white'
                        }`}
                      >
                        Map View
                      </button>
                    </div>

                    {(searchQuery || selectedDomain || localOnly || isAiMode) && (
                      <button
                        onClick={handleClearFilters}
                        className="py-1 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-muted text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-sm animate-pulse">
                    {error}
                  </div>
                )}

                {loading ? (
                  // Skeleton Loading (arranged in 3-column discovery format)
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="bg-dark-card border border-white/8 p-6 rounded-3xl flex flex-col justify-between h-80">
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="w-14 h-14 bg-[#050505] rounded-2xl shrink-0"></div>
                            <div className="flex-1 space-y-2 py-1">
                              <div className="h-4 bg-[#050505] rounded w-3/4"></div>
                              <div className="h-3 bg-[#050505] rounded w-1/2"></div>
                            </div>
                          </div>
                          <div className="h-3 bg-[#050505] rounded w-1/3"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-[#050505] rounded w-full"></div>
                            <div className="h-3 bg-[#050505] rounded w-5/6"></div>
                          </div>
                        </div>
                        <div className="h-9 bg-[#050505] rounded-xl w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : aiLoading ? (
                  // Live-generated loading steps
                  <div className="premium-card p-8 shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[350px] animate-stagger-fade">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-glow-violet/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="relative z-10 space-y-8 max-w-md mx-auto w-full">
                      <div className="flex flex-col items-center justify-center text-center space-y-3">
                        <div className="relative flex items-center justify-center">
                          <span className="absolute inline-flex h-12 w-12 rounded-full bg-glow-violet/20 animate-ping"></span>
                          <div className="relative p-3 bg-glow-violet/10 border border-glow-violet/20 rounded-2xl text-glow-violet">
                            <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-cyber-white">Calibrating AI Matches</h3>
                          <p className="text-slate-muted text-xs mt-1">Ranking availability and proximity overlap</p>
                        </div>
                      </div>

                      <div className="space-y-4 font-sans text-xs">
                        <div className={`flex items-center gap-3 transition-all duration-300 ${matchLoadingStep >= 0 ? 'opacity-100' : 'opacity-30'}`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                            matchLoadingStep > 0
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-glow-violet/10 text-glow-violet border border-glow-violet/30 animate-pulse'
                          }`}>
                            {matchLoadingStep > 0 ? '✓' : '1'}
                          </div>
                          <span className={`font-bold ${matchLoadingStep === 0 ? 'text-glow-violet' : 'text-slate-muted'}`}>
                            {matchLoadingStep > 0 ? 'Domain compatibility analyzed' : 'Analyzing domain compatibility...'}
                          </span>
                        </div>

                        <div className={`flex items-center gap-3 transition-all duration-300 ${matchLoadingStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                            matchLoadingStep > 1
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : matchLoadingStep === 1
                                ? 'bg-glow-violet/10 text-glow-violet border border-glow-violet/30 animate-pulse'
                                : 'bg-slate-900 text-slate-dark border border-slate-800'
                          }`}>
                            {matchLoadingStep > 1 ? '✓' : '2'}
                          </div>
                          <span className={`font-bold ${matchLoadingStep === 1 ? 'text-glow-violet' : 'text-slate-muted'}`}>
                            {matchLoadingStep > 1 ? 'Locality relevance verified' : 'Verifying locality overlap...'}
                          </span>
                        </div>

                        <div className={`flex items-center gap-3 transition-all duration-300 ${matchLoadingStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                            matchLoadingStep > 2
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : matchLoadingStep === 2
                                ? 'bg-glow-violet/10 text-glow-violet border border-glow-violet/30 animate-pulse'
                                : 'bg-slate-900 text-slate-dark border border-slate-800'
                          }`}>
                            {matchLoadingStep > 2 ? '✓' : '3'}
                          </div>
                          <span className={`font-bold ${matchLoadingStep === 2 ? 'text-glow-violet' : 'text-slate-muted'}`}>
                            {matchLoadingStep > 2 ? 'Compatibility fit calibrated' : 'Ranking compatibility and fit...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isAiMode && aiMatches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-dark-card border border-white/8 rounded-3xl text-center max-w-lg mx-auto mt-6">
                    <h3 className="text-lg font-bold text-cyber-white mb-2">No AI Matches Found</h3>
                    <p className="text-slate-muted text-xs mb-6 max-w-sm">
                      Try adjusting the goals context or verify the local database state.
                    </p>
                    <button
                      onClick={handleExitAiMode}
                      className="py-2.5 px-5 rounded-xl bg-[#050505] border border-white/8 text-cyber-white font-bold text-xs cursor-pointer"
                    >
                      Exit AI Matchmaker
                    </button>
                  </div>
                ) : viewMode === 'map' ? (
                  <MentorMap
                    mentors={isAiMode ? aiMatches : mentors}
                    studentCity={student?.city}
                  />
                ) : isAiMode ? (
                  // AI matches split: Hero vs Grid
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-glow-blue bg-glow-blue/10 py-1 px-3 border border-glow-blue/20 rounded-full">
                        🏆 Top Recommendation
                      </span>
                      <div className="grid grid-cols-1">
                        <MentorCard
                          mentor={aiMatches[0]}
                          studentCity={student?.city}
                          isTopMatch={true}
                        />
                      </div>
                    </div>

                    {aiMatches.length > 1 && (
                      <div className="space-y-3 pt-4">
                        <h4 className="text-[9px] font-black text-slate-dark uppercase tracking-widest">Other Compatible matches</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {aiMatches.slice(1).map((match) => (
                            <MentorCard
                              key={match.mentor_id}
                              mentor={match}
                              studentCity={student?.city}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : mentors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-dark-card border border-white/8 rounded-3xl text-center max-w-lg mx-auto mt-6">
                    <h3 className="text-base font-bold text-cyber-white mb-2">No Matches Found</h3>
                    <p className="text-slate-muted text-xs mb-6 leading-relaxed max-w-xs">
                      Clear filters or untoggle local configurations to reveal all mentor profiles.
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="py-2 px-5 rounded-xl bg-slate-900 border border-slate-800 text-cyber-white font-bold text-xs cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  // Standard Grid View (3 Columns Layout)
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {mentors.map((mentor) => (
                      <MentorCard
                        key={mentor.id}
                        mentor={mentor}
                        studentCity={student?.city}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

        </div>

      </main>

      {showBrowseReviewModal && selectedMentorForReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-stagger-fade">
          <div className="bg-[#0D0D11] border border-white/8 p-6 rounded-3xl w-full max-w-md space-y-6 shadow-2xl relative">
            <button 
              onClick={() => {
                setShowBrowseReviewModal(false);
                setSelectedMentorForReview(null);
              }}
              className="absolute top-4 right-4 text-slate-dark hover:text-cyber-white text-base border-0 bg-transparent cursor-pointer font-bold"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[9px] font-black text-glow-violet uppercase tracking-widest block">FEEDBACK FORM</span>
              <h3 className="text-lg font-black text-cyber-white">Rate {selectedMentorForReview.name}</h3>
              <p className="text-[10px] text-slate-muted">Share your thoughts on session coordination and technical support.</p>
            </div>

            <form onSubmit={handleBrowseReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-muted uppercase block">Select Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setBrowseReviewRating(star)}
                      className="bg-transparent border-0 cursor-pointer p-0"
                    >
                      <svg 
                        className={`w-6 h-6 ${star <= browseReviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700 fill-slate-700'}`} 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="browseReviewNote" className="text-[9px] font-black text-slate-muted uppercase block">Review Description</label>
                <textarea
                  id="browseReviewNote"
                  required
                  rows="3"
                  value={browseReviewNote}
                  onChange={(e) => setBrowseReviewNote(e.target.value)}
                  placeholder="Describe how this mentor helped you..."
                  className="w-full bg-[#050505] border border-white/8 text-cyber-white rounded-xl p-3 text-xs outline-none focus:border-white transition-all resize-none font-sans"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={browseReviewSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-cyber-white text-black font-extrabold text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  {browseReviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBrowseReviewModal(false);
                    setSelectedMentorForReview(null);
                  }}
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
