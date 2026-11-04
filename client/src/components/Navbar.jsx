import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, role, isLoggedIn, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  let dashboardPath = '/volunteer-dashboard';
  let dashboardLabel = 'Volunteer Dashboard';
  let roleBadge = (
    <span
      className="badge"
      style={{
        backgroundColor: '#064e3b',
        color: '#34d399',
        border: '1.5px solid #059669',
        fontWeight: 800,
        fontSize: '0.72rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '4px',
        letterSpacing: '0.5px'
      }}
    >
      VOLUNTEER
    </span>
  );

  let displayName = user ? user.email : '';
  if (user && user.profile) {
    displayName = user.profile.fullName || user.profile.orgName || user.email;
  }

  if (role === 'admin') {
    dashboardPath = '/admin-dashboard';
    dashboardLabel = 'Admin Portal';
    roleBadge = (
      <span
        className="badge"
        style={{
          backgroundColor: '#450a0a',
          color: '#fca5a5',
          border: '1.5px solid #ef4444',
          fontWeight: 800,
          fontSize: '0.72rem',
          padding: '0.2rem 0.55rem',
          borderRadius: '4px',
          letterSpacing: '0.5px'
        }}
      >
        ADMIN
      </span>
    );
  } else if (role === 'ngo') {
    dashboardPath = '/ngo-dashboard';
    dashboardLabel = 'NGO Dashboard';
    roleBadge = (
      <span
        className="badge"
        style={{
          backgroundColor: '#172554',
          color: '#93c5fd',
          border: '1.5px solid #3b82f6',
          fontWeight: 800,
          fontSize: '0.72rem',
          padding: '0.2rem 0.55rem',
          borderRadius: '4px',
          letterSpacing: '0.5px'
        }}
      >
        NGO
      </span>
    );
  }

  return (
    <header className="navbar">
      <div className="container nav-container">
        <div className="nav-left">
          <Link to="/" className="brand-logo">
            CommunityHelp Hub
            <span className="brand-badge">INDIA</span>
          </Link>

          <ul className="nav-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/explore-tasks" className={({ isActive }) => (isActive ? 'active' : '')}>
                Explore Tasks
              </NavLink>
            </li>
            <li>
              <NavLink to="/impact" className={({ isActive }) => (isActive ? 'active' : '')}>
                Impact Dashboard
              </NavLink>
            </li>

            {isLoggedIn && role === 'volunteer' && (
              <li>
                <NavLink to="/my-tasks" className={({ isActive }) => (isActive ? 'active' : '')}>
                  My Tasks
                </NavLink>
              </li>
            )}

            {isLoggedIn && role === 'ngo' && (
              <li>
                <NavLink to="/create-task" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Publish Task
                </NavLink>
              </li>
            )}
          </ul>
        </div>

        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              <div className="nav-user-chip">
                <span className="nav-user-name">
                  {displayName}
                </span>
                {roleBadge}
              </div>

              <Link to={dashboardPath} className="btn btn-dashboard-nav btn-sm">
                {dashboardLabel}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-logout-nav btn-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-login-nav btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-register-nav btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
