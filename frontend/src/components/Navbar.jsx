import React from 'react';

export default function Navbar({ onOpenCreateModal }) {
  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="brand">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <polyline points="16 11 18 13 22 9"></polyline>
            </svg>
          </div>
          <div>
            <h1 className="brand-title">Leadly</h1>
            <p className="brand-subtitle">Streamlined Lead Tracking & Management</p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onOpenCreateModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Lead
        </button>
      </div>
    </header>
  );
}
