import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SortableTable from '../components/SortableTable';
import StarRating from '../components/StarRating';
import InputField from '../components/InputField';

const StoreOwnerDashboard = () => {
  const { authFetch, changePassword } = useAuth();

  // Store metrics & ratings
  const [dashboardData, setDashboardData] = useState({
    storeName: '',
    storeAddress: '',
    averageRating: 0,
    totalRatingsCount: 0,
    ratings: []
  });

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [loading, setLoading] = useState(true);

  // Password Update Form State
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordApiError, setPasswordApiError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [sortBy, sortOrder]);

  const fetchDashboardData = async () => {
    try {
      const queryParams = new URLSearchParams({ sortBy, sortOrder }).toString();
      const res = await authFetch(`/store/dashboard?${queryParams}`);
      const data = await res.json();
      if (res.ok) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  // Calculate rating stars distribution
  const getRatingDistribution = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (dashboardData.ratings && dashboardData.ratings.length > 0) {
      dashboardData.ratings.forEach((r) => {
        if (counts[r.rating] !== undefined) {
          counts[r.rating]++;
        }
      });
    }
    return counts;
  };

  const ratingCounts = getRatingDistribution();
  const totalReviews = dashboardData.totalRatingsCount || 1;

  const ratingColumns = [
    { key: 'name', label: 'User Name', sortable: true },
    { key: 'email', label: 'User Email', sortable: true },
    { key: 'address', label: 'User Address', sortable: false },
    { key: 'rating', label: 'Rating', sortable: true, width: '160px' },
    { key: 'createdAt', label: 'Date', sortable: true, width: '160px' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2.5rem max(2rem, 4vw)', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', fontWeight: '500' }}>Loading store dashboard...</div>
        ) : (
          <>
            {/* Header Banner Card */}
            <div className="glass-card" style={{
              padding: '3rem 2.5rem',
              backgroundImage: 'radial-gradient(ellipse at right top, rgba(99, 102, 241, 0.06) 0%, transparent 60%)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Merchant Panel
                </span>
                <h1 style={{ fontSize: '2.5rem', marginTop: '0.35rem', marginBottom: '0.65rem', letterSpacing: '-0.03em' }}>{dashboardData.storeName}</h1>
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: '500', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5">
                    <path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {dashboardData.storeAddress}
                </p>
              </div>
              <div style={{
                textAlign: 'right',
                padding: '1.25rem 1.75rem',
                borderRadius: '16px',
                backgroundColor: 'var(--accent-glow)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.03)'
              }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aggregate Score</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.35rem', justifyContent: 'flex-end' }}>
                  <StarRating rating={dashboardData.averageRating} size={18} />
                  <strong style={{ fontSize: '1.45rem', color: 'var(--text-inverse)', fontWeight: '800' }}>
                    {dashboardData.averageRating > 0 ? `${dashboardData.averageRating.toFixed(1)} / 5.0` : 'Unrated'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem', alignItems: 'start' }}>
              
              {/* Main Content Area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                
                {/* Analytics Distribution Bar Chart */}
                <div className="glass-card" style={{ padding: '2.25rem', backgroundColor: 'var(--bg-secondary)' }}>
                  <h2 style={{ fontSize: '1.35rem', marginBottom: '2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Reviews & Ratings Analytics</h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.5fr', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Big Summary Circle */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2.5rem 2rem',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(99, 102, 241, 0.02)',
                      border: '1px solid rgba(99, 102, 241, 0.05)',
                      boxShadow: 'inset 0 0 20px rgba(99, 102, 241, 0.03)'
                    }}>
                      <span style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--text-inverse)', lineHeight: 1, letterSpacing: '-0.04em' }}>
                        {dashboardData.averageRating > 0 ? dashboardData.averageRating.toFixed(1) : '0.0'}
                      </span>
                      <div style={{ marginTop: '0.65rem', marginBottom: '0.5rem' }}>
                        <StarRating rating={dashboardData.averageRating} size={24} />
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Based on {dashboardData.totalRatingsCount} reviews
                      </span>
                    </div>

                    {/* Bar chart distribution lists */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = ratingCounts[stars];
                        const pct = dashboardData.totalRatingsCount > 0 ? ((count / totalReviews) * 100).toFixed(0) : 0;
                        return (
                          <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
                            <span style={{ width: '48px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                              {stars} Star
                            </span>
                            <div style={{
                              flex: 1,
                              height: '10px',
                              backgroundColor: 'rgba(148, 163, 184, 0.12)',
                              borderRadius: '5px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: 'var(--accent-gradient)',
                                borderRadius: '5px',
                                transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                              }} />
                            </div>
                            <span style={{ width: '35px', fontSize: '0.875rem', textAlign: 'right', fontWeight: '700', color: 'var(--text-inverse)' }}>
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Ratings Table list */}
                <div className="glass-card" style={{ padding: '2.25rem', backgroundColor: 'var(--bg-secondary)' }}>
                  <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Customer Review Breakdown</h2>
                  
                  <SortableTable
                    columns={ratingColumns}
                    data={dashboardData.ratings}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={(key, order) => { setSortBy(key); setSortOrder(order); }}
                    renderRow={(row) => (
                      <tr key={row.id}>
                        <td style={{ fontWeight: '700', color: 'var(--text-inverse)' }}>
                          {row.user?.name || 'Anonymous User'}
                        </td>
                        <td style={{ fontWeight: '500' }}>{row.user?.email || 'N/A'}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500', color: 'var(--text-muted)' }}>
                          {row.user?.address || 'N/A'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <StarRating rating={row.rating} size={14} />
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-inverse)' }}>
                              ({row.rating})
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                          {new Date(row.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    )}
                  />
                </div>

              </div>

              {/* Sidebar Security block */}
              <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-secondary)' }}>
                  <h3 style={{ marginBottom: '1.25rem', fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Account Security</h3>
                  
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
                      label="Confirm New Password"
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

            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StoreOwnerDashboard;
