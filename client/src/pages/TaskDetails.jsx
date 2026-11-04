import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCategoryBadgeClass } from '../components/TaskCard';
import PromptModal from '../components/PromptModal';

export default function TaskDetails() {
  const { id } = useParams();
  const { isLoggedIn, role } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [existingApp, setExistingApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const fetchTaskData = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/tasks/${id}`, 'GET');
      if (res.ok && res.data.success) {
        setTask(res.data.task);
      } else {
        setError(res.data.message || 'Task not found');
      }

      // Check if logged in volunteer has already applied
      if (isLoggedIn && role === 'volunteer') {
        const myAppsRes = await apiRequest('/applications/my-tasks', 'GET');
        if (myAppsRes.ok && myAppsRes.data && Array.isArray(myAppsRes.data.applications)) {
          const matched = myAppsRes.data.applications.find((app) => {
            if (!app.taskId) return false;
            const tId = app.taskId._id ? app.taskId._id.toString() : app.taskId.toString();
            return tId === id;
          });
          setExistingApp(matched || null);
        }
      }
    } catch (e) {
      setError('Failed to fetch task specifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [id, isLoggedIn, role]);

  const handleApplyClick = () => {
    if (!isLoggedIn) {
      showToast('Please log in as a volunteer to apply for tasks.', 'warning');
      navigate('/login');
      return;
    }

    if (role !== 'volunteer') {
      showToast('Only registered volunteers can apply for tasks.', 'error');
      return;
    }

    setIsApplyModalOpen(true);
  };

  const handleConfirmApply = async (note) => {
    try {
      const res = await apiRequest('/applications/apply', 'POST', {
        taskId: id,
        notes: note.trim()
      });

      if (res.ok && res.data.success) {
        showToast('Application successfully submitted! Recorded as [APPLIED].', 'success', 4000);
        setIsApplyModalOpen(false);
        await fetchTaskData();
      } else {
        showToast(res.data.message || 'Failed to submit application', 'error');
      }
    } catch (e) {
      showToast('Error submitting task application', 'error');
    }
  };

  if (loading) {
    return (
      <main style={{ padding: '3.5rem 0', flex: 1, textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="container">Loading task specifications...</div>
      </main>
    );
  }

  if (error || !task) {
    return (
      <main style={{ padding: '3rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <div className="alert alert-danger">{error || 'Task not found'}</div>
          <Link to="/explore-tasks" className="btn btn-outline" style={{ marginTop: '1rem' }}>
            Back to Explore Tasks
          </Link>
        </div>
      </main>
    );
  }

  const ngo = task.createdBy || {};
  const formattedDate = new Date(task.dateTime).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const catBadgeClass = getCategoryBadgeClass(task.category);

  return (
    <main style={{ padding: '2.75rem 0', flex: 1 }}>
      <div className="container" style={{ maxWidth: '1040px' }}>
        <div className="card" style={{ marginBottom: '2rem', borderTop: '5px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span className={`badge ${catBadgeClass}`}>{task.category}</span>
              {task.urgency === 'Urgent' && (
                <span className="badge badge-danger" style={{ fontWeight: 800 }}>
                  [URGENT DRIVE]
                </span>
              )}
              {task.urgency === 'High Priority' && (
                <span className="badge" style={{ backgroundColor: '#ea580c', color: '#ffffff', border: 'none', fontWeight: 800 }}>
                  [HIGH PRIORITY]
                </span>
              )}
              {task.targetBeneficiaries && (
                <span className="badge" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 800 }}>
                  [BENEFICIARIES: {task.targetBeneficiaries.toUpperCase()}]
                </span>
              )}
            </div>
            <span className="badge badge-open">[STATUS: {task.status.toUpperCase()}]</span>
          </div>

          {/* Already Applied Status Banner */}
          {existingApp && (
            <div
              className="card"
              style={{
                backgroundColor: '#ecfdf5',
                border: '1.5px solid #059669',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
                borderLeft: '6px solid #059669'
              }}
            >
              <div style={{ fontWeight: 800, color: '#065f46', fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                [YOUR APPLICATION IS RECORDED]
              </div>
              <div style={{ fontSize: '0.92rem', color: '#047857', marginBottom: '0.5rem' }}>
                Application Status: <strong style={{ textTransform: 'uppercase' }}>[{existingApp.status}]</strong> | Applied
                on:{' '}
                <strong>
                  {existingApp.appliedAt
                    ? new Date(existingApp.appliedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'Recently'}
                </strong>
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  background: '#ffffff',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #a7f3d0'
                }}
              >
                <strong>Application Note Sent to NGO:</strong>{' '}
                {existingApp.notes ? (
                  <em>"{existingApp.notes}"</em>
                ) : (
                  <span style={{ color: 'var(--text-light)' }}>(Standard application with no additional note)</span>
                )}
              </div>
            </div>
          )}

          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.6rem', color: 'var(--text-main)' }}>{task.title}</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Published by <strong style={{ color: 'var(--primary-dark)' }}>{ngo.orgName || 'Community NGO'}</strong> (Registration
            ID: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{ngo.registrationNumber || 'Verified'}</span>)
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem'
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  color: 'var(--text-light)',
                  fontWeight: 800,
                  letterSpacing: '0.5px'
                }}
              >
                Location & City
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.3rem' }}>
                {task.location}, {task.city}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  color: 'var(--text-light)',
                  fontWeight: 800,
                  letterSpacing: '0.5px'
                }}
              >
                Date & Time
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.3rem' }}>
                {formattedDate}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  color: 'var(--text-light)',
                  fontWeight: 800,
                  letterSpacing: '0.5px'
                }}
              >
                Duration Commitment
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.3rem' }}>
                {task.hours} Hours Service
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  color: 'var(--text-light)',
                  fontWeight: 800,
                  letterSpacing: '0.5px'
                }}
              >
                Volunteers Needed
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--secondary)', marginTop: '0.3rem' }}>
                {task.volunteersAssigned || 0} / {task.volunteersRequired} Assigned
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: '0.6rem' }}>Activity Description</h3>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1.75rem' }}>
            {task.description}
          </p>

          <h3 style={{ marginBottom: '0.6rem' }}>Required Skills & Competencies</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '2rem' }}>
            {task.requiredSkills && task.requiredSkills.length > 0 ? (
              task.requiredSkills.map((s, idx) => (
                <span key={idx} className="badge badge-skill">
                  {s}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                General volunteer assistance; no specialized technical skills required.
              </span>
            )}
          </div>

          <div
            className="card"
            style={{
              backgroundColor: '#f1f5f9',
              border: '1.5px solid var(--border-color)',
              borderLeft: '5px solid var(--secondary)',
              marginBottom: '2.25rem'
            }}
          >
            <h4 style={{ color: 'var(--secondary)', marginBottom: '0.6rem' }}>Organizing NGO Details</h4>
            <p style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
              <strong>Organization:</strong> {ngo.orgName}
            </p>
            <p style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
              <strong>Registration ID:</strong> {ngo.registrationNumber}
            </p>
            <p style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>
              <strong>City:</strong> {ngo.city}
            </p>
            <p style={{ fontSize: '0.92rem', marginBottom: 0 }}>
              <strong>Coordinator Contact:</strong> {ngo.contactPerson} ({ngo.phone})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {existingApp ? (
              <>
                <button
                  type="button"
                  disabled
                  className="btn btn-purple"
                  style={{
                    height: '46px',
                    padding: '0 1.5rem',
                    fontSize: '0.95rem',
                    cursor: 'not-allowed',
                    fontWeight: 700,
                    opacity: 0.95,
                    boxSizing: 'border-box',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1
                  }}
                >
                  Already Applied [{existingApp.status.toUpperCase()}]
                </button>
                <Link
                  to="/volunteer-dashboard"
                  className="btn btn-primary"
                  style={{
                    height: '46px',
                    padding: '0 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    boxSizing: 'border-box',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1
                  }}
                >
                  Go to Volunteer Dashboard
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={handleApplyClick}
                className="btn btn-primary"
                style={{
                  height: '46px',
                  padding: '0 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}
              >
                Apply for this Task
              </button>
            )}
            <Link
              to="/explore-tasks"
              className="btn btn-neutral"
              style={{
                height: '46px',
                padding: '0 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                boxSizing: 'border-box',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}
            >
              Back to All Tasks
            </Link>
          </div>
        </div>
      </div>
      <PromptModal
        isOpen={isApplyModalOpen}
        title="Confirm Task Application"
        message="Your volunteer profile (name, mobile number, registered city, and skills) will be submitted to the organizing NGO. You can also include an optional note or availability details below:"
        placeholder="e.g., Available on the scheduled date, experienced in student mentoring..."
        submitText="Submit Application"
        onCancel={() => setIsApplyModalOpen(false)}
        onSubmit={handleConfirmApply}
      />
    </main>
  );
}
