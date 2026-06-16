import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

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

    // Name Validation: Min 2, Max 60
    if (!formData.name) {
      newErrors.name = 'Name is required.';
    } else if (formData.name.length < 2 || formData.name.length > 60) {
      newErrors.name = `Name must be between 2 and 60 characters. Current length: ${formData.name.length}`;
    }

    // Email Validation
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Must follow standard email validation rules.';
      }
    }

    // Address Validation: Max 400
    if (!formData.address) {
      newErrors.address = 'Address is required.';
    } else if (formData.address.length > 400) {
      newErrors.address = `Address must be under 400 characters. Current length: ${formData.address.length}`;
    }

    // Password Validation: 8-16 chars, 1 uppercase, 1 special character
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else {
      if (formData.password.length < 8 || formData.password.length > 16) {
        newErrors.password = 'Password must be between 8 and 16 characters.';
      } else {
        const hasUppercase = /[A-Z]/.test(formData.password);
        const hasSpecial = /[!@#$%^&*()_+=\-[\]{};':",./<>?|\\`~]/.test(formData.password);
        
        if (!hasUppercase && !hasSpecial) {
          newErrors.password = 'Password must contain at least one uppercase letter and one special character.';
        } else if (!hasUppercase) {
          newErrors.password = 'Password must contain at least one uppercase letter.';
        } else if (!hasSpecial) {
          newErrors.password = 'Password must contain at least one special character.';
        }
      }
    }

    // Confirm Password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
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
      await registerUser({
        name: formData.name,
        email: formData.email,
        address: formData.address,
        password: formData.password
      });
      navigate('/user');
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '3rem 2rem',
      backgroundColor: 'var(--bg-primary)',
      backgroundImage: 
        'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Orbs */}
      <div className="glow-orb" style={{ top: '-15%', left: '-15%', width: '400px', height: '400px' }} />
      <div className="glow-orb" style={{ bottom: '-15%', right: '-15%', width: '400px', height: '400px' }} />

      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '3.5rem 3rem',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-card)',
        zIndex: 1
      }}>
        {/* Logo Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#logoGrad)" />
            </svg>
            <span style={{ 
              fontSize: '1.5rem', 
              fontWeight: '800', 
              letterSpacing: '-0.03em', 
              background: 'var(--accent-gradient)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>
              StorePulse
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--text-inverse)', letterSpacing: '-0.02em', textAlign: 'center' }}>
            Create Account
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500', textAlign: 'center' }}>
            Sign up as a normal user to search and review stores
          </p>
        </div>

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
            label="Full Name (Min 2 characters)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Johnathon Alexander Doe"
            error={errors.name}
            maxLength={60}
            required
          />

          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. johndoe@example.com"
            error={errors.email}
            required
          />

          <InputField
            label="Home Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your street, city, country..."
            error={errors.address}
            maxLength={400}
            isTextArea
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

          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.confirmPassword}
            required
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1.25rem', padding: '0.9rem', fontSize: '0.95rem' }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: '500' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
