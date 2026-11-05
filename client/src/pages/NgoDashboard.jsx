import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

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

export default function NgoDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    ngo: { orgName: 'NGO Organization', registrationNumber: '-', city: '-' },
    stats: {
      totalTasksCreated: 0,
      activeTasks: 0,
      completedTasks: 0,
      totalApplicationsReceived: 0,
      assignedVolunteersCount: 0
    },
    tasks: []
  });
  const [applications, setApplications] = useState([]);

  // Confirm modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    isDanger: false,
    onConfirm: () => {}
  });

  // Edit Task Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    category: 'Education',
    status: 'Open',
    description: '',
    location: '',
    city: '',
    hours: 3,
    volunteersRequired: 5,
    requiredSkills: ''
  });
  const [editModalError, setEditModalError] = useState('');

  // Auto-dismiss modal error alert after 4.5 seconds
  useEffect(() => {
    if (editModalError) {
      const timer = setTimeout(() => {
        setEditModalError('');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [editModalError]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchDashboard(), fetchApplications()]);
    setLoading(false);
  };

  const fetchDashboard = async () => {
    const res = await apiRequest('/dashboard/ngo', 'GET');
    if (res.ok && res.data && res.data.success) {
      setDashboardData(res.data);
    } else {
      showToast(res.data?.message || 'Failed to load NGO dashboard data', 'error');
    }
  };

  const fetchApplications = async () => {
    const res = await apiRequest('/applications/ngo/all', 'GET');
    if (res.ok && res.data && res.data.success) {
      setApplications(res.data.applications || []);
    }
  };

  const handleUpdateAppStatus = (appId, status) => {
    const isCompleted = status === 'Completed';
    const isDanger = status === 'Rejected';
    const confirmMsg = isCompleted
      ? 'Mark this volunteer task as Completed? This will award ranking points and generate an official PDF certificate.'
      : `Update application status to ${status}?`;

    setConfirmConfig({
      isOpen: true,
      title: 'Update Application Status',
      message: confirmMsg,
      confirmText: `Set as ${status}`,
      isDanger,
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        const res = await apiRequest(`/applications/${appId}/status`, 'PUT', { status });
        if (res.ok && res.data && res.data.success) {
          showToast(`Status updated to ${status}`, 'success');
          loadAllData();
        } else {
          showToast(res.data?.message || 'Failed to update application status', 'error');
        }
      }
    });
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    if (!newStatus) return;
    const res = await apiRequest(`/tasks/${taskId}`, 'PUT', { status: newStatus });
    if (res.ok && res.data && res.data.success) {
      showToast(`Task status updated to ${newStatus}`, 'success');
      fetchDashboard();
    } else {
      showToast(res.data?.message || 'Failed to update task status', 'error');
    }
  };

  const handleDeleteTask = (taskId) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Community Drive',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmText: 'Delete Task',
      isDanger: true,
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        const res = await apiRequest(`/tasks/${taskId}`, 'DELETE');
        if (res.ok && res.data && res.data.success) {
          showToast('Task deleted successfully', 'success');
          loadAllData();
        } else {
          showToast(res.data?.message || 'Failed to delete task', 'error');
        }
      }
    });
  };

  const openEditModal = (task) => {
    setEditFormData({
      id: task._id,
      title: task.title || '',
      category: task.category || 'Education',
      status: task.status || 'Open',
      description: task.description || '',
      location: task.location || '',
      city: task.city || '',
      hours: task.hours || 3,
      volunteersRequired: task.volunteersRequired || 1,
      requiredSkills: (task.requiredSkills || []).join(', ')
    });
    setEditModalError('');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditModalError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSavingEdit(true);
    setEditModalError('');

    const res = await apiRequest(`/tasks/${editFormData.id}`, 'PUT', {
      title: editFormData.title.trim(),
      category: editFormData.category,
      status: editFormData.status,
      description: editFormData.description.trim(),
      location: editFormData.location.trim(),
      city: editFormData.city.trim(),
      hours: Number(editFormData.hours),
      volunteersRequired: Number(editFormData.volunteersRequired),
      requiredSkills: editFormData.requiredSkills.trim()
    });

    setIsSavingEdit(false);
    if (res.ok && res.data && res.data.success) {
      showToast('Task updated successfully!', 'success');
      closeEditModal();
      loadAllData();
    } else {
      setEditModalError(res.data?.message || 'Failed to update task');
    }
  };

  const { ngo, stats, tasks } = dashboardData;

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.6rem' }}>ORGANIZATION DASHBOARD</span>
              <h1>{ngo.orgName || 'NGO Organization'}</h1>
              <p style={{ marginBottom: 0, fontSize: '1.1rem' }}>
                Registration: {ngo.registrationNumber || '-'} | City: {ngo.city || '-'}
              </p>
            </div>
            <div>
              <Link to="/create-task" className="btn btn-primary" style={{ padding: '0.75rem 1.6rem', fontSize: '1.05rem' }}>
                + Publish New Task
              </Link>
            </div>
          </div>
        </div>
      </section>
      <main style={{ padding: '2.75rem 0', flex: 1 }}>
        <div className="container">

          {/* Stats Grid */}
          <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
            <div className="stat-box">
              <div className="stat-label">Tasks Created</div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>
                {loading ? '...' : stats.totalTasksCreated || 0}
              </div>
              <div className="stat-meta">Total opportunities published</div>
            </div>
            <div className="stat-box stat-blue">
              <div className="stat-label">Active Drives</div>
              <div className="stat-value" style={{ color: 'var(--secondary)' }}>
                {loading ? '...' : stats.activeTasks || 0}
              </div>
              <div className="stat-meta">Open or In Progress</div>
            </div>
            <div className="stat-box stat-purple">
              <div className="stat-label">Completed Drives</div>
              <div className="stat-value" style={{ color: '#7e22ce' }}>
                {loading ? '...' : stats.completedTasks || 0}
              </div>
              <div className="stat-meta">Successfully completed</div>
            </div>
            <div className="stat-box stat-amber">
              <div className="stat-label">Volunteers Assigned</div>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>
                {loading ? '...' : stats.assignedVolunteersCount || 0}
              </div>
              <div className="stat-meta">
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{stats.totalApplicationsReceived || 0}</span> total applicants
              </div>
            </div>
          </div>

          {/* Volunteer Applications Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2>Volunteer Applications & Task Assignment</h2>
              <p>Review volunteer applications, assign volunteers to tasks, and mark tasks completed upon event conclusion.</p>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Applied Task</th>
                    <th>Volunteer Skills</th>
                    <th>Message / Notes</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1.5rem' }}>
                        Loading volunteer applications...
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1.5rem' }}>
                        No volunteer applications received yet.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => {
                      const vol = app.volunteerId || {};
                      const task = app.taskId || {};

                      let statusBadge = 'badge-open';
                      if (app.status === 'Assigned') statusBadge = 'badge-assigned';
                      if (app.status === 'Completed') statusBadge = 'badge-completed';
                      if (app.status === 'Rejected') statusBadge = 'badge-danger';

                      const appliedDate = app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        : 'Recent';

                      return (
                        <tr key={app._id}>
                          <td>
                            <strong>{vol.fullName || 'Volunteer'}</strong>
                            <br />
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                              {vol.phone || ''} | {vol.city || ''}
                            </span>
                            <br />
                            <span style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 600 }}>
                              Applied: {appliedDate}
                            </span>
                          </td>
                          <td>
                            {task._id ? (
                              <Link to={`/tasks/${task._id}`}>
                                <strong>{task.title || 'Task Details'}</strong>
                              </Link>
                            ) : (
                              <span>{task.title || 'Task'}</span>
                            )}
                          </td>
                          <td>
                            {vol.skills && vol.skills.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                {vol.skills.map((s, idx) => (
                                  <span key={idx} className="badge badge-skill">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>General Volunteer</span>
                            )}
                          </td>
                          <td>
                            {app.notes ? (
                              <em style={{ color: 'var(--text-main)', fontSize: '0.88rem' }}>"{app.notes}"</em>
                            ) : (
                              <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>(Standard Application)</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${statusBadge}`}>[{app.status.toUpperCase()}]</span>
                          </td>
                          <td>
                            {app.status === 'Applied' && (
                              <div className="table-actions">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAppStatus(app._id, 'Assigned')}
                                  className="btn btn-primary btn-sm"
                                >
                                  Assign
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAppStatus(app._id, 'Rejected')}
                                  className="btn btn-danger btn-sm"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {app.status === 'Assigned' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateAppStatus(app._id, 'Completed')}
                                className="btn btn-sm btn-accent"
                              >
                                Mark Completed (Issue Certificate)
                              </button>
                            )}
                            {app.status === 'Completed' && (
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Completed</span>
                            )}
                            {app.status === 'Rejected' && (
                              <span style={{ fontSize: '0.82rem', color: 'var(--danger)' }}>Rejected</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Manage Published Tasks Section */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h2>Manage Published Tasks</h2>
              <p>Update task statuses or remove concluded activities.</p>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Volunteers</th>
                    <th>Status</th>
                    <th>Manage Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1.5rem' }}>
                        Loading tasks...
                      </td>
                    </tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1.5rem' }}>
                        No tasks published yet. Click "Publish New Task" to post your first opportunity.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => {
                      let statusBadge = 'badge-open';
                      if (task.status === 'Completed') statusBadge = 'badge-completed';
                      if (task.status === 'In Progress') statusBadge = 'badge-assigned';
                      if (task.status === 'Cancelled') statusBadge = 'badge-danger';

                      const formattedDate = new Date(task.dateTime).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      });

                      return (
                        <tr key={task._id}>
                          <td>
                            <strong>
                              <Link to={`/tasks/${task._id}`}>{task.title}</Link>
                            </strong>
                          </td>
                          <td>
                            <span className={`badge ${getCategoryBadgeClass(task.category)}`}>
                              {task.category}
                            </span>
                          </td>
                          <td>{formattedDate}</td>
                          <td>
                            {task.volunteersAssigned || 0} / {task.volunteersRequired}
                          </td>
                          <td>
                            <span className={`badge ${statusBadge}`}>[{task.status.toUpperCase()}]</span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <div className="table-actions">
                              <button
                                type="button"
                                onClick={() => openEditModal(task)}
                                className="btn btn-sm btn-outline"
                              >
                                Edit
                              </button>
                              <select
                                value=""
                                onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                                className="select-sm"
                              >
                                <option value="" disabled>
                                  Status: {task.status}
                                </option>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task._id)}
                                className="btn btn-sm btn-danger"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
      {isEditModalOpen && (
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
            overflowY: 'auto',
            padding: '1.5rem'
          }}
          onClick={closeEditModal}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              padding: '2rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Edit Task Details (CRUD Update)</h3>
              <button
                type="button"
                onClick={closeEditModal}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-light)' }}
              >
                &times;
              </button>
            </div>

            {editModalError && (
              <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span>{editModalError}</span>
                <button type="button" onClick={() => setEditModalError('')} className="toast-close-btn" style={{ color: 'inherit', fontSize: '1.25rem' }} aria-label="Close">&times;</button>
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    required
                  >
                    <option value="Education">Education</option>
                    <option value="Food distribution">Food distribution</option>
                    <option value="Environment">Environment</option>
                    <option value="Elder support">Elder support</option>
                    <option value="Disaster support">Disaster support</option>
                    <option value="Community service">Community service</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Task Status</label>
                  <select
                    className="form-control"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    required
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Locality / Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Estimated Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    className="form-control"
                    value={editFormData.hours}
                    onChange={(e) => setEditFormData({ ...editFormData, hours: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Volunteers Required</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={editFormData.volunteersRequired}
                    onChange={(e) => setEditFormData({ ...editFormData, volunteersRequired: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.requiredSkills}
                  onChange={(e) => setEditFormData({ ...editFormData, requiredSkills: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" disabled={isSavingEdit} className="btn btn-primary" style={{ flex: 2 }}>
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={closeEditModal} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        isDanger={confirmConfig.isDanger}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
