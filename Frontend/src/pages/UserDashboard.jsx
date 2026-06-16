import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import InputField from '../components/InputField';

const UserDashboard = () => {
  const { authFetch, changePassword } = useAuth();

  // Stores list & queries
  const [stores, setStores] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Submit Rating Modal State
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState('');

  // Password Update Form State
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordApiError, setPasswordApiError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [searchName, searchAddress, sortBy, sortOrder]);

  const fetchStores = async () => {
    try {
      const queryParams = new URLSearchParams({
        name: searchName,
        address: searchAddress,
        sortBy,
        sortOrder
      }).toString();

      const res = await authFetch(`/user/stores?${queryParams}`);
      const data = await res.json();
      if (res.ok) {
        setStores(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenRateModal = (store) => {
    setSelectedStore(store);
    setSelectedRating(store.userRating || 0);
    setRateError('');
    setIsRateModalOpen(true);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (selectedRating === 0) {
      setRateError('Please select at least 1 star.');
      return;
    }

    setRateLoading(true);
    setRateError('');

    try {
      const res = await authFetch('/user/rating', {
        method: 'POST',
        body: JSON.stringify({
          storeId: selectedStore.id,
          rating: selectedRating
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit rating.');

      setIsRateModalOpen(false);
      fetchStores();
    } catch (err) {
      setRateError(err.message);
    } finally {
      setRateLoading(false);
    }
  };

  const validatePasswordForm = () => {
    const errs = {};
    if (!passwordForm.currentPassword) {
      errs.currentPassword = 'Current password is required.';
    }

    if (!passwordForm.newPassword) {
      errs.newPassword = 'New password is required.';
    } else {
      if (passwordForm.newPassword.length < 8 || passwordForm.newPassword.length > 16) {
        errs.newPassword = 'Password must be 8-16 characters.';
      } else {
        const hasUpper = /[A-Z]/.test(passwordForm.newPassword);
        const hasSpecial = /[!@#$%^&*()_+=\-[\]{};':",./<>?|\\`~]/.test(passwordForm.newPassword);
        if (!hasUpper || !hasSpecial) {
          errs.newPassword = 'Password needs at least one uppercase letter and one special character.';
        }
      }
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordApiError('');
    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordApiError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Helper to color Avatar placeholders
  const getAvatarStyle = (name) => {
    const char = name.charCodeAt(0) || 65;
    const hue = (char * 7) % 360;
    return {
      width: '54px',
      height: '54px',
      borderRadius: '14px',
      backgroundColor: `hsla(${hue}, 85%, 45%, 0.08)`,
      color: `hsl(${hue}, 85%, 35%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.45rem',
      fontWeight: '800',
      border: `1px solid hsla(${hue}, 85%, 45%, 0.15)`
    };
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2.5rem max(2rem, 4vw)', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem' }}>
        
        {/* Main Store Cards Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Store Directory</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', fontWeight: '500' }}>Search and review your favorite stores registered on the platform</p>
            </div>
            
            {/* Sorting controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort by:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="form-control form-select-custom"
                style={{ width: '180px', padding: '0.65rem 1rem', fontSize: '0.875rem' }}
              >
                <option value="name-ASC">Name (A-Z)</option>
                <option value="name-DESC">Name (Z-A)</option>
                <option value="address-ASC">Address (A-Z)</option>
                <option value="address-DESC">Address (Z-A)</option>
                <option value="rating-DESC">Highest Rating</option>
                <option value="rating-ASC">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* Directory Grid */}
          {stores.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
              {stores.map((store) => (
                <div key={store.id} className="glass-card animate-fade-in" style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  backgroundColor: 'var(--bg-secondary)',
                  justifyContent: 'space-between'
                }}>
                  {/* Store Header */}
                  <div style={{ display: 'flex', gap: '1.15rem', alignItems: 'center' }}>
                    <div style={getAvatarStyle(store.name)}>
                      {store.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <h3 style={{
                        fontSize: '1.15rem',
                        fontWeight: '800',
                        color: 'var(--text-inverse)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        letterSpacing: '-0.02em',
                        marginBottom: '0.15rem'
                      }}>
                        {store.name}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>{store.email}</span>
                    </div>
                  </div>

                  {/* Store Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <p style={{ color: 'var(--text-main)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '0.15rem' }}>
                        <path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.4',
                        height: '2.8rem'
                      }}>{store.address}</span>
                    </p>
                    
                    {/* Overall Average Rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.25rem' }}>
                      <StarRating rating={store.averageRating} size={15} />
                      <strong style={{ color: 'var(--text-inverse)', fontSize: '0.9rem' }}>
                        {store.averageRating > 0 ? `${store.averageRating.toFixed(1)} / 5.0` : 'No reviews'}
                      </strong>
                    </div>
                  </div>

                  {/* Rating Actions Area */}
                  <div style={{
                    borderTop: '1px solid var(--border-card)',
                    paddingTop: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    {/* User's rating label */}
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>My Review</span>
                      {store.userRating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)', fontWeight: '700', fontSize: '0.9rem' }}>
                          <span>★</span> <span>{store.userRating} / 5</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Unrated</span>
                      )}
                    </div>

                    <button
                      className={store.userRating ? "btn btn-secondary" : "btn btn-primary"}
                      onClick={() => handleOpenRateModal(store)}
                      style={{ padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}
                    >
                      {store.userRating ? 'Edit Rating' : 'Rate Store'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '500' }}>
              No stores found matching your search.
            </div>
          )}
        </div>

        {/* Sidebar Filters & Security */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Filters Card */}
          <div className="glass-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Search & Filter</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                placeholder="🔍 Search Store Name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="form-control"
              />
              <input
                placeholder="📍 Search Address..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          {/* Security Card */}
          <div className="glass-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Change Password</h3>
            
            {passwordSuccess && (
              <div className="alert alert-success" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {passwordSuccess}
              </div>
            )}
            {passwordApiError && (
              <div className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                {passwordApiError}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <InputField
                label="Current Password"
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                error={passwordErrors.currentPassword}
                required
              />
              <InputField
                label="New Password"
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                error={passwordErrors.newPassword}
                required
              />
              <InputField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                error={passwordErrors.confirmPassword}
                required
              />
              <button
                type="submit"
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </aside>

      </main>

      {/* Star Rating Modal */}
      <Modal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        title={selectedStore ? `Rate: ${selectedStore.name}` : 'Submit Rating'}
      >
        {rateError && (
          <div className="alert alert-danger" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{rateError}</div>
        )}
        
        {selectedStore && (
          <form onSubmit={handleSubmitRating} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.925rem', fontWeight: '500', lineHeight: '1.4' }}>
              How would you rate your experience with this store? Select a rating from 1 to 5 stars.
            </p>
            
            <StarRating
              rating={selectedRating}
              interactive={true}
              onRatingChange={(val) => { setSelectedRating(val); setRateError(''); }}
              size={42}
            />
            
            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsRateModalOpen(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={rateLoading}
              >
                {rateLoading ? 'Saving...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UserDashboard;
