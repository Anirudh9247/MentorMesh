import React from 'react';
import StudentHeader from '../components/StudentHeader';

export default function ResultsShowcase() {
  const mockGrades = [
    { title: 'Neural Network Optimizations Project', mentor: 'Harsha Vardhan', grade: 'A+', date: 'May 20, 2026', type: 'Project' },
    { title: 'React 19 Rendering Diagnostics', mentor: 'Rajesh Kumar', grade: 'Passing', date: 'May 15, 2026', type: 'Exercise' },
    { title: 'Quantum RNG Research Survey Draft', mentor: 'Dr. Ananya Rao', grade: 'A', date: 'May 10, 2026', type: 'Research' },
    { title: 'PostgreSQL Database Schema Mock', mentor: 'Rajesh Kumar', grade: 'Passing', date: 'May 05, 2026', type: 'Design' }
  ];

  return (
    <div className="min-h-screen bg-dark-canvas text-silver pb-20 relative overflow-hidden bg-grid-dots">
      <div className="radial-spotlight"></div>
      
      <StudentHeader />

      <main className="max-w-4xl mx-auto px-6 mt-10 relative z-10 space-y-10">
        
        {/* Header */}
        <div className="animate-stagger-fade">
          <span className="text-[9px] font-black uppercase tracking-widest text-glow-blue bg-glow-blue/10 py-1 px-3 border border-glow-blue/20 rounded-full">
            Data Visualization
          </span>
          <h1 className="text-3xl font-black text-cyber-white tracking-tight mt-2">
            Performance & Analytics
          </h1>
          <p className="text-slate-muted text-xs mt-1">
            Visual breakdown of goals alignment, learning speed, and task grades.
          </p>
        </div>

        {/* Interactive Chart Container utilizing Glassmorphism */}
        <div className="premium-card p-6 md:p-8 shadow-2xl glass-panel animate-stagger-fade delay-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-black text-cyber-white uppercase tracking-wider">Learning Curve Progress</h3>
              <p className="text-[10px] text-slate-muted">Average compatibility increase vs sessions conducted</p>
            </div>
            <div className="flex gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-glow-blue"></span> Active</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-glow-violet"></span> Target</span>
            </div>
          </div>

          {/* Simulated Neon Line Chart with SVG */}
          <div className="w-full h-64 md:h-80 relative overflow-hidden rounded-2xl border border-white/5 bg-[#050505]/40 p-4">
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="chartGlowGradViolet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="160" x2="500" y2="160" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              {/* Fading gradient fills under path */}
              <path d="M0,170 Q100,160 200,90 T400,60 L500,40 L500,200 L0,200 Z" fill="url(#chartGlowGrad)" />
              <path d="M0,185 Q120,180 240,110 T480,90 L500,80 L500,200 L0,200 Z" fill="url(#chartGlowGradViolet)" />

              {/* Neon Stroke lines */}
              <path 
                d="M0,170 Q100,160 200,90 T400,60 L500,40" 
                fill="none" 
                stroke="#38BDF8" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                strokeDasharray="600"
                className="animate-line-graph"
              />
              <path 
                d="M0,185 Q120,180 240,110 T480,90 L500,80" 
                fill="none" 
                stroke="#6366F1" 
                strokeWidth="2" 
                strokeDasharray="5" 
                strokeLinecap="round"
              />

              {/* Interaction points */}
              <circle cx="200" cy="90" r="5" fill="#38BDF8" className="animate-pulse" />
              <circle cx="400" cy="60" r="5" fill="#38BDF8" className="animate-pulse" />
            </svg>
            
            {/* Overlay tooltips */}
            <div className="absolute top-10 left-1/3 p-2 bg-[#0d0d11]/90 border border-white/8 rounded-lg text-[9px] font-mono pointer-events-none shadow-xl">
              <span className="text-glow-blue font-bold">Session #4:</span> Schema design aligned (88% compatibility)
            </div>
          </div>
        </div>

        {/* Performance Cards (Table Rows with alternating background) */}
        <div className="premium-card p-6 md:p-8 space-y-6 animate-stagger-fade delay-200">
          <h3 className="text-sm font-black text-cyber-white uppercase tracking-wider border-b border-white/5 pb-3">
            Milestone Evaluation Grades
          </h3>

          <div className="divide-y divide-white/5">
            {mockGrades.map((item, index) => {
              const isGradeHigh = item.grade.includes('A');
              return (
                <div 
                  key={index} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-4.5 px-3 -mx-3 rounded-xl transition-all duration-200 hover:bg-white/5 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="py-0.5 px-2 bg-slate-900 border border-white/5 text-[9px] font-bold text-slate-muted uppercase rounded">
                        {item.type}
                      </span>
                      <h4 className="font-bold text-cyber-white text-sm group-hover:text-glow-blue transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-muted">Graded by {item.mentor} • Evaluated {item.date}</p>
                  </div>

                  {/* Clean Geometric Grade Badge (no bulky background, high contrast) */}
                  <div className="mt-3 sm:mt-0 self-start sm:self-auto">
                    <span className={`inline-flex items-center justify-center font-extrabold text-xs px-3 py-1 border rounded-md font-mono ${
                      isGradeHigh
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                        : 'border-glow-blue/30 text-glow-blue bg-glow-blue/5'
                    }`}>
                      {item.grade}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
