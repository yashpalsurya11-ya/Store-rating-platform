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

    // Name Validation: Min 20, Max 60
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
      minHeight: 'calc(100vh - 70px)',
      padding: '2rem'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '2.5rem',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '0.25rem' }}>Create Account</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Sign up as a normal user to submit ratings
        </p>

        {apiError && (
          <div className="alert alert-danger" style={{ fontSize: '0.875rem', padding: '0.75rem' }}>
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
            label="Password (8-16 chars, 1 uppercase, 1 special)"
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
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: '600' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
