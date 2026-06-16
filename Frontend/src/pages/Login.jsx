import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'StoreOwner') navigate('/store');
      else navigate('/user');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error on type
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    
    // Email Validation
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Must follow standard email validation rules.';
      }
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      const loggedUser = await login(formData.email, formData.password);
      
      if (loggedUser.role === 'Admin') navigate('/admin');
      else if (loggedUser.role === 'StoreOwner') navigate('/store');
      else navigate('/user');
    } catch (err) {
      setApiError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-container">
      {/* Left side: Brand Showcase */}
      <div className="split-left">
        {/* Glow Effects */}
        <div className="glow-orb" style={{ top: '-10%', left: '-10%' }} />
        <div className="glow-orb" style={{ bottom: '-15%', right: '-15%' }} />

        <div style={{ zIndex: 1 }}>
          <h2 style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#818cf8" />
            </svg>
            StorePulse
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.1em' }}>
            Merchants & Ratings Console
          </span>
        </div>

        <div style={{ margin: '4rem 0', zIndex: 1 }}>
          <h1 style={{ color: '#ffffff', background: 'none', WebkitTextFillColor: 'unset', fontSize: '2.85rem', fontWeight: '800', lineHeight: '1.15', marginBottom: '2.5rem', letterSpacing: '-0.03em' }}>
            Analyze and rate your local merchants seamlessly.
          </h1>
          
          {/* Features list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="feature-item">
              <span className="feature-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '1rem', fontWeight: '700' }}>System-Wide Statistics</strong>
                <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginTop: '0.2rem' }}>Track platform users, registered merchants, and submitted reviews in real time.</span>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '1rem', fontWeight: '700' }}>Store Analytics Dashboard</strong>
                <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginTop: '0.2rem' }}>Calculates average scores, displays ratings breakdowns, and review histories.</span>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '1rem', fontWeight: '700' }}>Granular Role Guards</strong>
                <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginTop: '0.2rem' }}>Guarantees secure navigation and custom access settings for all system users.</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ zIndex: 1 }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600' }}>
            &copy; 2026 StorePulse. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="split-right">
        <div className="glass-card animate-fade-in" style={{
          width: '100%',
          maxWidth: '430px',
          padding: '3.5rem 3rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-card)'
        }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', marginBottom: '0.35rem', color: 'var(--text-inverse)', letterSpacing: '-0.02em' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '2.5rem', fontWeight: '500' }}>
            Enter your credentials to access your dashboard
          </p>

          {apiError && (
            <div className="alert alert-danger" style={{ marginBottom: '1.75rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. admin@storemanager.com"
              error={errors.email}
              required
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              required
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.9rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: '500' }}>
            <span style={{ color: 'var(--text-muted)' }}>New to StorePulse? </span>
            <Link to="/register" style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
