import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('volunteer');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Volunteer state
  const [volForm, setVolForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    skills: ''
  });

  // NGO state
  const [ngoForm, setNgoForm] = useState({
    orgName: '',
    registrationNumber: '',
    contactPerson: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    address: ''
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/;

  const sanitizePhone = (p) => {
    let clean = (p || '').replace(/[\s\-\(\)\+]/g, '');
    if (clean.startsWith('91') && clean.length === 12) clean = clean.slice(2);
    return clean;
  };

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const { fullName, email, password, phone, city, skills } = volForm;

    if (!fullName.trim() || !email.trim() || !password || !phone.trim() || !city.trim()) {
      setErrorMessage('Please fill in all mandatory fields');
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com)');
      return;
    }

    const cleanPhone = sanitizePhone(phone);
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const res = await apiRequest('/auth/register-volunteer', 'POST', {
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      phone: cleanPhone,
      city: city.trim(),
      skills: skills.trim()
    });
    setLoading(false);

    if (res.ok && res.data && res.data.success) {
      login(res.data.token, res.data.user);
      showToast('Volunteer registered successfully. Redirecting...', 'success');
      navigate('/volunteer-dashboard');
    } else {
      setErrorMessage(res.data?.message || 'Registration failed');
    }
  };

  const handleNgoSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const { orgName, registrationNumber, contactPerson, email, password, phone, city, address } = ngoForm;

    if (
      !orgName.trim() ||
      !registrationNumber.trim() ||
      !contactPerson.trim() ||
      !email.trim() ||
      !password ||
      !phone.trim() ||
      !city.trim()
    ) {
      setErrorMessage('Please fill in all mandatory NGO fields');
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid official email address');
      return;
    }

    const cleanPhone = sanitizePhone(phone);
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const res = await apiRequest('/auth/register-ngo', 'POST', {
      orgName: orgName.trim(),
      registrationNumber: registrationNumber.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      password,
      phone: cleanPhone,
      city: city.trim(),
      address: address.trim()
    });
    setLoading(false);

    if (res.ok && res.data && res.data.success) {
      login(res.data.token, res.data.user);
      showToast('NGO registered successfully. Redirecting...', 'success');
      navigate('/ngo-dashboard');
    } else {
      setErrorMessage(res.data?.message || 'Registration failed');
    }
  };

  return (
    <>
      <section className="page-banner">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.6rem' }}>JOIN THE NETWORK</span>
          <h1>Create an Account</h1>
          <p style={{ marginBottom: 0, fontSize: '1.1rem' }}>
            Register as an active Volunteer or verified partner NGO.
          </p>
        </div>
      </section>
      <main style={{ padding: '2.75rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <div className="card">
            {/* Role Switcher Segmented Control */}
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-btn ${activeTab === 'volunteer' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('volunteer');
                  setErrorMessage('');
                }}
              >
                Register as Volunteer
              </button>
              <button
                type="button"
                className={`segmented-btn ${activeTab === 'ngo' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('ngo');
                  setErrorMessage('');
                }}
              >
                Register as NGO
              </button>
            </div>

            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {activeTab === 'volunteer' && (
              <form onSubmit={handleVolunteerSubmit}>
                <div className="form-group">
                  <label htmlFor="vol-name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="vol-name"
                    className="form-control"
                    placeholder="e.g., Rahul Sharma"
                    value={volForm.fullName}
                    onChange={(e) => setVolForm({ ...volForm, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-2" style={{ gap: '0.75rem', marginBottom: 0 }}>
                  <div className="form-group">
                    <label htmlFor="vol-email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      id="vol-email"
                      className="form-control"
                      placeholder="rahul@example.com"
                      value={volForm.email}
                      onChange={(e) => setVolForm({ ...volForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vol-password" className="form-label">Password</label>
                    <input
                      type="password"
                      id="vol-password"
                      className="form-control"
                      placeholder="Min. 6 characters"
                      minLength={6}
                      value={volForm.password}
                      onChange={(e) => setVolForm({ ...volForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '0.75rem', marginBottom: 0 }}>
                  <div className="form-group">
                    <label htmlFor="vol-phone" className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      id="vol-phone"
                      className="form-control"
                      placeholder="10-digit mobile number"
                      value={volForm.phone}
                      onChange={(e) => setVolForm({ ...volForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vol-city" className="form-label">City / Locality</label>
                    <input
                      type="text"
                      id="vol-city"
                      className="form-control"
                      placeholder="e.g., Bengaluru"
                      value={volForm.city}
                      onChange={(e) => setVolForm({ ...volForm, city: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="vol-skills" className="form-label">Skills & Interests (Comma separated)</label>
                  <input
                    type="text"
                    id="vol-skills"
                    className="form-control"
                    placeholder="e.g., Teaching, First Aid, Packaging, Clean-up"
                    value={volForm.skills}
                    onChange={(e) => setVolForm({ ...volForm, skills: e.target.value })}
                  />
                  <div className="form-hint">Used to match you with relevant volunteer opportunities.</div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem' }}
                >
                  {loading ? 'Registering...' : 'Register as Volunteer'}
                </button>
              </form>
            )}
            {activeTab === 'ngo' && (
              <form onSubmit={handleNgoSubmit}>
                <div className="form-group">
                  <label htmlFor="ngo-name" className="form-label">Organization Name</label>
                  <input
                    type="text"
                    id="ngo-name"
                    className="form-control"
                    placeholder="e.g., Vidya Seva Foundation"
                    value={ngoForm.orgName}
                    onChange={(e) => setNgoForm({ ...ngoForm, orgName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-2" style={{ gap: '0.75rem', marginBottom: 0 }}>
                  <div className="form-group">
                    <label htmlFor="ngo-reg" className="form-label">NGO Registration Number</label>
                    <input
                      type="text"
                      id="ngo-reg"
                      className="form-control"
                      placeholder="e.g., NGO-KA-2021-00892"
                      value={ngoForm.registrationNumber}
                      onChange={(e) => setNgoForm({ ...ngoForm, registrationNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ngo-contact" className="form-label">Contact Person Name</label>
                    <input
                      type="text"
                      id="ngo-contact"
                      className="form-control"
                      placeholder="e.g., Arun Kumar"
                      value={ngoForm.contactPerson}
                      onChange={(e) => setNgoForm({ ...ngoForm, contactPerson: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '0.75rem', marginBottom: 0 }}>
                  <div className="form-group">
                    <label htmlFor="ngo-email" className="form-label">Official Email</label>
                    <input
                      type="email"
                      id="ngo-email"
                      className="form-control"
                      placeholder="contact@ngo.org"
                      value={ngoForm.email}
                      onChange={(e) => setNgoForm({ ...ngoForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ngo-password" className="form-label">Password</label>
                    <input
                      type="password"
                      id="ngo-password"
                      className="form-control"
                      placeholder="Min. 6 characters"
                      minLength={6}
                      value={ngoForm.password}
                      onChange={(e) => setNgoForm({ ...ngoForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '0.75rem', marginBottom: 0 }}>
                  <div className="form-group">
                    <label htmlFor="ngo-phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      id="ngo-phone"
                      className="form-control"
                      placeholder="10-digit mobile number"
                      value={ngoForm.phone}
                      onChange={(e) => setNgoForm({ ...ngoForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ngo-city" className="form-label">City</label>
                    <input
                      type="text"
                      id="ngo-city"
                      className="form-control"
                      placeholder="e.g., Bengaluru"
                      value={ngoForm.city}
                      onChange={(e) => setNgoForm({ ...ngoForm, city: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="ngo-address" className="form-label">Office Address</label>
                  <input
                    type="text"
                    id="ngo-address"
                    className="form-control"
                    placeholder="e.g., 14, Malleshwaram, Bengaluru"
                    value={ngoForm.address}
                    onChange={(e) => setNgoForm({ ...ngoForm, address: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem' }}
                >
                  {loading ? 'Registering...' : 'Register Organization'}
                </button>
              </form>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Already have an account? <Link to="/login">Sign in here</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
