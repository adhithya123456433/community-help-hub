import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useToast } from '../context/ToastContext';

function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Education':
      return 'badge-cat-education';
    case 'Food distribution':
      return 'badge-cat-food';
    case 'Environment':
      return 'badge-cat-environment';
    case 'Elder support':
      return 'badge-cat-elder';
    case 'Disaster support':
      return 'badge-cat-disaster';
    case 'Community service':
      return 'badge-cat-community';
    default:
      return 'badge-category';
  }
}

export default function VolunteerDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillsInput, setSkillsInput] = useState('');
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [data, setData] = useState({
    stats: {
      fullName: 'Volunteer',
      city: 'India',
      totalTasksCompleted: 0,
      activeAssignmentsCount: 0,
      totalHours: 0,
      rank: 1,
      rankingPoints: 0,
      skills: []
    },
    activeAssignments: [],
    certificates: []
  });

  useEffect(() => {
    fetchVolunteerData();
  }, []);

  const fetchVolunteerData = async () => {
    setLoading(true);
    const res = await apiRequest('/dashboard/volunteer', 'GET');
    if (res.ok && res.data && res.data.success) {
      setData(res.data);
    } else {
      showToast(res.data?.message || 'Failed to load volunteer dashboard data', 'error');
    }
    setLoading(false);
  };

  const openSkillsModal = () => {
    setSkillsInput((data.stats?.skills || []).join(', '));
    setIsSkillModalOpen(true);
  };

  const handleSaveSkills = async (e) => {
    e.preventDefault();
    setIsSavingSkills(true);
    const res = await apiRequest('/auth/volunteer/skills', 'PUT', { skills: skillsInput });
    setIsSavingSkills(false);

    if (res.ok && res.data && res.data.success) {
      showToast('Skills updated successfully!', 'success');
      setIsSkillModalOpen(false);
      setData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          skills: res.data.skills
        }
      }));
    } else {
      showToast(res.data?.message || 'Failed to update skills', 'error');
    }
  };

  const { stats, activeAssignments, certificates } = data;

  const renderTierBadge = (points) => {
    if (points >= 80) {
      return (
        <span
          className="badge"
          style={{
            backgroundColor: '#eab308',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.88rem',
            padding: '0.4rem 0.85rem'
          }}
        >
          [GOLD CHAMPION]
        </span>
      );
    }
    if (points >= 40) {
      return (
        <span
          className="badge"
          style={{
            backgroundColor: '#64748b',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.88rem',
            padding: '0.4rem 0.85rem'
          }}
        >
          [SILVER TIER]
        </span>
      );
    }
    return (
      <span
        className="badge"
        style={{
          backgroundColor: '#b45309',
          color: '#ffffff',
          border: 'none',
          fontSize: '0.88rem',
          padding: '0.4rem 0.85rem'
        }}
      >
        [BRONZE TIER]
      </span>
    );
  };

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.6rem' }}>VOLUNTEER PORTAL</span>
              <h1>Welcome, {stats.fullName || 'Volunteer'}</h1>
              <p style={{ marginBottom: 0, fontSize: '1.1rem' }}>
                Location: {stats.city || 'India'} | Active Community Contributor
              </p>
            </div>
            <div>
              <Link to="/explore-tasks" className="btn btn-primary" style={{ padding: '0.75rem 1.6rem', fontSize: '1.05rem' }}>
                Find New Opportunities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <main style={{ padding: '2.75rem 0', flex: 1 }}>
        <div className="container">

          {/* Volunteer Profile & Skills Card */}
          <div className="card" style={{ marginBottom: '2rem', borderLeft: '5px solid var(--primary)', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>VERIFIED VOLUNTEER PROFILE</span>
                <h3 style={{ margin: '0.2rem 0 0.4rem 0' }}>{stats.fullName || 'Volunteer Profile'}</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Registered City: {stats.city || '-'} | Contributor ID: Active | Verified Hours: {stats.totalHours || 0} Hrs
                </p>
              </div>
              <div>{renderTierBadge(stats.rankingPoints || 0)}</div>
            </div>

            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div
                  style={{
                    fontSize: '0.82rem',
                    textTransform: 'uppercase',
                    color: 'var(--text-light)',
                    fontWeight: 800,
                    letterSpacing: '0.5px'
                  }}
                >
                  Your Registered Volunteer Skills & Competencies:
                </div>
                <button
                  type="button"
                  onClick={openSkillsModal}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                >
                  + Add / Edit Skills
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {stats.skills && stats.skills.length > 0 ? (
                  stats.skills.map((skill, index) => (
                    <span key={index} className="badge badge-skill" style={{ fontSize: '0.88rem', padding: '0.35rem 0.75rem' }}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>
                    General volunteer assistance; no specialized technical skills registered. Click "+ Add / Edit Skills" above to add your competencies.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stat Boxes */}
          <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
            <div className="stat-box">
              <div className="stat-label">Tasks Completed</div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>
                {loading ? '...' : stats.totalTasksCompleted || 0}
              </div>
              <div className="stat-meta">Verified by NGOs</div>
            </div>
            <div className="stat-box stat-blue">
              <div className="stat-label">Active Assignments</div>
              <div className="stat-value" style={{ color: 'var(--secondary)' }}>
                {loading ? '...' : stats.activeAssignmentsCount || 0}
              </div>
              <div className="stat-meta">In progress / Applied</div>
            </div>
            <div className="stat-box stat-purple">
              <div className="stat-label">Hours Contributed</div>
              <div className="stat-value" style={{ color: '#7e22ce' }}>
                {loading ? '...' : `${stats.totalHours || 0} Hrs`}
              </div>
              <div className="stat-meta">Logged service time</div>
            </div>
            <div className="stat-box stat-amber">
              <div className="stat-label">Leaderboard Rank</div>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>
                {loading ? '...' : `#${stats.rank || 1}`}
              </div>
              <div className="stat-meta">
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{stats.rankingPoints || 0} Pts</span> (Ranking score)
              </div>
            </div>
          </div>

          {/* Active Assignments Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Active Tasks & Applications</h2>
              <Link to="/my-tasks" className="btn btn-outline btn-sm">
                View Full History
              </Link>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Category</th>
                    <th>City</th>
                    <th>Application Note Entered</th>
                    <th>Scheduled Date</th>
                    <th>Assignment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1.5rem' }}>
                        Loading active assignments...
                      </td>
                    </tr>
                  ) : activeAssignments.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1.5rem' }}>
                        No active assignments. Explore tasks to apply for opportunities.
                      </td>
                    </tr>
                  ) : (
                    activeAssignments.map((app) => {
                      const task = app.taskId || {};
                      let statusBadgeClass = 'badge-open';
                      if (app.status === 'Assigned') statusBadgeClass = 'badge-assigned';
                      if (app.status === 'Completed') statusBadgeClass = 'badge-completed';
                      if (app.status === 'Rejected') statusBadgeClass = 'badge-danger';

                      const formattedDate = task.dateTime
                        ? new Date(task.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'TBD';

                      return (
                        <tr key={app._id}>
                          <td>
                            <strong>
                              <Link to={`/tasks/${task._id}`}>{task.title || 'Task Details'}</Link>
                            </strong>
                          </td>
                          <td>
                            <span className={`badge ${getCategoryBadgeClass(task.category)}`}>
                              {task.category || 'General'}
                            </span>
                          </td>
                          <td>{task.city || 'Local'}</td>
                          <td>
                            {app.notes ? (
                              <em style={{ color: 'var(--text-main)', fontSize: '0.88rem' }}>"{app.notes}"</em>
                            ) : (
                              <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>(Standard Application)</span>
                            )}
                          </td>
                          <td>{formattedDate}</td>
                          <td>
                            <span className={`badge ${statusBadgeClass}`}>[{app.status.toUpperCase()}]</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Earned Certificates Section */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h2>Earned Certificates of Appreciation</h2>
              <p>Official completion certificates generated automatically upon NGO verification.</p>
            </div>

            <div id="certificates-list">
              {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>
                  Loading certificates...
                </div>
              ) : certificates.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                  No certificates earned yet. Complete your assigned tasks to generate verified PDF certificates.
                </div>
              ) : (
                certificates.map((cert) => {
                  const task = cert.taskId || {};
                  const ngo = cert.ngoId || {};
                  const formattedDate = new Date(cert.issueDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  });

                  return (
                    <div
                      key={cert._id}
                      className="card"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}
                    >
                      <div>
                        <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>
                          [VERIFIED CERTIFICATE]
                        </span>
                        <h4 style={{ margin: '0.2rem 0' }}>{task.title || 'Community Service Activity'}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 0 }}>
                          Issued by: <strong>{ngo.orgName || 'NGO Partner'}</strong> | Date: {formattedDate} | Hours: {cert.hoursCompleted} Hrs
                        </p>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                          ID: {cert.certificateId}
                        </div>
                      </div>
                      <div>
                        <a
                          href={`/api/certificates/download/${cert._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          Download PDF
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Edit Volunteer Skills Modal */}
      {isSkillModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(15, 23, 42, 0.7)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setIsSkillModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              padding: '1.75rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Update Volunteer Skills & Competencies</h3>
              <button
                type="button"
                onClick={() => setIsSkillModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-light)' }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Enter your skills separated by commas. These help us recommend matching tasks in your area.
            </p>

            <form onSubmit={handleSaveSkills}>
              <div className="form-group">
                <label className="form-label">Skills (Comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Teaching, First Aid, Food Logistics, Clean-up, Counseling"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  autoFocus
                />
                <div className="form-hint">
                  Examples: First Aid, Teaching, Packaging, Clean-up, Public Speaking, Healthcare, Cooking
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" disabled={isSavingSkills} className="btn btn-primary" style={{ flex: 2 }}>
                  {isSavingSkills ? 'Saving...' : 'Save Skills'}
                </button>
                <button type="button" onClick={() => setIsSkillModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
