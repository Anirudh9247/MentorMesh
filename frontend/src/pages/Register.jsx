import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student', // Default selection
    city: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectRole = (role) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await client.post('/auth/register', formData);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'An error occurred during registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/30 via-dark-950 to-dark-950 p-6">
      {/* Background glowing decorations */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl bg-dark-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-glass relative z-10 animate-pulse-subtle">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-2xl mb-4 border border-primary-500/20">
            {/* Logo Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create your account</h2>
          <p className="text-slate-400 mt-2">Join MentorMesh and accelerate your learning journey</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-400 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-3">I want to register as a:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => selectRole('student')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                  formData.role === 'student'
                    ? 'border-primary-500 bg-primary-500/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                    : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                <span className="font-bold text-sm">Student</span>
              </button>

              <button
                type="button"
                onClick={() => selectRole('mentor')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                  formData.role === 'mentor'
                    ? 'border-primary-500 bg-primary-500/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                    : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-bold text-sm">Mentor</span>
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="text-sm font-semibold text-slate-300 block mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Harsha Vardhan"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300"
            />
          </div>

          {/* Email and Password Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-slate-300 block mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. harsha@ace.edu"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-semibold text-slate-300 block mb-2">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* City Field */}
          <div>
            <label htmlFor="city" className="text-sm font-semibold text-slate-300 block mb-2">Your City</label>
            <input
              type="text"
              name="city"
              id="city"
              required
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Hyderabad"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300"
            />
            <p className="text-xs text-slate-500 mt-1">We use your city to match you with local mentors physically near you.</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-primary-600/20 hover:shadow-primary-500/35 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-slate-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
