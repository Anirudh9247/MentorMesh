import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { StarsBackground } from '../components/animate-ui/StarsBackground';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student', // Default selection
    city: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    city: false,
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');

  // Validate fields in real-time
  useEffect(() => {
    const newErrors = { name: '', email: '', password: '', city: '' };

    if (formData.name) {
      if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
    } else if (touched.name) {
      newErrors.name = 'Full name is required';
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Enter a valid email address';
      }
    } else if (touched.email) {
      newErrors.email = 'Email address is required';
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else {
        const hasLetter = /[a-zA-Z]/.test(formData.password);
        const hasNumber = /\d/.test(formData.password);
        if (!hasLetter || !hasNumber) {
          newErrors.password = 'Password must contain both letters and numbers';
        }
      }
    } else if (touched.password) {
      newErrors.password = 'Password is required';
    }

    if (formData.city) {
      if (formData.city.trim().length < 2) {
        newErrors.city = 'City must be at least 2 characters';
      }
    } else if (touched.city) {
      newErrors.city = 'City is required';
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

  const selectRole = (role) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const isFormValid = 
    formData.name && 
    formData.email && 
    formData.password && 
    formData.city && 
    !errors.name && 
    !errors.email && 
    !errors.password && 
    !errors.city;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setTouched({ name: true, email: true, password: true, city: true });
      return;
    }

    setLoading(true);
    setSubmitError('');
    setSuccess('');

    try {
      await client.post('/auth/register', formData);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setSubmitError(
        err.response?.data?.detail || 'An error occurred during registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-canvas text-silver p-6 relative overflow-hidden bg-grid-dots">
      {/* Stars Background */}
      <StarsBackground className="absolute inset-0 z-0 opacity-40 pointer-events-none" />

      <div className="radial-spotlight"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-glow-blue/10 rounded-full blur-[140px] pointer-events-none animate-float"></div>

      <div className="w-full max-w-xl premium-card p-8 shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-4 border border-white/8 text-glow-blue">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-cyber-white tracking-tight">Create your account</h2>
          <p className="text-slate-muted mt-1 text-xs">Join MentorMesh and accelerate your learning journey</p>
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-xs animate-pulse">
            <span>⚠️ {submitError}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/25 rounded-2xl text-green-450 text-xs">
            <span>✓ {success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="text-[10px] font-black text-slate-muted block mb-2.5 uppercase tracking-wider">I want to register as a:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => selectRole('student')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  formData.role === 'student'
                    ? 'border-glow-violet bg-glow-violet/10 text-cyber-white shadow-md'
                    : 'border-white/8 bg-[#050505]/40 text-slate-muted hover:border-white/15'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                <span className="font-bold text-xs">Student</span>
              </button>

              <button
                type="button"
                onClick={() => selectRole('mentor')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  formData.role === 'mentor'
                    ? 'border-glow-violet bg-glow-violet/10 text-cyber-white shadow-md'
                    : 'border-white/8 bg-[#050505]/40 text-slate-muted hover:border-white/15'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-bold text-xs">Mentor</span>
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="name" className="text-[10px] font-black text-slate-muted uppercase tracking-wider block">Full Name</label>
              {touched.name && errors.name && (
                <span className="text-[10px] font-bold text-red-400">{errors.name}</span>
              )}
            </div>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Harsha Vardhan"
              className="w-full bg-[#050505] border border-white/8 text-cyber-white text-xs rounded-xl px-4 py-3 outline-none focus:border-white focus:ring-0 transition-all duration-300"
            />
          </div>

          {/* Email and Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="name@domain.com"
                className="w-full bg-[#050505] border border-white/8 text-cyber-white text-xs rounded-xl px-4 py-3 outline-none focus:border-white focus:ring-0 transition-all duration-300"
              />
            </div>
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
                placeholder="secure123"
                className="w-full bg-[#050505] border border-white/8 text-cyber-white text-xs rounded-xl px-4 py-3 outline-none focus:border-white focus:ring-0 transition-all duration-300"
              />
            </div>
          </div>

          {/* City Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="city" className="text-[10px] font-black text-slate-muted uppercase tracking-wider block">Your City</label>
              {touched.city && errors.city && (
                <span className="text-[10px] font-bold text-red-400">{errors.city}</span>
              )}
            </div>
            <input
              type="text"
              name="city"
              id="city"
              required
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Hyderabad"
              className="w-full bg-[#050505] border border-white/8 text-cyber-white text-xs rounded-xl px-4 py-3 outline-none focus:border-white focus:ring-0 transition-all duration-300"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-3.5 px-6 rounded-xl bg-cyber-white text-black font-extrabold text-xs tracking-wider uppercase interactive-element hover:scale-102 cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full"></div>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-slate-muted text-xs">
          Already have an account?{' '}
          <Link to="/login" className="text-cyber-white font-bold hover:underline transition-colors">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
