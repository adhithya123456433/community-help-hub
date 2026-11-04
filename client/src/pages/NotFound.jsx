import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          textAlign: 'center',
          padding: '3rem 2rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.85rem',
            borderRadius: '9999px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}
        >
          404 Error
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Page Not Found
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          The page you are looking for does not exist, has been removed, or has had its name changed.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>
            Return to Home
          </Link>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/explore-tasks" className="btn btn-secondary" style={{ flex: 1 }}>
              Explore Tasks
            </Link>
            <Link to="/impact" className="btn btn-outline" style={{ flex: 1 }}>
              Impact Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
