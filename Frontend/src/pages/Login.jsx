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
        <div>
          <h2 style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            ⚡ StorePulse
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>
            Merchants & Ratings Console
          </span>
        </div>

        <div style={{ margin: '4rem 0' }}>
          <h1 style={{ color: '#ffffff', background: 'none', WebkitTextFillColor: 'unset', fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '1.5rem' }}>
            Analyze and rate your local merchants seamlessly.
          </h1>
          
          {/* Features list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.95rem' }}>System-Wide Statistics</strong>
                <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.875rem' }}>Track platform users, registered merchants, and submitted reviews in real time.</span>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.95rem' }}>Store Analytics Dashboard</strong>
                <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.875rem' }}>Calculates average scores, displays ratings breakdowns, and review histories.</span>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.95rem' }}>Granular Role Guards</strong>
                <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.875rem' }}>Guarantees secure navigation and custom access settings for all system users.</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            © 2026 StorePulse. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="split-right">
        <div className="glass-card animate-fade-in" style={{
          width: '100%',
          maxWidth: '420px',
          padding: '3rem 2.5rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-card)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--text-inverse)' }}>
            Sign In
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Enter your credentials to access your dashboard
          </p>

          {apiError && (
            <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '0.75rem', marginBottom: '1.5rem' }}>
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
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>New to StorePulse? </span>
            <Link to="/register" style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>
              Create a free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
