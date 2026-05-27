import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Validate fields in real-time
  useEffect(() => {
    const newErrors = { email: '', password: '' };

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else if (touched.email) {
      newErrors.email = 'Email address is required';
    }

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
        navigate('/browse');
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
    <div className="min-h-screen flex items-center justify-center bg-dark-canvas text-silver p-6 relative overflow-hidden bg-grid-dots">
      {/* Spotlight and glowing backgrounds */}
      <div className="radial-spotlight"></div>
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-glow-violet/10 rounded-full blur-[100px] pointer-events-none animate-float"></div>

      <div className="w-full max-w-md premium-card p-8 shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-4 border border-white/8 text-glow-blue shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h3a2 2 0 002-2v-3.571M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09A13.916 13.916 0 0115 11v7a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-3a2 2 0 00-2 2v3.571" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-cyber-white tracking-tight">Welcome back</h2>
          <p className="text-slate-muted mt-1 text-xs">Log in to continue building your network</p>
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3 text-red-405 text-xs animate-pulse">
            <span>⚠️ {submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="email" className="text-[10px] font-black text-slate-muted uppercase tracking-wider block">Email Address</label>
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
              placeholder="e.g. name@domain.com"
              className="w-full bg-[#050505] border border-white/8 text-cyber-white text-xs rounded-xl px-4 py-3 outline-none focus:border-white focus:ring-0 transition-all duration-300"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className="text-[10px] font-black text-slate-muted uppercase tracking-wider block">Password</label>
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
              className="w-full bg-[#050505] border border-white/8 text-cyber-white text-xs rounded-xl px-4 py-3 outline-none focus:border-white focus:ring-0 transition-all duration-300"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (touched.email && errors.email) || (touched.password && errors.password)}
            className="w-full py-3.5 px-6 rounded-xl bg-cyber-white text-black font-extrabold text-xs tracking-wider uppercase interactive-element hover:scale-102 cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full"></div>
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-slate-muted text-xs">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyber-white font-bold hover:underline transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
