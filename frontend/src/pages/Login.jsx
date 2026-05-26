import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Touch states to prevent premature validation alerts
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Real-time error messages
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Validate fields in real-time on data changes
  useEffect(() => {
    const newErrors = { email: '', password: '' };

    // Email validation
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address (e.g. name@domain.com)';
      }
    } else if (touched.email) {
      newErrors.email = 'Email address is required';
    }

    // Password validation
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (touched.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
  }, [formData, touched]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBlur = (e) => {
    setTouched({
      ...touched,
      [e.target.name]: true,
    });
  };

  const isFormValid = 
    formData.email && 
    formData.password && 
    !errors.email && 
    !errors.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation check
    if (!isFormValid) {
      setTouched({ email: true, password: true });
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const response = await client.post('/auth/login', formData);
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      
      const tokenPayload = access_token.split('.')[1];
      const decodedPayload = JSON.parse(atob(tokenPayload.replace(/-/g, '+').replace(/_/g, '/')));
      
      const user = {
        email: decodedPayload.sub,
        role: decodedPayload.role,
      };
      
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'mentor') {
        navigate('/mentor-dashboard');
      } else {
        navigate('/browse'); // Day 2 routing update: student goes directly to browse
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.detail || 'Incorrect email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/15 via-dark-950 to-dark-950 p-6 relative overflow-hidden">
      {/* Optimized sharp glowing ambient backgrounds */}
      <div className="absolute top-20 right-20 w-80 h-80 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-dark-900/60 backdrop-blur-2xl border border-slate-800/80 p-8 rounded-3xl shadow-xl relative z-10 hover:border-slate-700/50 transition-all duration-500">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-2xl mb-4 border border-primary-500/25 text-primary-500 shadow-inner group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h3a2 2 0 002-2v-3.571M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09A13.916 13.916 0 0115 11v7a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-3a2 2 0 00-2 2v3.571" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome back</h2>
          <p className="text-slate-400 mt-2 text-sm">Log in to continue building your network</p>
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-350 uppercase tracking-wider block">Email Address</label>
              {touched.email && errors.email && (
                <span className="text-[10px] font-bold text-red-400">{errors.email}</span>
              )}
            </div>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. harsha@ace.edu"
              className={`w-full bg-slate-950 border text-white text-sm rounded-2xl px-4 py-3.5 outline-none focus:ring-1 transition-all duration-300 ${
                touched.email && errors.email 
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' 
                  : touched.email && !errors.email
                  ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/30'
                  : 'border-slate-800 focus:border-primary-500 focus:ring-primary-500/30'
              }`}
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="text-xs font-bold text-slate-350 uppercase tracking-wider block">Password</label>
              {touched.password && errors.password && (
                <span className="text-[10px] font-bold text-red-400">{errors.password}</span>
              )}
            </div>
            <input
              type="password"
              name="password"
              id="password"
              required
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              className={`w-full bg-slate-950 border text-white text-sm rounded-2xl px-4 py-3.5 outline-none focus:ring-1 transition-all duration-300 ${
                touched.password && errors.password 
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' 
                  : touched.password && !errors.password
                  ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/30'
                  : 'border-slate-800 focus:border-primary-500 focus:ring-primary-500/30'
              }`}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (touched.email && errors.email) || (touched.password && errors.password)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-primary-600/15 hover:shadow-primary-500/30 active:scale-[0.98] transition-all duration-350 cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
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
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold hover:underline transition-colors duration-300">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
