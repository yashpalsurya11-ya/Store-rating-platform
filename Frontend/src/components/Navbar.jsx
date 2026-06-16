import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return <span className="badge badge-admin">System Admin</span>;
      case 'StoreOwner':
        return <span className="badge badge-storeowner">Store Owner</span>;
      default:
        return <span className="badge badge-user">User</span>;
    }
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.85rem max(2rem, 4vw)',
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-card)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.02)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#logoGrad)" />
          </svg>
          <span style={{ 
            fontSize: '1.35rem', 
            fontWeight: '800', 
            letterSpacing: '-0.03em', 
            background: 'var(--accent-gradient)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            StorePulse
          </span>
        </div>
        {getRoleBadge(user.role)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>
          Welcome, <span style={{ color: 'var(--text-inverse)', fontWeight: '700' }}>{user.name}</span>
        </span>
        <button className="btn btn-secondary" onClick={logout} style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', height: '36px' }}>
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
