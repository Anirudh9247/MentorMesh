import React, { useState, useEffect } from 'react';
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

    // Name check
    if (formData.name) {
      if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
    } else if (touched.name) {
      newErrors.name = 'Full name is required';
    }

    // Email check
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Enter a valid email address';
      }
    } else if (touched.email) {
      newErrors.email = 'Email address is required';
    }

    // Password check (Min 6 chars + Alphanumeric)
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

    // City check
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
    
    // Mark all as touched to force validation
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
    <div className="min-h-screen flex items-center justify-center bg-dark-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/15 via-dark-950 to-dark-950 p-6 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-20 right-20 w-80 h-80 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-xl bg-dark-900/60 backdrop-blur-2xl border border-slate-800/80 p-8 rounded-3xl shadow-xl relative z-10 hover:border-slate-700/50 transition-all duration-500">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-2xl mb-4 border border-primary-500/25 text-primary-500 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight text-glow">Create your account</h2>
          <p className="text-slate-400 mt-2 text-sm">Join MentorMesh and accelerate your learning journey</p>
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/25 rounded-2xl flex items-center gap-3 text-green-400 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-3 uppercase tracking-wider">I want to register as a:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => selectRole('student')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  formData.role === 'student'
                    ? 'border-primary-500 bg-primary-500/10 text-white shadow-md shadow-primary-950/20'
                    : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                <span className="font-bold text-sm">Student</span>
              </button>

              <button
                type="button"
                onClick={() => selectRole('mentor')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  formData.role === 'mentor'
                    ? 'border-primary-500 bg-primary-500/10 text-white shadow-md shadow-primary-950/20'
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
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="name" className="text-xs font-bold text-slate-350 uppercase tracking-wider block">Full Name</label>
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
              className={`w-full bg-slate-950 border text-white text-sm rounded-2xl px-4 py-3.5 outline-none focus:ring-1 transition-all duration-300 ${
                touched.name && errors.name 
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' 
                  : touched.name && !errors.name
                  ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/30'
                  : 'border-slate-800 focus:border-primary-500 focus:ring-primary-500/30'
              }`}
            />
          </div>

          {/* Email and Password Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="e.g. secure123 (alphanumeric)"
                className={`w-full bg-slate-950 border text-white text-sm rounded-2xl px-4 py-3.5 outline-none focus:ring-1 transition-all duration-300 ${
                  touched.password && errors.password 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' 
                    : touched.password && !errors.password
                    ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/30'
                    : 'border-slate-800 focus:border-primary-500 focus:ring-primary-500/30'
                }`}
              />
            </div>
          </div>

          {/* City Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="city" className="text-xs font-bold text-slate-350 uppercase tracking-wider block">Your City</label>
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
              className={`w-full bg-slate-950 border text-white text-sm rounded-2xl px-4 py-3.5 outline-none focus:ring-1 transition-all duration-300 ${
                touched.city && errors.city 
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' 
                  : touched.city && !errors.city
                  ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/30'
                  : 'border-slate-800 focus:border-primary-500 focus:ring-primary-500/30'
              }`}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-primary-600/15 hover:shadow-primary-500/30 active:scale-[0.98] transition-all duration-350 cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
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
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold hover:underline transition-colors duration-300">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
