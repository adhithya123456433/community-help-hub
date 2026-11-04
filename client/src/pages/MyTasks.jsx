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

export default function MyTasks() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    setLoading(true);
    const res = await apiRequest('/applications/my-tasks', 'GET');
    if (res.ok && res.data && res.data.success) {
      setApplications(res.data.applications || []);
    } else {
      showToast(res.data?.message || 'Failed to load my tasks', 'error');
    }
    setLoading(false);
  };

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <span className="badge badge-primary" style={{ marginBottom: '0.6rem' }}>TASK TRACKING</span>
          <h1>My Assigned Tasks & Status</h1>
          <p style={{ marginBottom: 0, fontSize: '1.1rem' }}>
            Monitor your active social-service commitments and review past completed volunteer activities.
          </p>
        </div>
      </section>
      <main style={{ padding: '2.75rem 0', flex: 1 }}>
        <div className="container">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Category</th>
                  <th>Organizing NGO</th>
                  <th>Application Note</th>
                  <th>Date & Commitment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>
                      Loading your assigned tasks...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>
                      You haven't applied for any tasks yet.{' '}
                      <Link to="/explore-tasks" style={{ fontWeight: 600 }}>
                        Explore available opportunities
                      </Link>
                      .
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => {
                    const task = app.taskId || {};
                    const ngo = task.createdBy || {};

                    let statusBadge = 'badge-open';
                    if (app.status === 'Assigned') statusBadge = 'badge-assigned';
                    if (app.status === 'Completed') statusBadge = 'badge-completed';
                    if (app.status === 'Rejected') statusBadge = 'badge-danger';

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
                        <td>{ngo.orgName || 'NGO Partner'}</td>
                        <td>
                          {app.notes ? (
                            <em style={{ color: 'var(--text-main)', fontSize: '0.88rem' }}>"{app.notes}"</em>
                          ) : (
                            <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>(Standard Application)</span>
                          )}
                        </td>
                        <td>{formattedDate} ({task.hours || 3} Hrs)</td>
                        <td>
                          <span className={`badge ${statusBadge}`}>[{app.status.toUpperCase()}]</span>
                        </td>
                        <td>
                          <Link to={`/tasks/${task._id}`} className="btn btn-outline btn-sm">
                            View Task
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
