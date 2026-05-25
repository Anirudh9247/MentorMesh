import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await client.post('/auth/login', formData);
      const { access_token } = response.data;
      
      // Save access token to local storage
      localStorage.setItem('token', access_token);
      
      // Decode JWT token to extract claims (sub = email, role = student/mentor)
      // Since it's a standard JWT, the second segment is the base64url encoded payload
      const tokenPayload = access_token.split('.')[1];
      const decodedPayload = JSON.parse(atob(tokenPayload.replace(/-/g, '+').replace(/_/g, '/')));
      
      const user = {
        email: decodedPayload.sub,
        role: decodedPayload.role,
      };
      
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect user to appropriate dashboard based on their role
      if (user.role === 'mentor') {
        navigate('/mentor-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Incorrect email or password. Please try again.'
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

      <div className="w-full max-w-md bg-dark-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-glass relative z-10 animate-pulse-subtle">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-2xl mb-4 border border-primary-500/20">
            {/* Logo Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome back</h2>
          <p className="text-slate-400 mt-2">Log in to continue building your network</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
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

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-300 block">Password</label>
            </div>
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
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-slate-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
