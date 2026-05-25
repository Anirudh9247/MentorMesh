import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

// Simple dashboard stubs to verify successful redirection after login
function StudentDashboardPlaceholder() {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/20 via-dark-950 to-dark-950">
      <div className="max-w-md p-8 bg-dark-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-glass">
        <div className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-2xl mb-4 border border-primary-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Student Dashboard</h1>
        <p className="text-slate-400">Day 1 Foundation: Setup Complete! You have successfully registered and logged in as a student.</p>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold transition-all duration-300 cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function MentorDashboardPlaceholder() {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/20 via-dark-950 to-dark-950">
      <div className="max-w-md p-8 bg-dark-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-glass">
        <div className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-2xl mb-4 border border-primary-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Mentor Dashboard</h1>
        <p className="text-slate-400">Day 1 Foundation: Setup Complete! You have successfully registered and logged in as a mentor.</p>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold transition-all duration-300 cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student-dashboard" element={<StudentDashboardPlaceholder />} />
        <Route path="/mentor-dashboard" element={<MentorDashboardPlaceholder />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
