import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-card modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-card)'
        }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        {title && (
          <h2 style={{ 
            marginBottom: '1.5rem', 
            fontSize: '1.4rem', 
            fontWeight: '800',
            letterSpacing: '-0.02em',
            borderBottom: '1px solid var(--border-card)',
            paddingBottom: '1rem',
            color: 'var(--text-inverse)'
          }}>
            {title}
          </h2>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
