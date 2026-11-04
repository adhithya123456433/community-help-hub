import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CITIES = [
  'Ahmedabad',
  'Amritsar',
  'Bengaluru',
  'Bhopal',
  'Bhubaneswar',
  'Chandigarh',
  'Chennai',
  'Coimbatore',
  'Delhi',
  'Erode',
  'Guwahati',
  'Hyderabad',
  'Indore',
  'Jaipur',
  'Kochi',
  'Kolkata',
  'Lucknow',
  'Madurai',
  'Mumbai',
  'Patna',
  'Pune',
  'Salem',
  'Thanjavur',
  'Tiruchirappalli',
  'Tirunelveli',
  'Varanasi',
  'Vellore',
  'Visakhapatnam'
];

const CATEGORIES = [
  'Education',
  'Food distribution',
  'Environment',
  'Elder support',
  'Disaster support',
  'Community service'
];

export default function CreateTask() {
  const { user, role, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Tomorrow 09:00 AM default
  const getDefaultDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    skills: '',
    description: '',
    location: '',
    city: '',
    dateTime: getDefaultDateTime(),
    hours: 3,
    volunteersRequired: 5,
    urgency: 'Standard',
    targetBeneficiaries: ''
  });

  const [errorAlert, setErrorAlert] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-select NGO city
  useEffect(() => {
    if (user && user.profile && user.profile.city) {
      const matchedCity = CITIES.find(
        (c) =>
          c.toLowerCase() === user.profile.city.toLowerCase() ||
          user.profile.city.toLowerCase().includes(c.toLowerCase())
      );
      if (matchedCity) {
        setFormData((prev) => ({ ...prev, city: matchedCity }));
      }
    }
  }, [user]);

  if (!isLoggedIn || role !== 'ngo') {
    return (
      <main style={{ padding: '3.5rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <div
            className="card"
            style={{
              backgroundColor: '#fef2f2',
              border: '1.5px solid #f87171',
              borderLeft: '6px solid #dc2626',
              padding: '1.5rem'
            }}
          >
            <h3 style={{ color: '#991b1b', marginTop: 0, marginBottom: '0.4rem' }}>NGO Login Required</h3>
            <p style={{ color: '#7f1d1d', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              Only verified NGO organizations can create and publish community service opportunities. Your current status:{' '}
              <strong>{isLoggedIn ? `Logged in as ${role.toUpperCase()}` : 'Not logged in (Guest)'}</strong>.
            </p>
            <Link to="/login" className="btn btn-primary btn-sm">
              Go to Login Page
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const ngoProfile = user.profile || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorAlert('');

    const { title, category, description, location, city, dateTime, hours, volunteersRequired, skills } = formData;

    const missing = [];
    if (!title.trim()) missing.push('Task Title');
    if (!category) missing.push('Category');
    if (!description.trim()) missing.push('Activity Description');
    if (!location.trim()) missing.push('Area / Locality Address');
    if (!city) missing.push('City');
    if (!dateTime) missing.push('Date & Time');
    if (!volunteersRequired) missing.push('Volunteers Required');

    if (missing.length > 0) {
      const msg = `Please fill in all mandatory fields. Missing: ${missing.join(', ')}`;
      setErrorAlert(msg);
      showToast(msg, 'error', 4500);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiRequest('/tasks', 'POST', {
        title: title.trim(),
        category,
        description: description.trim(),
        requiredSkills: skills.trim(),
        location: location.trim(),
        city,
        dateTime,
        hours: Number(hours),
        volunteersRequired: Number(volunteersRequired),
        urgency: formData.urgency,
        targetBeneficiaries: formData.targetBeneficiaries.trim()
      });

      if (res.ok && res.data.success) {
        const createdTask = res.data.task;
        showToast(`Task "${createdTask.title}" published successfully!`, 'success', 3500);
        navigate('/ngo-dashboard');
      } else {
        const msg = res.data && res.data.message ? res.data.message : 'Failed to create task';
        setErrorAlert(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      setErrorAlert('Network error or server unavailable');
      showToast('Network error while creating task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <section className="page-banner">
        <div className="container">
          <span className="badge badge-primary" style={{ marginBottom: '0.6rem' }}>
            NGO OPERATIONS
          </span>
          <h1>Publish New Social-Service Task</h1>
          <p style={{ marginBottom: 0, fontSize: '1.1rem' }}>
            Create a community opportunity for volunteers across India to discover and apply.
          </p>
        </div>
      </section>

      <main style={{ padding: '2.75rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <div className="card">
            <div
              style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderLeft: '5px solid #16a34a',
                borderRadius: 'var(--radius-sm)',
                padding: '0.9rem 1.2rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div>
                <span
                  className="badge"
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    fontWeight: 800,
                    marginBottom: '0.25rem'
                  }}
                >
                  [AUTHORIZED NGO PUBLISHER]
                </span>
                <div style={{ fontWeight: 800, color: '#14532d', fontSize: '1.05rem', marginTop: '0.2rem' }}>
                  {ngoProfile.orgName || 'Registered Community NGO'}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#15803d' }}>
                  Registration Number: <strong>{ngoProfile.registrationNumber || 'Verified Partner'}</strong> | Registered
                  Base: <strong>{ngoProfile.city || 'India'}</strong>
                </div>
              </div>
              <div>
                <Link
                  to="/ngo-dashboard"
                  className="btn btn-outline btn-sm"
                  style={{ color: '#166534', borderColor: '#86efac' }}
                >
                  Manage Published Tasks
                </Link>
              </div>
            </div>

            {errorAlert && <div className="alert alert-danger">{errorAlert}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="task-title" className="form-label">
                  Task Title
                </label>
                <input
                  type="text"
                  id="task-title"
                  className="form-control"
                  placeholder="e.g., Weekend English Tutoring for Primary Students"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: 0 }}>
                <div className="form-group">
                  <label htmlFor="task-category" className="form-label">
                    Category
                  </label>
                  <select
                    id="task-category"
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="task-skills" className="form-label">
                    Required Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    id="task-skills"
                    className="form-control"
                    placeholder="e.g., Teaching, English, Patience"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="task-desc" className="form-label">
                  Activity Description
                </label>
                <textarea
                  id="task-desc"
                  className="form-control"
                  placeholder="Detailed objectives, volunteer expectations, and reporting location instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: 0 }}>
                <div className="form-group">
                  <label htmlFor="task-location" className="form-label">
                    Area / Locality Address
                  </label>
                  <input
                    type="text"
                    id="task-location"
                    className="form-control"
                    placeholder="e.g., Malleshwaram Model School"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="task-city" className="form-label">
                    City
                  </label>
                  <select
                    id="task-city"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  >
                    <option value="" disabled>
                      Select Task City
                    </option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-3" style={{ gap: '0.75rem', marginBottom: 0 }}>
                <div className="form-group">
                  <label htmlFor="task-datetime" className="form-label">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="task-datetime"
                    className="form-control"
                    value={formData.dateTime}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="task-hours" className="form-label">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    id="task-hours"
                    className="form-control"
                    min="1"
                    max="24"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="task-volunteers" className="form-label">
                    Volunteers Required
                  </label>
                  <input
                    type="number"
                    id="task-volunteers"
                    className="form-control"
                    min="1"
                    value={formData.volunteersRequired}
                    onChange={(e) => setFormData({ ...formData, volunteersRequired: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: 0 }}>
                <div className="form-group">
                  <label htmlFor="task-urgency" className="form-label">
                    Drive Urgency & Priority Level
                  </label>
                  <select
                    id="task-urgency"
                    className="form-control"
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  >
                    <option value="Standard">Standard Priority</option>
                    <option value="High Priority">High Priority Drive</option>
                    <option value="Urgent">Urgent / Emergency Drive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="task-beneficiaries" className="form-label">
                    Target Community / Beneficiaries
                  </label>
                  <input
                    type="text"
                    id="task-beneficiaries"
                    className="form-control"
                    placeholder="e.g., 150 Primary School Children, 200 Families"
                    value={formData.targetBeneficiaries}
                    onChange={(e) => setFormData({ ...formData, targetBeneficiaries: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '0.65rem' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Publishing Task to Community...' : 'Publish Task'}
                </button>
                <Link to="/ngo-dashboard" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
