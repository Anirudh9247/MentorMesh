import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import StudentHeader from '../components/StudentHeader';
import client from '../api/client';

export default function StudentDashboard() {
  const [student, setStudent] = useState({
    name: 'Student Name',
    city: 'Hyderabad',
    focusArea: 'Advanced Systems',
    learntSoFar: 'React hooks, basic Python, SQL foundations',
    achievements: 'Co-built student directory, solved 50+ LeetCode milestones',
    nextTarget: 'Vite & Tailwind v4 production compilation'
  });
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ ...student });
  const [loading, setLoading] = useState(true);

  // Map state configuration
  const [zoomLevel, setZoomLevel] = useState(1); // Zoom factor for SVG rendering
  const [showRings, setShowRings] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const [mapCenter, setMapCenter] = useState({ x: 250, y: 100 }); // Centering offset
  
  // Tracked entities (local mentors from DB)
  const [localMentors, setLocalMentors] = useState([]);
  const [selectedMentorEntity, setSelectedMentorEntity] = useState(null);

  // Live simulation coordinates
  const [myPos, setMyPos] = useState({ x: 250, y: 100 });
  const [routeHistory, setRouteHistory] = useState([{ x: 250, y: 100 }]);
  const [locationLogs, setLocationLogs] = useState([
    { time: '07:30:00 AM', desc: 'Telemetry connection initialized' }
  ]);

  // Load student info and local mentors
  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      
      // Load student details
      const studentDetails = localStorage.getItem('studentDetails');
      if (studentDetails) {
        try {
          const parsed = JSON.parse(studentDetails);
          const defaultDetails = {
            name: parsed.name || 'Student Name',
            city: parsed.city || 'Hyderabad',
            focusArea: parsed.focusArea || 'Advanced Systems',
            learntSoFar: parsed.learntSoFar || 'React hooks, basic Python, SQL foundations',
            achievements: parsed.achievements || 'Co-built student directory, solved 50+ LeetCode milestones',
            nextTarget: parsed.nextTarget || 'Vite & Tailwind v4 production compilation'
          };
          setStudent(defaultDetails);
          setEditForm(defaultDetails);
        } catch (e) {
          console.error(e);
        }
      }

      // Fetch all mentors to find local ones
      try {
        const res = await client.get('/mentors');
        // Parse city from current student
        let targetCity = 'Hyderabad';
        if (studentDetails) {
          targetCity = JSON.parse(studentDetails).city || 'Hyderabad';
        }
        
        // Filter mentors in the same city
        const local = res.data.filter(
          m => m.user?.city && m.user.city.toLowerCase().trim() === targetCity.toLowerCase().trim()
        );
        
        // Map to vector coordinates on the map
        const mapped = local.map((mentor, index) => {
          // Generate semi-random static coordinates around the center for the city mapping
          const offsetAngle = (index * 2 * Math.PI) / (local.length || 1);
          const distance = 40 + (index * 15); // pixels from center
          return {
            id: mentor.id,
            name: mentor.user?.name || 'Mentor',
            city: mentor.user?.city || 'City',
            specialty: mentor.domains?.[0] || 'Tech Expert',
            x: 250 + Math.cos(offsetAngle) * distance,
            y: 100 + Math.sin(offsetAngle) * distance,
            distanceKm: (2.0 + index * 0.7).toFixed(1),
            color: index % 2 === 0 ? '#6366F1' : '#38BDF8' // Alternating colors
          };
        });
        setLocalMentors(mapped);
      } catch (err) {
        console.error("Failed to load mentors for map widget:", err);
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, []);

  // Live Location tracking path simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMyPos((prev) => {
        // Move slightly to simulate walking/travel
        const deltaX = (Math.random() - 0.5) * 6;
        const deltaY = (Math.random() - 0.5) * 6;
        const newX = Math.max(100, Math.min(400, prev.x + deltaX));
        const newY = Math.max(40, Math.min(160, prev.y + deltaY));
        
        const newPoint = { x: newX, y: newY };
        setRouteHistory((prevHistory) => [...prevHistory, newPoint].slice(-15)); // Keep last 15 steps
        
        // Log telemetry update
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        setLocationLogs((prevLogs) => [
          { time: timeStr, desc: `Lat/Lng coordinates recalculated (Delta: ΔX:${deltaX.toFixed(1)}, ΔY:${deltaY.toFixed(1)})` },
          ...prevLogs.slice(0, 4) // Keep last 5 logs
        ]);
        
        return newPoint;
      });
    }, 4000); // Update every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setStudent(editForm);
    localStorage.setItem('studentDetails', JSON.stringify(editForm));
    setIsEditingProfile(false);
  };

  const recenterMapOnSelf = () => {
    setMapCenter({ x: myPos.x, y: myPos.y });
    setSelectedMentorEntity(null);
  };

  const focusMapOnMentor = (mentor) => {
    setSelectedMentorEntity(mentor);
    setMapCenter({ x: mentor.x, y: mentor.y });
  };

  const mockCourses = [
    { title: 'AI Engineering & Neural Architectures', mentor: 'Harsha Vardhan', progress: 75 },
    { title: 'React 19 Server Components Architecture', mentor: 'Rajesh Kumar', progress: 40 }
  ];

  return (
    <div className="min-h-screen bg-dark-canvas text-silver pb-20 relative overflow-hidden bg-grid-dots">
      <div className="radial-spotlight"></div>
      
      <StudentHeader />

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-10 relative z-10">
        
        {/* Banner */}
        <div className="mb-10 animate-stagger-fade">
          <span className="text-[9px] font-black uppercase tracking-widest text-glow-blue bg-glow-blue/10 py-1 px-3 border border-glow-blue/20 rounded-full">
            Technical Workspace
          </span>
          <h1 className="text-3xl font-black text-cyber-white tracking-tight mt-2 animate-pulse">
            Dashboard Coordinates
          </h1>
          <p className="text-slate-muted text-xs mt-1">
            Manage target learnings, verify achievements, and inspect real-time proximity maps.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Left Column (30% - Student details & profile editing) */}
          <div className="lg:col-span-3 space-y-6 animate-stagger-fade delay-100">
            
            {/* Student Profile Card (Dynamic view vs edit modes) */}
            <div className="premium-card p-6 space-y-5">
              {!isEditingProfile ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-glow-violet to-glow-blue flex items-center justify-center text-cyber-white font-extrabold text-lg shadow-md shrink-0">
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-cyber-white truncate">{student.name}</h3>
                      <p className="text-slate-muted text-[10px] font-semibold mt-0.5">📍 {student.city}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-4 text-xs">
                    <div>
                      <span className="text-[9px] font-black text-slate-muted uppercase tracking-wider block">Academic Focus</span>
                      <span className="text-cyber-white font-bold text-xs">{student.focusArea}</span>
                    </div>

                    <div>
                      <span className="text-[9px] font-black text-slate-muted uppercase tracking-wider block">What I've Learnt</span>
                      <p className="text-slate-muted text-[11px] leading-relaxed mt-0.5">{student.learntSoFar}</p>
                    </div>

                    <div>
                      <span className="text-[9px] font-black text-slate-muted uppercase tracking-wider block">What I've Done Until Now</span>
                      <p className="text-slate-muted text-[11px] leading-relaxed mt-0.5">{student.achievements}</p>
                    </div>

                    <div>
                      <span className="text-[9px] font-black text-glow-blue uppercase tracking-wider block">Next Milestone Target</span>
                      <p className="text-silver text-[11px] font-semibold mt-0.5">🎯 {student.nextTarget}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditForm({ ...student });
                      setIsEditingProfile(true);
                    }}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-white/8 text-cyber-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Edit Profile Coordinates
                  </button>
                </>
              ) : (
                /* Profile Update Form */
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <span className="text-xs font-black text-glow-violet uppercase tracking-widest">Update Profile</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[9px] font-black text-slate-muted uppercase block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-[#050505] border border-white/8 text-cyber-white rounded-lg p-2 outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-muted uppercase block mb-1">Your City</label>
                      <input
                        type="text"
                        required
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full bg-[#050505] border border-white/8 text-cyber-white rounded-lg p-2 outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-muted uppercase block mb-1">Focus Area</label>
                      <input
                        type="text"
                        required
                        value={editForm.focusArea}
                        onChange={(e) => setEditForm({ ...editForm, focusArea: e.target.value })}
                        className="w-full bg-[#050505] border border-white/8 text-cyber-white rounded-lg p-2 outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-muted uppercase block mb-1">What I've Learnt</label>
                      <textarea
                        required
                        rows="2"
                        value={editForm.learntSoFar}
                        onChange={(e) => setEditForm({ ...editForm, learntSoFar: e.target.value })}
                        className="w-full bg-[#050505] border border-white/8 text-cyber-white rounded-lg p-2 outline-none focus:border-white transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-muted uppercase block mb-1">What I've Done Until Now</label>
                      <textarea
                        required
                        rows="2"
                        value={editForm.achievements}
                        onChange={(e) => setEditForm({ ...editForm, achievements: e.target.value })}
                        className="w-full bg-[#050505] border border-white/8 text-cyber-white rounded-lg p-2 outline-none focus:border-white transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-glow-blue uppercase block mb-1">Next Milestone Target</label>
                      <input
                        type="text"
                        required
                        value={editForm.nextTarget}
                        onChange={(e) => setEditForm({ ...editForm, nextTarget: e.target.value })}
                        className="w-full bg-[#050505] border border-white/8 text-cyber-white rounded-lg p-2 outline-none focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 rounded-lg bg-cyber-white text-black font-extrabold text-[10px] uppercase cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 py-2 px-3 rounded-lg bg-slate-900 border border-white/8 text-slate-muted font-bold text-[10px] uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Actions widget */}
            <div className="premium-card p-6 space-y-4">
              <h4 className="text-xs font-black text-slate-muted uppercase tracking-widest">Active Workspace</h4>
              <div className="flex flex-col gap-2">
                <Link
                  to="/browse"
                  className="w-full py-2.5 px-4 rounded-xl bg-cyber-white text-black font-extrabold text-xs text-center hover:scale-102 interactive-element cursor-pointer"
                >
                  Discover New Mentors
                </Link>
                <Link
                  to="/chat"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-white/8 text-cyber-white font-bold text-xs text-center hover:bg-slate-850 interactive-element cursor-pointer"
                >
                  Open Workspace Chat
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column (70% - Performance and Mapping Widget) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Real-Time Proximity Mapping Widget */}
            <div className="premium-card p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-4 animate-stagger-fade delay-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-black text-cyber-white uppercase tracking-wider">Locality Proximity Radar</h3>
                  <p className="text-[10px] text-slate-muted">Real-time telemetry tracking of local active mentors in {student.city}</p>
                </div>
                
                {/* Layer Control buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRings(!showRings)}
                    className={`py-1 px-2.5 rounded-lg border text-[9px] font-black uppercase tracking-wider cursor-pointer ${
                      showRings ? 'bg-glow-blue/15 border-glow-blue/30 text-glow-blue' : 'bg-[#050505] border-white/5 text-slate-muted'
                    }`}
                  >
                    Rings
                  </button>
                  <button
                    onClick={() => setShowClusters(!showClusters)}
                    className={`py-1 px-2.5 rounded-lg border text-[9px] font-black uppercase tracking-wider cursor-pointer ${
                      showClusters ? 'bg-glow-violet/15 border-glow-violet/30 text-glow-violet' : 'bg-[#050505] border-white/5 text-slate-muted'
                    }`}
                  >
                    Pins
                  </button>
                </div>
              </div>

              {/* Asymmetric Map Layout: 70% Map canvas, 30% telemetry logs */}
              <div className="grid grid-cols-1 md:grid-cols-10 gap-4 border border-white/8 rounded-2xl overflow-hidden bg-[#050505]/40 min-h-[350px]">
                
                {/* 70% Map Canvas (SVG Vector Map) */}
                <div className="md:col-span-7 relative h-[350px] md:h-auto overflow-hidden bg-[#050505]">
                  
                  {/* Status Indicator */}
                  <div className="absolute top-4 left-4 z-20 bg-[#0d0d11]/85 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/8 text-[9px] font-mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Radar active: {student.city}</span>
                  </div>

                  {/* Navigation Zoom Controls */}
                  <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5">
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                      className="w-7 h-7 rounded-lg bg-[#0d0d11]/90 border border-white/8 text-cyber-white flex items-center justify-center font-bold text-sm cursor-pointer hover:border-white transition-colors"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                      className="w-7 h-7 rounded-lg bg-[#0d0d11]/90 border border-white/8 text-cyber-white flex items-center justify-center font-bold text-sm cursor-pointer hover:border-white transition-colors"
                    >
                      -
                    </button>
                    <button
                      onClick={recenterMapOnSelf}
                      className="w-7 h-7 rounded-lg bg-[#0d0d11]/90 border border-white/8 text-cyber-white flex items-center justify-center font-bold text-[10px] cursor-pointer hover:border-white transition-colors"
                      title="Recenter Map"
                    >
                      ⌖
                    </button>
                  </div>

                  {/* Vector SVG Grid Layout */}
                  <svg 
                    className="w-full h-full cursor-grab active:cursor-grabbing select-none"
                    viewBox="0 0 500 200"
                  >
                    <defs>
                      <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                      </pattern>
                    </defs>

                    {/* Background Grid Pattern */}
                    <rect width="100%" height="100%" fill="url(#mapGrid)" />

                    {/* SVG Map Camera translation group */}
                    <g 
                      transform={`translate(${(250 - mapCenter.x) * zoomLevel}, ${(100 - mapCenter.y) * zoomLevel}) scale(${zoomLevel})`} 
                      className="origin-center transition-transform duration-500 ease-out"
                    >
                      {/* Concentric Proximity Range Rings */}
                      {showRings && (
                        <>
                          <circle cx="250" cy="100" r="40" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1.5" strokeDasharray="3,3" />
                          <circle cx="250" cy="100" r="80" fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="1.5" strokeDasharray="5,5" />
                          <circle cx="250" cy="100" r="120" fill="none" stroke="rgba(56, 189, 248, 0.02)" strokeWidth="1.5" strokeDasharray="5,5" />
                        </>
                      )}

                      {/* Route Polyline Trail */}
                      <polyline
                        points={routeHistory.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="2,2"
                        opacity="0.85"
                      />

                      {/* Student own pulsing marker */}
                      <g transform={`translate(${myPos.x}, ${myPos.y})`}>
                        <circle r="12" fill="rgba(56, 189, 248, 0.15)" className="animate-ping" />
                        <circle r="6" fill="#38BDF8" className="stroke-dark-canvas" strokeWidth="1.5" />
                      </g>

                      {/* Mentor nodes/entity clusters */}
                      {showClusters && localMentors.map((mentor) => {
                        const isFocused = selectedMentorEntity?.id === mentor.id;
                        return (
                          <g 
                            key={mentor.id} 
                            transform={`translate(${mentor.x}, ${mentor.y})`}
                            onClick={() => focusMapOnMentor(mentor)}
                            className="cursor-pointer"
                          >
                            <circle 
                              r={isFocused ? "10" : "8"} 
                              fill={`${mentor.color}22`} 
                              className={isFocused ? 'animate-pulse' : ''} 
                            />
                            <circle 
                              r={isFocused ? "6" : "4.5"} 
                              fill={mentor.color} 
                              className="stroke-dark-canvas transition-all" 
                              strokeWidth="1.5" 
                            />
                            {/* Short label */}
                            <text
                              y="-12"
                              textAnchor="middle"
                              fill="#FFFFFF"
                              className="text-[7px] font-bold font-mono tracking-tight bg-black/80 px-1 pointer-events-none"
                            >
                              {mentor.name.split(' ')[0]}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>

                {/* 30% Telemetry Activity sidebar */}
                <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-white/8 flex flex-col justify-between p-4 bg-[#0D0D11]/60">
                  <div className="space-y-4">
                    <span className="text-[9px] font-black text-slate-muted uppercase tracking-wider block">Telemetry Sidebar</span>
                    
                    {/* List local entities */}
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {localMentors.length === 0 ? (
                        <div className="text-[10px] text-slate-muted italic py-2">
                          No mentors currently active in {student.city} coordinates.
                        </div>
                      ) : (
                        localMentors.map((mentor) => (
                          <button
                            key={mentor.id}
                            onClick={() => focusMapOnMentor(mentor)}
                            className={`w-full text-left p-2 rounded-lg text-[10px] border transition-all cursor-pointer block ${
                              selectedMentorEntity?.id === mentor.id
                                ? 'bg-white/5 border-white/10 text-cyber-white'
                                : 'bg-transparent border-transparent hover:bg-white/3 text-slate-muted'
                            }`}
                          >
                            <div className="flex justify-between font-bold">
                              <span className="truncate">{mentor.name}</span>
                              <span className="text-glow-blue shrink-0">{mentor.distanceKm} km</span>
                            </div>
                            <div className="text-[8px] text-slate-dark mt-0.5">{mentor.specialty}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Location History Logs */}
                  <div className="border-t border-white/5 pt-3 space-y-2 mt-3 shrink-0">
                    <span className="text-[8px] font-mono text-slate-dark uppercase tracking-wider block">Real-time Location Log</span>
                    <div className="space-y-1.5 max-h-[90px] overflow-y-auto font-mono text-[9px] text-slate-muted leading-tight">
                      {locationLogs.map((log, index) => (
                        <div key={index} className="flex gap-1.5">
                          <span className="text-slate-dark shrink-0">[{log.time.split(' ')[0]}]</span>
                          <span className="truncate">{log.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Active Courses */}
            <div className="premium-card p-6 space-y-6">
              <h3 className="text-sm font-black text-slate-muted uppercase tracking-widest border-b border-white/5 pb-3">
                Active Courses & Mentorships
              </h3>
              
              <div className="space-y-6">
                {mockCourses.map((course, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <h4 className="font-bold text-cyber-white">{course.title}</h4>
                        <span className="text-[11px] text-slate-muted">Mentor: {course.mentor}</span>
                      </div>
                      <span className="text-glow-blue font-bold">{course.progress}%</span>
                    </div>

                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-glow-violet to-glow-blue h-full rounded-full progress-fill-anim"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
