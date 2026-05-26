import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function DesignShowcase() {
  const [blurVal, setBlurVal] = useState(16); // backdrop blur in px
  const [radiusVal, setRadiusVal] = useState(24); // border-radius in px
  const [opacityVal, setOpacityVal] = useState(40); // bg opacity in %
  const [activeTab, setActiveTab] = useState('glass'); // showcase navigation

  // Mock data for showcase
  const mockDomains = ['AI/ML Matching', 'Quantum Computing', 'Locality Routing', 'React 18 Architecture'];

  return (
    <div className="min-h-screen bg-dark-950 text-white bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-950/20 via-dark-950 to-dark-950 pb-20 font-sans">
      
      {/* Top Banner Header */}
      <header className="border-b border-slate-900 bg-dark-950/80 backdrop-blur-xl py-6 px-8 sticky top-0 z-40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-500/10 rounded-2xl border border-primary-500/25 text-primary-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-white to-primary-400 bg-clip-text text-transparent tracking-tight">
              MentorMesh Design System
            </h1>
            <p className="text-xs text-slate-400">Interactive Glassmorphism & UI Playground</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/browse" className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-semibold text-slate-300 transition-colors cursor-pointer">
            Browse Dashboard
          </Link>
          <Link to="/login" className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-sm font-bold text-white transition-all cursor-pointer">
            Login Page
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Showcase Sections</h3>
          {[
            { id: 'glass', label: 'Glassmorphism Playground', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
            { id: 'components', label: 'Interactive Cards & Badges', icon: 'M4 5a1 1 0 01.724-.276L19.724 4.5A1 1 0 0121 5.5v13a1 1 0 01-1.276.965L4.724 19.5A1 1 0 013 18.5V5.5A1 1 0 014 5z' },
            { id: 'buttons', label: 'Micro-Animations & Inputs', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === item.id
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}

          {/* Guidelines Box */}
          <div className="p-5 bg-dark-900/30 border border-slate-900 rounded-3xl mt-8 space-y-4">
            <h4 className="text-xs font-bold text-primary-400 uppercase tracking-wider">Aesthetic Guide</h4>
            <ul className="text-xs text-slate-400 space-y-2.5 leading-relaxed">
              <li>• <strong className="text-slate-200">Color System:</strong> Electric indigo (primary), soft slate, and golden rating accents on absolute black backgrounds.</li>
              <li>• <strong className="text-slate-200">Depth Filters:</strong> 12px-20px backdrop blurs combined with 1px semi-transparent borders represent our visual signature.</li>
              <li>• <strong className="text-slate-200">Animations:</strong> Hover translations, active scaling, and pulsing local states keep layouts feeling alive.</li>
            </ul>
          </div>
        </div>

        {/* Showcase Content area */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: GLASSMORPHISM PLAYGROUND */}
          {activeTab === 'glass' && (
            <div className="space-y-8">
              <div className="bg-dark-900/20 border border-slate-900/50 p-6 rounded-3xl">
                <h2 className="text-2xl font-extrabold text-white mb-2">Frosted Glass Configurator</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Adjust the blurs, opacity, and rounded corners in real-time to preview how glassmorphic cards reflect the electric background glow.
                </p>
              </div>

              {/* Grid of controllers and result */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Controllers */}
                <div className="p-6 bg-slate-950 border border-slate-900 rounded-3xl space-y-6">
                  <h3 className="font-bold text-slate-300 border-b border-slate-900 pb-3">Adjust Styles</h3>
                  
                  {/* Blur slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Backdrop Blur</span>
                      <span className="text-primary-400">{blurVal}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="40" value={blurVal} 
                      onChange={(e) => setBlurVal(parseInt(e.target.value))}
                      className="w-full accent-primary-500"
                    />
                  </div>

                  {/* Opacity slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Background Opacity</span>
                      <span className="text-primary-400">{opacityVal}%</span>
                    </div>
                    <input 
                      type="range" min="5" max="95" value={opacityVal} 
                      onChange={(e) => setOpacityVal(parseInt(e.target.value))}
                      className="w-full accent-primary-500"
                    />
                  </div>

                  {/* Border radius slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Border Radius (Rounded Corners)</span>
                      <span className="text-primary-400">{radiusVal}px</span>
                    </div>
                    <input 
                      type="range" min="4" max="40" value={radiusVal} 
                      onChange={(e) => setRadiusVal(parseInt(e.target.value))}
                      className="w-full accent-primary-500"
                    />
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="relative flex items-center justify-center p-8 bg-slate-950 border border-slate-900 rounded-3xl min-h-[300px] overflow-hidden">
                  {/* Glowing background circles for visual depth reflection */}
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl animate-pulse"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-indigo-500/25 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

                  {/* Glass Card */}
                  <div 
                    className="w-full max-w-sm p-6 border border-white/10 shadow-2xl relative z-10 transition-all duration-150"
                    style={{
                      backdropFilter: `blur(${blurVal}px)`,
                      WebkitBackdropFilter: `blur(${blurVal}px)`,
                      borderRadius: `${radiusVal}px`,
                      backgroundColor: `rgba(15, 23, 42, ${opacityVal / 100})`
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
                        P
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-base">Glassmorphism Preview</h4>
                        <p className="text-slate-400 text-xs">Locality-first Matcher</p>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 text-xs leading-relaxed mb-4">
                      This element reflects the depth and blur values selected on the left. The subtle outline border mimics ambient light refraction.
                    </p>

                    <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl text-slate-400 text-[11px] font-mono whitespace-pre-wrap">
{`backdrop-filter: blur(${blurVal}px);
background-color: rgba(15, 23, 42, ${opacityVal / 100});
border-radius: ${radiusVal}px;
border: 1px solid rgba(255, 255, 255, 0.1);`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE CARDS & BADGES */}
          {activeTab === 'components' && (
            <div className="space-y-8">
              <div className="bg-dark-900/20 border border-slate-900/50 p-6 rounded-3xl">
                <h2 className="text-2xl font-extrabold text-white mb-2">Showcase Cards & Badges</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  We use custom cards for mentors and scheduled sessions, layered with glowing badges for visual interest.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Example card with "Local Match" badge */}
                <div className="p-6 bg-gradient-to-br from-primary-950/35 to-dark-900/60 border border-primary-500/25 rounded-3xl relative flex flex-col justify-between h-72 backdrop-blur-xl group hover:border-primary-400/40 transition-all duration-300">
                  <div className="absolute top-4 right-4 flex items-center gap-1 py-1 px-3 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-bold animate-pulse">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Local Match
                  </div>

                  <div>
                    <div className="flex gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-xl flex items-center justify-center font-bold text-white">HV</div>
                      <div>
                        <h4 className="font-bold text-white">Harsha Vardhan</h4>
                        <p className="text-slate-400 text-xs">Hyderabad</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                      Co-authored Quantum Random Number Generation research paper. Helping students write academic papers.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {mockDomains.slice(0, 2).map((dom) => (
                      <span key={dom} className="py-0.5 px-2 bg-slate-800/40 border border-slate-700/50 text-[10px] rounded text-slate-300 font-medium">
                        {dom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Session status card */}
                <div className="p-6 bg-dark-900/40 border border-slate-800 hover:border-slate-700 rounded-3xl flex flex-col justify-between h-72 transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="py-1 px-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-full">
                        Upcoming Session
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Today, 4:00 PM</span>
                    </div>

                    <h4 className="font-bold text-white text-base">Mentorship Session #1</h4>
                    <p className="text-slate-400 text-xs mt-1">Mentor: Harsha Vardhan</p>
                    
                    <p className="text-slate-300 text-xs mt-3 line-clamp-2 leading-relaxed">
                      Agenda: Research Methodology review for Quantum RNG paper publication.
                    </p>
                  </div>

                  <div className="flex gap-2.5 mt-4">
                    <button className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-[11px] font-bold rounded-xl transition-colors cursor-pointer text-center">
                      Reschedule
                    </button>
                    <button className="flex-1 py-2 px-3 bg-primary-500 hover:bg-primary-400 text-dark-950 text-[11px] font-black rounded-xl transition-colors cursor-pointer text-center">
                      Join Call
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: BUTTONS & INPUT ANIMATIONS */}
          {activeTab === 'buttons' && (
            <div className="space-y-8">
              <div className="bg-dark-900/20 border border-slate-900/50 p-6 rounded-3xl">
                <h2 className="text-2xl font-extrabold text-white mb-2">Micro-Animations & Interactive States</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Interact with the buttons and input fields below to observe scaling transformations, active state offsets, and focus animations.
                </p>
              </div>

              <div className="p-8 bg-slate-950 border border-slate-900 rounded-3xl space-y-8">
                
                {/* Button styles */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Button Variants</h4>
                  <div className="flex flex-wrap gap-4">
                    {/* Primary Button */}
                    <button className="py-3 px-6 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-primary-600/15 hover:shadow-primary-500/25 active:scale-95 transition-all duration-300 cursor-pointer">
                      Primary Action
                    </button>
                    
                    {/* Secondary Button */}
                    <button className="py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm active:scale-95 transition-all duration-300 cursor-pointer">
                      Secondary Outline
                    </button>
                    
                    {/* Ghost warning */}
                    <button className="py-3 px-6 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-sm active:scale-95 transition-all duration-300 cursor-pointer">
                      Danger / Alert
                    </button>
                  </div>
                </div>

                {/* Input styling */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Input Fields</h4>
                  <div className="max-w-md space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Text input in focus state</label>
                      <input 
                        type="text" 
                        placeholder="Hover or click to focus..."
                        className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Loading states */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pulse Loading State</h4>
                  <div className="flex gap-4">
                    <div className="py-3 px-5 rounded-2xl bg-slate-850 flex items-center gap-2 text-slate-400 text-xs font-semibold select-none animate-pulse">
                      <svg className="animate-spin h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating profile preferences...
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
