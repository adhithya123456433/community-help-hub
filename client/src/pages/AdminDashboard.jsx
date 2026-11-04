import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
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

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState({
    metrics: {
      totalUsers: 0,
      totalNGOs: 0,
      totalVolunteers: 0,
      totalTasks: 0,
      totalHours: 0,
      totalApplications: 0,
      totalCertificates: 0
    },
    system: {
      nodeVersion: 'Node.js',
      platform: 'Windows',
      uptimeSeconds: 0
    }
  });

  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const [tasks, setTasks] = useState([]);
  const [taskCategoryFilter, setTaskCategoryFilter] = useState('All');

  // Confirmation modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    isDanger: true,
    onConfirm: () => {}
  });

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    await Promise.all([fetchOverview(), fetchUsers(), fetchTasks()]);
    setLoading(false);
  };

  const fetchOverview = async () => {
    const res = await apiRequest('/admin/overview', 'GET');
    if (res.ok && res.data && res.data.success) {
      setOverview(res.data);
    }
  };

  const fetchUsers = async () => {
    const res = await apiRequest('/admin/users', 'GET');
    if (res.ok && res.data && res.data.success) {
      setUsers(res.data.users || []);
    }
  };

  const fetchTasks = async () => {
    const res = await apiRequest('/admin/tasks', 'GET');
    if (res.ok && res.data && res.data.success) {
      setTasks(res.data.tasks || []);
    }
  };

  const handleDeleteUser = (userId, email) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user account: ${email}? All associated volunteer/NGO records and tasks will be removed.`,
      confirmText: 'Delete Account',
      isDanger: true,
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        const res = await apiRequest(`/admin/users/${userId}`, 'DELETE');
        if (res.ok && res.data && res.data.success) {
          showToast(res.data.message || 'User deleted successfully', 'success');
          loadAllAdminData();
        } else {
          showToast(res.data?.message || 'Failed to delete user', 'error');
        }
      }
    });
  };

  const handleDeleteTask = (taskId, taskTitle) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Task',
      message: `Are you sure you want to permanently delete task: "${taskTitle}"? All volunteer applications and certificates for this task will be removed.`,
      confirmText: 'Delete Task',
      isDanger: true,
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        const res = await apiRequest(`/admin/tasks/${taskId}`, 'DELETE');
        if (res.ok && res.data && res.data.success) {
          showToast(res.data.message || 'Task deleted successfully', 'success');
          loadAllAdminData();
        } else {
          showToast(res.data?.message || 'Failed to delete task', 'error');
        }
      }
    });
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    if (!newStatus) return;
    const res = await apiRequest(`/admin/tasks/${taskId}/status`, 'PUT', { status: newStatus });
    if (res.ok && res.data && res.data.success) {
      showToast(`Task status updated to ${newStatus} by Administrator`, 'success');
      fetchTasks();
    } else {
      showToast(res.data?.message || 'Failed to update task status', 'error');
    }
  };

  // Filter users based on query
  const filteredUsers = users.filter((u) => {
    const q = userSearchQuery.toLowerCase().trim();
    if (!q) return true;
    const emailMatch = (u.email || '').toLowerCase().includes(q);
    const roleMatch = (u.role || '').toLowerCase().includes(q);
    const nameMatch = u.profile && (u.profile.fullName || u.profile.orgName || '').toLowerCase().includes(q);
    const cityMatch = u.profile && (u.profile.city || '').toLowerCase().includes(q);
    return emailMatch || roleMatch || nameMatch || cityMatch;
  });

  // Partner NGOs
  const ngoUsers = users.filter((u) => u.role === 'ngo' && u.profile);

  // Filter tasks based on category
  const filteredTasks = tasks.filter((t) => {
    if (taskCategoryFilter === 'All') return true;
    return t.category === taskCategoryFilter;
  });

  const { metrics, system } = overview;

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <span
            className="badge"
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              marginBottom: '0.6rem',
              fontWeight: 800,
              fontSize: '0.82rem',
              letterSpacing: '0.5px'
            }}
          >
            SYSTEM ADMINISTRATOR PORTAL
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            National Platform Governance
          </h1>
          <p style={{ marginBottom: 0, fontSize: '1.1rem' }}>
            National platform governance, user management, global task oversight, and database monitoring.
          </p>
        </div>
      </section>
      <main style={{ padding: '2.75rem 0', flex: 1 }}>
        <div className="container">
          <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
            <div className="stat-box">
              <div className="stat-label">Total Registered Users</div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>
                {loading ? '...' : metrics.totalUsers || 0}
              </div>
              <div className="stat-meta">Volunteers, NGOs & Admins</div>
            </div>
            <div className="stat-box stat-blue">
              <div className="stat-label">Verified Partner NGOs</div>
              <div className="stat-value" style={{ color: 'var(--secondary)' }}>
                {loading ? '...' : metrics.totalNGOs || 0}
              </div>
              <div className="stat-meta">Across All Cities</div>
            </div>
            <div className="stat-box stat-amber">
              <div className="stat-label">Active Volunteers</div>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>
                {loading ? '...' : metrics.totalVolunteers || 0}
              </div>
              <div className="stat-meta">Registered contributors</div>
            </div>
            <div className="stat-box stat-purple">
              <div className="stat-label">Community Drives</div>
              <div className="stat-value" style={{ color: '#7e22ce' }}>
                {loading ? '...' : metrics.totalTasks || 0}
              </div>
              <div className="stat-meta">
                <span style={{ fontWeight: 700 }}>{metrics.totalHours || 0}</span> verified service hours
              </div>
            </div>
          </div>

          {/* Management Tabs */}
          <div className="tabs" style={{ marginBottom: '1.75rem' }}>
            <button
              type="button"
              className={`tab-btn admin-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              User Directory & Roles
            </button>
            <button
              type="button"
              className={`tab-btn admin-tab ${activeTab === 'ngos' ? 'active' : ''}`}
              onClick={() => setActiveTab('ngos')}
            >
              Partner Organizations (NGOs)
            </button>
            <button
              type="button"
              className={`tab-btn admin-tab ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              All Community Tasks
            </button>
            <button
              type="button"
              className={`tab-btn admin-tab ${activeTab === 'system' ? 'active' : ''}`}
              onClick={() => setActiveTab('system')}
            >
              System Health & Diagnostics
            </button>
          </div>
          {activeTab === 'users' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.55rem', marginBottom: '0.25rem' }}>User Accounts Directory</h2>
                  <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)', marginBottom: 0 }}>
                    Manage all registered volunteers, partner NGOs, and administrators.
                  </p>
                </div>
                <div>
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="form-control"
                    placeholder="Search by email, name, or city..."
                    style={{ width: '340px', fontSize: '0.95rem', padding: '0.65rem 1rem' }}
                  />
                </div>
              </div>

              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: '180px' }}>Email Address</th>
                      <th style={{ width: '80px' }}>Role</th>
                      <th>Profile Name / Entity</th>
                      <th style={{ width: '120px' }}>City</th>
                      <th style={{ width: '115px', whiteSpace: 'nowrap' }}>Registration Date</th>
                      <th style={{ width: '115px', textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>
                          Loading user directory...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>
                          No matching user accounts.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        let roleBadge = <span className="badge badge-primary">VOLUNTEER</span>;
                        let profileName = u.profile ? u.profile.fullName || u.profile.orgName : 'N/A';
                        let city = u.profile ? u.profile.city || 'N/A' : '-';

                        if (u.role === 'admin') {
                          roleBadge = (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: 800
                              }}
                            >
                              ADMIN
                            </span>
                          );
                          profileName = 'Platform Superuser';
                          city = 'National';
                        } else if (u.role === 'ngo') {
                          roleBadge = (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: 800
                              }}
                            >
                              NGO
                            </span>
                          );
                        }

                        const createdDate = new Date(u.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        });

                        const isSelf = currentUser && (currentUser._id === u._id || currentUser.id === u._id);

                        return (
                          <tr key={u._id}>
                            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.email}</td>
                            <td>{roleBadge}</td>
                            <td>{profileName}</td>
                            <td>{city}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{createdDate}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                              {isSelf ? (
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', fontWeight: 600 }}>
                                  Active Session
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u._id, u.email)}
                                  className="btn btn-sm btn-danger"
                                  style={{ whiteSpace: 'nowrap' }}
                                >
                                  Delete User
                                </button>
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
          )}
          {activeTab === 'ngos' && (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <h2>Registered Partner Organizations</h2>
                <p>Official NGOs registered for social-service and community drives.</p>
              </div>

              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Organization Name</th>
                      <th>Govt Registration Number</th>
                      <th>Contact Person</th>
                      <th>Contact Phone</th>
                      <th>City / Region</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>
                          Loading partner NGOs...
                        </td>
                      </tr>
                    ) : ngoUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>
                          No partner NGOs found.
                        </td>
                      </tr>
                    ) : (
                      ngoUsers.map((u) => {
                        const p = u.profile || {};
                        return (
                          <tr key={u._id}>
                            <td>
                              <strong>{p.orgName || 'N/A'}</strong>
                              <br />
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{u.email}</span>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e40af' }}>
                                {p.registrationNumber || 'N/A'}
                              </span>
                            </td>
                            <td>{p.contactPerson || 'N/A'}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{p.phone || 'N/A'}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{p.city || 'N/A'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'tasks' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.55rem', marginBottom: '0.25rem' }}>All Community Tasks (Global Oversight)</h2>
                  <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)', marginBottom: 0 }}>
                    Review, moderate, or remove tasks published by partner NGOs.
                  </p>
                </div>
                <div>
                  <select
                    value={taskCategoryFilter}
                    onChange={(e) => setTaskCategoryFilter(e.target.value)}
                    className="form-control"
                    style={{ width: '250px', fontSize: '0.95rem', padding: '0.65rem 1rem' }}
                  >
                    <option value="All">All Categories</option>
                    <option value="Education">Education</option>
                    <option value="Food distribution">Food distribution</option>
                    <option value="Environment">Environment</option>
                    <option value="Elder support">Elder support</option>
                    <option value="Disaster support">Disaster support</option>
                    <option value="Community service">Community service</option>
                  </select>
                </div>
              </div>

              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th style={{ width: '130px' }}>Category</th>
                      <th>Organizer NGO</th>
                      <th style={{ width: '110px' }}>City</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Volunteers</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                      <th style={{ width: '110px', textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>
                          Loading tasks...
                        </td>
                      </tr>
                    ) : filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>
                          No tasks match the filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => {
                        let statusBadge = 'badge-open';
                        if (task.status === 'Completed') statusBadge = 'badge-completed';
                        if (task.status === 'In Progress') statusBadge = 'badge-assigned';
                        if (task.status === 'Cancelled') statusBadge = 'badge-danger';

                        const ngoName =
                          task.createdBy && task.createdBy.orgName ? task.createdBy.orgName : 'Community NGO';

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
                            <td>{ngoName}</td>
                            <td>{task.city}</td>
                            <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                              {task.volunteersAssigned || 0} / {task.volunteersRequired}
                            </td>
                            <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                              <span className={`badge ${statusBadge}`}>[{task.status.toUpperCase()}]</span>
                            </td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                              <select
                                value=""
                                onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                                className="form-control"
                                style={{
                                  width: 'auto',
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.8rem',
                                  display: 'inline-block'
                                }}
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
                                onClick={() => handleDeleteTask(task._id, task.title)}
                                className="btn btn-sm btn-danger"
                                style={{ marginLeft: '0.3rem' }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'system' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h2>System Diagnostics & Database Health</h2>
                <p>Real-time server parameters and database connection monitoring.</p>
              </div>

              <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div className="card">
                  <h3>Backend Server Status</h3>
                  <table style={{ width: '100%', fontSize: '0.9rem', marginTop: '1rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '0.4rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Runtime Environment:
                        </td>
                        <td style={{ padding: '0.4rem 0', fontFamily: 'monospace' }}>
                          {system.nodeVersion || 'Node.js'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.4rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Host Platform:
                        </td>
                        <td style={{ padding: '0.4rem 0', fontFamily: 'monospace' }}>
                          {system.platform || 'Windows'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.4rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Server Uptime:
                        </td>
                        <td style={{ padding: '0.4rem 0' }}>{system.uptimeSeconds || 0} seconds</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.4rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Service Status:
                        </td>
                        <td style={{ padding: '0.4rem 0' }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: '#059669',
                              color: '#ffffff',
                              border: 'none',
                              fontWeight: 700
                            }}
                          >
                            OPERATIONAL
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="card">
                  <h3>MongoDB Database Connection</h3>
                  <table style={{ width: '100%', fontSize: '0.9rem', marginTop: '1rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '0.4rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Database Name:
                        </td>
                        <td style={{ padding: '0.4rem 0', fontFamily: 'monospace' }}>community_help_hub</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.4rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Host Connection:
                        </td>
                        <td style={{ padding: '0.4rem 0', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          MongoDB Atlas Cluster
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.4rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Total Applications:
                        </td>
                        <td style={{ padding: '0.4rem 0', fontWeight: 700 }}>
                          {metrics.totalApplications || 0}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.4rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Certificates Generated:
                        </td>
                        <td style={{ padding: '0.4rem 0', fontWeight: 700 }}>
                          {metrics.totalCertificates || 0}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
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
