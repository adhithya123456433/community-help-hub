import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password');
      return;
    }

    setLoading(true);
    const res = await apiRequest('/auth/login', 'POST', {
      email: email.trim(),
      password
    });
    setLoading(false);

    if (res.ok && res.data && res.data.success) {
      const { token, user } = res.data;
      login(token, user);
      showToast('Login successful. Redirecting...', 'success');

      // Check if there was a redirected location state
      const redirectPath = location.state?.from?.pathname;

      if (redirectPath) {
        navigate(redirectPath);
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'ngo') {
        navigate('/ngo-dashboard');
      } else {
        navigate('/volunteer-dashboard');
      }
    } else {
      setErrorMessage(res.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <>
      <section className="page-banner">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.6rem' }}>USER AUTHENTICATION</span>
          <h1>Sign In to Community Hub</h1>
          <p style={{ marginBottom: 0, fontSize: '1.1rem' }}>
            Access your personalized Volunteer, NGO, or Administrator Dashboard.
          </p>
        </div>
      </section>
      <main style={{ padding: '2.75rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '580px' }}>
          <div className="card">
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem' }}
              >
                {loading ? 'Verifying...' : 'Login'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Don't have an account? <Link to="/register">Register here</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
