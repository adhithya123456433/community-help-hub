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

document.addEventListener('DOMContentLoaded', () => {
  // Check if Volunteer Dashboard is loaded
  if (document.getElementById('volunteer-dashboard-view')) {
    loadVolunteerDashboard();
  }

  // Check if NGO Dashboard is loaded
  if (document.getElementById('ngo-dashboard-view')) {
    loadNGODashboard();
  }

  // Check if Impact Dashboard is loaded
  if (document.getElementById('impact-dashboard-view')) {
    loadImpactDashboard();
  }

  // Check if Volunteer My Tasks page is loaded
  if (document.getElementById('my-tasks-view')) {
    loadVolunteerMyTasks();
  }

  // Check if Admin Dashboard is loaded
  if (document.getElementById('admin-dashboard-view')) {
    loadAdminDashboard();
  }
});

// 1. Load Volunteer Dashboard
async function loadVolunteerDashboard() {
  if (!isLoggedIn() || getUserRole() !== 'volunteer') {
    showToast('Access restricted: Please log in as a volunteer.', 'error');
    setTimeout(() => { window.location.href = '/login.html'; }, 1500);
    return;
  }

  const res = await apiRequest('/dashboard/volunteer', 'GET');
  if (!res.ok || !res.data.success) {
    showAlert('Failed to load volunteer dashboard data', 'danger');
    return;
  }

  const { stats, activeAssignments, certificates } = res.data;

  // Populate Stats
  document.getElementById('stat-completed').innerText = stats.totalTasksCompleted;
  document.getElementById('stat-active').innerText = stats.activeAssignmentsCount;
  document.getElementById('stat-hours').innerText = `${stats.totalHours} Hrs`;
  document.getElementById('stat-rank').innerText = `#${stats.rank}`;
  document.getElementById('stat-points').innerText = `${stats.rankingPoints} Pts`;

  if (document.getElementById('volunteer-name-header')) {
    document.getElementById('volunteer-name-header').innerText = `Welcome, ${stats.fullName}`;
    document.getElementById('volunteer-sub-header').innerText = `Location: ${stats.city} | Active Community Contributor`;
  }

  // Populate Volunteer Profile Card & Skills
  if (document.getElementById('volunteer-profile-name')) {
    document.getElementById('volunteer-profile-name').innerText = stats.fullName;
  }
  if (document.getElementById('volunteer-profile-meta')) {
    document.getElementById('volunteer-profile-meta').innerText = `Registered City: ${stats.city} | Contributor ID: Active | Verified Hours: ${stats.totalHours} Hrs`;
  }
  if (document.getElementById('volunteer-tier-badge')) {
    let tierBadgeHtml = '<span class="badge" style="background-color: #fef3c7; color: #92400e; border: 1.5px solid #fde68a; font-size: 0.88rem; padding: 0.4rem 0.85rem;">[BRONZE TIER]</span>';
    if (stats.rankingPoints >= 40) {
      tierBadgeHtml = '<span class="badge" style="background-color: #e2e8f0; color: #1e293b; border: 1.5px solid #cbd5e1; font-size: 0.88rem; padding: 0.4rem 0.85rem;">[SILVER TIER]</span>';
    }
    if (stats.rankingPoints >= 80) {
      tierBadgeHtml = '<span class="badge" style="background-color: #fef08a; color: #854d0e; border: 1.5px solid #eab308; font-size: 0.88rem; padding: 0.4rem 0.85rem;">[GOLD CHAMPION]</span>';
    }
    document.getElementById('volunteer-tier-badge').innerHTML = tierBadgeHtml;
  }

  const skillsContainer = document.getElementById('volunteer-skills-container');
  if (skillsContainer) {
    if (stats.skills && stats.skills.length > 0) {
      skillsContainer.innerHTML = stats.skills
        .map((s) => `<span class="badge badge-skill" style="font-size: 0.88rem; padding: 0.35rem 0.75rem;">${s}</span>`)
        .join(' ');
    } else {
      skillsContainer.innerHTML = `<span style="color: var(--text-light); font-size: 0.88rem;">General volunteer assistance; no specialized technical skills registered.</span>`;
    }
  }

  // Render Active Assignments Table
  const assignmentsTbody = document.getElementById('active-assignments-tbody');
  if (assignmentsTbody) {
    if (activeAssignments.length === 0) {
      assignmentsTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-light); padding: 1.5rem;">
            No active assignments. Explore tasks to apply for opportunities.
          </td>
        </tr>
      `;
    } else {
      assignmentsTbody.innerHTML = activeAssignments
        .map((app) => {
          const task = app.taskId || {};
          let statusBadgeClass = 'badge-open';
          if (app.status === 'Assigned') statusBadgeClass = 'badge-assigned';
          if (app.status === 'Completed') statusBadgeClass = 'badge-completed';

          const formattedDate = task.dateTime
            ? new Date(task.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'TBD';

          return `
            <tr>
              <td><strong><a href="/task-details.html?id=${task._id}">${task.title || 'Task Details'}</a></strong></td>
              <td><span class="badge ${getCategoryBadgeClass(task.category)}">${task.category || 'General'}</span></td>
              <td>${task.city || 'Local'}</td>
              <td>${app.notes ? `<em style="color: var(--text-main); font-size: 0.88rem;">"${app.notes}"</em>` : '<span style="color: var(--text-light); font-size: 0.82rem;">(Standard Application)</span>'}</td>
              <td>${formattedDate}</td>
              <td><span class="badge ${statusBadgeClass}">[${app.status.toUpperCase()}]</span></td>
            </tr>
          `;
        })
        .join('');
    }
  }

  // Render Certificates List
  const certContainer = document.getElementById('certificates-list');
  if (certContainer) {
    if (certificates.length === 0) {
      certContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: 2rem; color: var(--text-light);">
          No certificates earned yet. Complete your assigned tasks to generate verified PDF certificates.
        </div>
      `;
    } else {
      certContainer.innerHTML = certificates
        .map((cert) => {
          const task = cert.taskId || {};
          const ngo = cert.ngoId || {};
          const formattedDate = new Date(cert.issueDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });

          return `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <div>
                <span class="badge badge-primary" style="margin-bottom: 0.35rem;">[VERIFIED CERTIFICATE]</span>
                <h4 style="margin: 0.2rem 0;">${task.title || 'Community Service Activity'}</h4>
                <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 0;">
                  Issued by: <strong>${ngo.orgName || 'NGO Partner'}</strong> | Date: ${formattedDate} | Hours: ${cert.hoursCompleted} Hrs
                </p>
                <div style="font-size: 0.78rem; color: var(--text-light); margin-top: 0.2rem;">ID: ${cert.certificateId}</div>
              </div>
              <div>
                <a href="/api/certificates/download/${cert._id}" target="_blank" class="btn btn-outline btn-sm">
                  Download PDF
                </a>
              </div>
            </div>
          `;
        })
        .join('');
    }
  }
}

// 2. Load NGO Dashboard
async function loadNGODashboard() {
  if (!isLoggedIn() || getUserRole() !== 'ngo') {
    showToast('Access restricted: Please log in as an authorized NGO.', 'error');
    setTimeout(() => { window.location.href = '/login.html'; }, 1500);
    return;
  }

  const res = await apiRequest('/dashboard/ngo', 'GET');
  if (!res.ok || !res.data.success) {
    showAlert('Failed to load NGO dashboard data', 'danger');
    return;
  }

  const { ngo, stats, tasks } = res.data;

  // Populate Stats
  document.getElementById('stat-created').innerText = stats.totalTasksCreated;
  document.getElementById('stat-active-tasks').innerText = stats.activeTasks;
  document.getElementById('stat-completed-tasks').innerText = stats.completedTasks;
  document.getElementById('stat-applications').innerText = stats.totalApplicationsReceived;
  document.getElementById('stat-assigned-vols').innerText = stats.assignedVolunteersCount;

  if (document.getElementById('ngo-header-title')) {
    document.getElementById('ngo-header-title').innerText = ngo.orgName;
    document.getElementById('ngo-header-sub').innerText = `Registration: ${ngo.registrationNumber} | City: ${ngo.city}`;
  }

  // Render NGO Tasks Table
  const tasksTbody = document.getElementById('ngo-tasks-tbody');
  if (tasksTbody) {
    if (tasks.length === 0) {
      tasksTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-light); padding: 1.5rem;">
            No tasks published yet. Click "Create Task" to post your first opportunity.
          </td>
        </tr>
      `;
    } else {
      tasksTbody.innerHTML = tasks
        .map((task) => {
          let statusBadge = 'badge-open';
          if (task.status === 'Completed') statusBadge = 'badge-completed';
          if (task.status === 'In Progress') statusBadge = 'badge-assigned';

          const formattedDate = new Date(task.dateTime).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          return `
            <tr>
              <td><strong>${task.title}</strong></td>
              <td><span class="badge ${getCategoryBadgeClass(task.category)}">${task.category}</span></td>
              <td>${formattedDate}</td>
              <td>${task.volunteersAssigned || 0} / ${task.volunteersRequired}</td>
              <td><span class="badge ${statusBadge}">[${task.status.toUpperCase()}]</span></td>
              <td style="white-space: nowrap;">
                <button onclick="openEditTaskModal('${task._id}')" class="btn btn-sm btn-outline" style="margin-right: 0.3rem;">Edit</button>
                <select onchange="updateTaskStatus('${task._id}', this.value)" class="form-control" style="width: auto; padding: 0.25rem 0.5rem; font-size: 0.8rem; display: inline-block;">
                  <option value="" disabled selected>Status: ${task.status}</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button onclick="deleteTask('${task._id}')" class="btn btn-sm btn-danger" style="margin-left: 0.3rem;">Delete</button>
              </td>
            </tr>
          `;
        })
        .join('');
    }
  }

  // Bind Edit Task Form submit if present
  const editForm = document.getElementById('edit-task-form');
  if (editForm && !editForm.dataset.bound) {
    editForm.dataset.bound = 'true';
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const taskId = document.getElementById('edit-task-id').value;
      const title = document.getElementById('edit-task-title').value.trim();
      const category = document.getElementById('edit-task-category').value;
      const status = document.getElementById('edit-task-status').value;
      const description = document.getElementById('edit-task-desc').value.trim();
      const location = document.getElementById('edit-task-location').value.trim();
      const city = document.getElementById('edit-task-city').value.trim();
      const hours = Number(document.getElementById('edit-task-hours').value);
      const volunteersRequired = Number(document.getElementById('edit-task-volunteers').value);
      const requiredSkills = document.getElementById('edit-task-skills').value.trim();

      const res = await apiRequest(`/tasks/${taskId}`, 'PUT', {
        title,
        category,
        status,
        description,
        location,
        city,
        hours,
        volunteersRequired,
        requiredSkills
      });

      if (res.ok && res.data.success) {
        showToast('Task updated successfully!', 'success');
        closeEditTaskModal();
        loadNGODashboard();
      } else {
        const alertBox = document.getElementById('modal-alert-container');
        if (alertBox) {
          alertBox.innerHTML = `<div class="alert alert-danger">${res.data.message || 'Failed to update task'}</div>`;
        } else {
          showToast(res.data.message || 'Failed to update task', 'error');
        }
      }
    });
  }

  // Load Volunteer Applications for this NGO
  loadNGOApplications();
}

// Open Edit Task Modal
async function openEditTaskModal(taskId) {
  const modal = document.getElementById('edit-task-modal');
  if (!modal) return;

  const res = await apiRequest(`/tasks/${taskId}`, 'GET');
  if (!res.ok || !res.data.success) {
    showToast(res.data.message || 'Failed to fetch task details', 'error');
    return;
  }

  const task = res.data.task;
  document.getElementById('edit-task-id').value = task._id;
  document.getElementById('edit-task-title').value = task.title;
  document.getElementById('edit-task-category').value = task.category;
  document.getElementById('edit-task-status').value = task.status;
  document.getElementById('edit-task-desc').value = task.description;
  document.getElementById('edit-task-location').value = task.location;
  document.getElementById('edit-task-city').value = task.city;
  document.getElementById('edit-task-hours').value = task.hours || 3;
  document.getElementById('edit-task-volunteers').value = task.volunteersRequired;
  document.getElementById('edit-task-skills').value = (task.requiredSkills || []).join(', ');

  const alertBox = document.getElementById('modal-alert-container');
  if (alertBox) alertBox.innerHTML = '';

  modal.style.display = 'flex';
}

// Close Edit Task Modal
function closeEditTaskModal() {
  const modal = document.getElementById('edit-task-modal');
  if (modal) modal.style.display = 'none';
}

// Update task status (NGO action)
async function updateTaskStatus(taskId, status) {
  if (!status) return;
  const res = await apiRequest(`/tasks/${taskId}`, 'PUT', { status });
  if (res.ok && res.data.success) {
    showToast(`Task status updated to ${status}`, 'success');
    loadNGODashboard();
  } else {
    showToast(res.data.message || 'Failed to update task status', 'error');
  }
}

// Delete task (NGO action)
async function deleteTask(taskId) {
  const confirmed = await showConfirmModal(
    'Delete Community Drive',
    'Are you sure you want to delete this task? This action cannot be undone.',
    'Delete Task',
    true
  );
  if (!confirmed) return;

  const res = await apiRequest(`/tasks/${taskId}`, 'DELETE');
  if (res.ok && res.data.success) {
    showToast('Task deleted successfully', 'success');
    loadNGODashboard();
  } else {
    showToast(res.data.message || 'Failed to delete task', 'error');
  }
}

// Load NGO Applications List
async function loadNGOApplications() {
  const tbody = document.getElementById('ngo-applications-tbody');
  if (!tbody) return;

  const res = await apiRequest('/applications/ngo/all', 'GET');
  if (!res.ok || !res.data.success) return;

  const applications = res.data.applications || [];

  if (applications.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-light); padding: 1.5rem;">
          No volunteer applications received yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = applications
    .map((app) => {
      const vol = app.volunteerId || {};
      const task = app.taskId || {};

      let statusBadge = 'badge-open';
      if (app.status === 'Assigned') statusBadge = 'badge-assigned';
      if (app.status === 'Completed') statusBadge = 'badge-completed';
      if (app.status === 'Rejected') statusBadge = 'badge-danger';

      const appliedDate = app.appliedAt
        ? new Date(app.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        : 'Recent';

      const volunteerSkillsHtml = (vol.skills && vol.skills.length > 0)
        ? vol.skills.map((s) => `<span class="badge badge-skill">${s}</span>`).join(' ')
        : '<span style="color: var(--text-light); font-size: 0.8rem;">General Volunteer</span>';

      return `
        <tr>
          <td>
            <strong>${vol.fullName || 'Volunteer'}</strong><br>
            <span style="font-size: 0.78rem; color: var(--text-light);">${vol.phone || ''} | ${vol.city || ''}</span><br>
            <span style="font-size: 0.74rem; color: var(--primary); font-weight: 600;">Applied: ${appliedDate}</span>
          </td>
          <td>${task.title || 'Task'}</td>
          <td>${volunteerSkillsHtml}</td>
          <td>${app.notes ? `<em style="color: var(--text-main); font-size: 0.88rem;">"${app.notes}"</em>` : '<span style="color: var(--text-light); font-size: 0.82rem;">(Standard Application)</span>'}</td>
          <td><span class="badge ${statusBadge}">[${app.status.toUpperCase()}]</span></td>
          <td>
            ${
              app.status === 'Applied'
                ? `
                <button onclick="updateApplicationStatus('${app._id}', 'Assigned')" class="btn btn-primary btn-sm">Assign</button>
                <button onclick="updateApplicationStatus('${app._id}', 'Rejected')" class="btn btn-outline btn-sm" style="color: var(--danger); border-color: var(--danger); margin-left: 0.3rem;">Reject</button>
              `
                : app.status === 'Assigned'
                ? `
                <button onclick="updateApplicationStatus('${app._id}', 'Completed')" class="btn btn-sm btn-accent">Mark Completed (Issue Certificate)</button>
              `
                : `<span style="font-size: 0.82rem; color: var(--text-light);">Completed</span>`
            }
          </td>
        </tr>
      `;
    })
    .join('');
}

// Update application status (Assign, Reject, Complete)
async function updateApplicationStatus(appId, status) {
  const confirmMsg =
    status === 'Completed'
      ? 'Mark this volunteer task as Completed? This will award ranking points and generate an official PDF certificate.'
      : `Update application status to ${status}?`;

  const isDanger = (status === 'Rejected');
  const confirmed = await showConfirmModal('Update Application Status', confirmMsg, `Set as ${status}`, isDanger);
  if (!confirmed) return;

  const res = await apiRequest(`/applications/${appId}/status`, 'PUT', { status });
  if (res.ok && res.data.success) {
    showToast(`Status updated to ${status}`, 'success');
    loadNGODashboard();
  } else {
    showToast(res.data.message || 'Failed to update application status', 'error');
  }
}

// 3. Load Public Impact Dashboard & Chart.js Integration
async function loadImpactDashboard() {
  const res = await apiRequest('/dashboard/impact', 'GET');
  if (!res.ok || !res.data.success) return;

  const { metrics, categoryData, cityData } = res.data;

  // Render Metric Boxes
  document.getElementById('impact-volunteers').innerText = metrics.totalVolunteers;
  document.getElementById('impact-ngos').innerText = metrics.totalNGOs;
  document.getElementById('impact-tasks').innerText = metrics.totalTasks;
  document.getElementById('impact-hours').innerText = `${metrics.totalHoursServed} Hrs`;

  // Render Category Breakdown Chart using Chart.js
  const categoryCtx = document.getElementById('categoryImpactChart');
  if (categoryCtx && typeof Chart !== 'undefined') {
    const labels = categoryData.map((c) => c.category);
    const dataValues = categoryData.map((c) => c.count);

    new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: dataValues,
            backgroundColor: [
              '#2563eb', // Education - Blue
              '#ea580c', // Food distribution - Orange
              '#059669', // Environment - Emerald Green
              '#9333ea', // Elder support - Purple
              '#dc2626', // Disaster support - Crimson Red
              '#0d9488'  // Community service - Teal
            ],
            borderColor: '#ffffff',
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 14,
              font: { size: 13, weight: '600' },
              padding: 15
            }
          }
        }
      }
    });
  }

  // Render City Distribution Chart
  const cityCtx = document.getElementById('cityImpactChart');
  if (cityCtx && typeof Chart !== 'undefined') {
    const cityLabels = cityData.map((c) => c._id || 'Other');
    const cityCounts = cityData.map((c) => c.count);

    new Chart(cityCtx, {
      type: 'bar',
      data: {
        labels: cityLabels,
        datasets: [
          {
            label: 'Active Community Tasks',
            data: cityCounts,
            backgroundColor: '#059669',
            borderColor: '#047857',
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 12, weight: '600' } }
          },
          x: {
            ticks: { font: { size: 12, weight: '600' } }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // Load Volunteer Ranking Leaderboard
  loadLeaderboard();
}

// Load Leaderboard Table
async function loadLeaderboard() {
  const tbody = document.getElementById('leaderboard-tbody');
  if (!tbody) return;

  const res = await apiRequest('/dashboard/rankings', 'GET');
  if (!res.ok || !res.data.success) return;

  const rankings = res.data.rankings || [];

  if (rankings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-light); padding: 1.5rem;">
          No ranking records available yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rankings
    .map((vol, index) => {
      let tierBadge = '<span class="badge" style="background-color: #fef3c7; color: #92400e; border: 1.5px solid #fde68a;">[BRONZE TIER]</span>';
      if (vol.rankingPoints >= 40) {
        tierBadge = '<span class="badge" style="background-color: #e2e8f0; color: #1e293b; border: 1.5px solid #cbd5e1;">[SILVER TIER]</span>';
      }
      if (vol.rankingPoints >= 80) {
        tierBadge = '<span class="badge" style="background-color: #fef08a; color: #854d0e; border: 1.5px solid #eab308;">[GOLD CHAMPION]</span>';
      }

      return `
        <tr>
          <td><strong style="color: var(--primary); font-size: 1.05rem;">#${index + 1}</strong></td>
          <td>
            <strong style="color: var(--text-main); font-size: 0.98rem;">${vol.fullName}</strong> 
            <span style="font-size: 0.82rem; color: var(--text-light);">(${vol.city})</span>
            <div style="margin-top: 0.35rem; display: flex; flex-wrap: wrap; gap: 0.25rem;">
              ${(vol.skills || []).map((s) => `<span class="badge badge-skill" style="font-size: 0.72rem; padding: 0.15rem 0.45rem;">${s}</span>`).join('')}
            </div>
          </td>
          <td><span style="font-weight: 700; color: var(--secondary);">${vol.completedTasksCount}</span> Completed</td>
          <td><span style="font-weight: 700; color: var(--primary);">${vol.totalHours}</span> Hours Logged</td>
          <td>${tierBadge} <span style="font-weight: 800; color: var(--text-main); margin-left: 0.45rem;">${vol.rankingPoints} Pts</span></td>
        </tr>
      `;
    })
    .join('');
}

// 4. Load Volunteer My Tasks View
async function loadVolunteerMyTasks() {
  if (!isLoggedIn() || getUserRole() !== 'volunteer') {
    showToast('Access restricted: Volunteers only.', 'error');
    setTimeout(() => { window.location.href = '/login.html'; }, 1500);
    return;
  }

  const tbody = document.getElementById('my-tasks-tbody');
  if (!tbody) return;

  const res = await apiRequest('/applications/my-tasks', 'GET');
  if (!res.ok || !res.data.success) {
    showAlert('Failed to load my tasks', 'danger');
    return;
  }

  const applications = res.data.applications || [];

  if (applications.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-light); padding: 2rem;">
          You haven't applied for any tasks yet. <a href="/explore-tasks.html">Explore available opportunities</a>.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = applications
    .map((app) => {
      const task = app.taskId || {};
      const ngo = task.createdBy || {};

      let statusBadge = 'badge-open';
      if (app.status === 'Assigned') statusBadge = 'badge-assigned';
      if (app.status === 'Completed') statusBadge = 'badge-completed';
      if (app.status === 'Rejected') statusBadge = 'badge-danger';

      const formattedDate = task.dateTime
        ? new Date(task.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'TBD';

      return `
        <tr>
          <td><strong><a href="/task-details.html?id=${task._id}">${task.title || 'Task Details'}</a></strong></td>
          <td><span class="badge ${getCategoryBadgeClass(task.category)}">${task.category || 'General'}</span></td>
          <td>${ngo.orgName || 'NGO Partner'}</td>
          <td>${app.notes ? `<em style="color: var(--text-main); font-size: 0.88rem;">"${app.notes}"</em>` : '<span style="color: var(--text-light); font-size: 0.82rem;">(Standard Application)</span>'}</td>
          <td>${formattedDate} (${task.hours || 3} Hrs)</td>
          <td><span class="badge ${statusBadge}">[${app.status.toUpperCase()}]</span></td>
          <td>
            <a href="/task-details.html?id=${task._id}" class="btn btn-outline btn-sm">View Task</a>
          </td>
        </tr>
      `;
    })
    .join('');
}

// ==============================================================
// 5. SYSTEM ADMINISTRATOR PORTAL FUNCTIONS
// ==============================================================

let cachedAdminUsers = [];
let cachedAdminTasks = [];

async function loadAdminDashboard() {
  if (!isLoggedIn() || getUserRole() !== 'admin') {
    showToast('Access restricted: System Administrators only.', 'error');
    setTimeout(() => { window.location.href = '/login.html'; }, 1500);
    return;
  }

  // Load Overview & Metrics
  const res = await apiRequest('/admin/overview', 'GET');
  if (res.ok && res.data.success) {
    const { metrics, system } = res.data;
    document.getElementById('admin-stat-users').innerText = metrics.totalUsers;
    document.getElementById('admin-stat-ngos').innerText = metrics.totalNGOs;
    document.getElementById('admin-stat-vols').innerText = metrics.totalVolunteers;
    document.getElementById('admin-stat-tasks').innerText = metrics.totalTasks;
    document.getElementById('admin-stat-hours').innerText = `${metrics.totalHours}`;

    // System Diagnostics
    if (document.getElementById('diag-node')) document.getElementById('diag-node').innerText = system.nodeVersion;
    if (document.getElementById('diag-platform')) document.getElementById('diag-platform').innerText = system.platform;
    if (document.getElementById('diag-uptime')) document.getElementById('diag-uptime').innerText = `${system.uptimeSeconds} seconds`;
    if (document.getElementById('diag-apps')) document.getElementById('diag-apps').innerText = metrics.totalApplications;
    if (document.getElementById('diag-certs')) document.getElementById('diag-certs').innerText = metrics.totalCertificates;
  }

  // Load Users Directory
  loadAdminUsers();

  // Load Tasks
  loadAdminTasks();
}

// Switch between Admin Tabs
function switchAdminTab(tabName) {
  const tabs = document.querySelectorAll('.admin-tab');
  tabs.forEach((t) => t.classList.remove('active'));

  const activeTabBtn = document.querySelector(`.admin-tab[data-tab="${tabName}"]`);
  if (activeTabBtn) activeTabBtn.classList.add('active');

  const panels = ['users', 'ngos', 'tasks', 'system'];
  panels.forEach((p) => {
    const el = document.getElementById(`admin-panel-${p}`);
    if (el) el.style.display = p === tabName ? 'block' : 'none';
  });
}

// Load and Render Users Directory
async function loadAdminUsers() {
  const tbody = document.getElementById('admin-users-tbody');
  const ngosTbody = document.getElementById('admin-ngos-tbody');
  if (!tbody) return;

  const res = await apiRequest('/admin/users', 'GET');
  if (!res.ok || !res.data.success) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger); padding: 1.5rem;">Failed to load user records.</td></tr>`;
    return;
  }

  cachedAdminUsers = res.data.users || [];
  renderAdminUsersTable(cachedAdminUsers);

  // Filter and Render NGOs table
  if (ngosTbody) {
    const ngos = cachedAdminUsers.filter((u) => u.role === 'ngo' && u.profile);
    if (ngos.length === 0) {
      ngosTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-light); padding: 1.5rem;">No partner NGOs found.</td></tr>`;
    } else {
      ngosTbody.innerHTML = ngos
        .map((u) => {
          const p = u.profile || {};
          return `
            <tr>
              <td><strong>${p.orgName || 'N/A'}</strong><br><span style="font-size: 0.8rem; color: var(--text-light);">${u.email}</span></td>
              <td><span style="font-family: monospace; font-weight: 700; color: #1e40af;">${p.registrationNumber || 'N/A'}</span></td>
              <td>${p.contactPerson || 'N/A'}</td>
              <td style="white-space: nowrap;">${p.phone || 'N/A'}</td>
              <td style="white-space: nowrap;">${p.city || 'N/A'}</td>
            </tr>
          `;
        })
        .join('');
    }
  }
}

// Render Admin Users Table
function renderAdminUsersTable(users) {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-light); padding: 2rem;">No matching user accounts.</td></tr>`;
    return;
  }

  const currentUser = getCurrentUser();

  tbody.innerHTML = users
    .map((u) => {
      let roleBadge = '<span class="badge badge-primary">VOLUNTEER</span>';
      let profileName = u.profile ? (u.profile.fullName || u.profile.orgName) : 'N/A';
      let city = u.profile ? (u.profile.city || 'N/A') : '-';

      if (u.role === 'admin') {
        roleBadge = '<span class="badge" style="background-color: #fee2e2; color: #991b1b; border: 1.5px solid #f87171; font-weight: 800;">ADMIN</span>';
        profileName = 'Platform Superuser';
        city = 'National';
      } else if (u.role === 'ngo') {
        roleBadge = '<span class="badge" style="background-color: #eff6ff; color: #1d4ed8; border: 1.5px solid #93c5fd; font-weight: 800;">NGO</span>';
      }

      const createdDate = new Date(u.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const isSelf = currentUser && currentUser.id === u._id;

      return `
        <tr>
          <td style="font-weight: 600; color: var(--text-main);">${u.email}</td>
          <td>${roleBadge}</td>
          <td>${profileName}</td>
          <td>${city}</td>
          <td style="white-space: nowrap;">${createdDate}</td>
          <td style="white-space: nowrap; text-align: right;">
            ${
              isSelf
                ? '<span style="font-size: 0.82rem; color: var(--text-light); font-weight: 600;">Active Session</span>'
                : `<button onclick="deleteUserByAdmin('${u._id}', '${u.email}')" class="btn btn-sm btn-danger" style="white-space: nowrap;">Delete User</button>`
            }
          </td>
        </tr>
      `;
    })
    .join('');
}

// Real-time filter for Admin Users Table
function filterAdminUsers() {
  const query = document.getElementById('admin-user-search').value.toLowerCase().trim();
  if (!query) {
    renderAdminUsersTable(cachedAdminUsers);
    return;
  }

  const filtered = cachedAdminUsers.filter((u) => {
    const emailMatch = u.email.toLowerCase().includes(query);
    const roleMatch = u.role.toLowerCase().includes(query);
    const nameMatch = u.profile && (u.profile.fullName || u.profile.orgName || '').toLowerCase().includes(query);
    const cityMatch = u.profile && (u.profile.city || '').toLowerCase().includes(query);
    return emailMatch || roleMatch || nameMatch || cityMatch;
  });

  renderAdminUsersTable(filtered);
}

// Delete User by Admin
async function deleteUserByAdmin(userId, email) {
  const confirmed = await showConfirmModal(
    'Delete User Account',
    `Are you sure you want to permanently delete user account: ${email}? All associated volunteer/NGO records and tasks will be removed.`,
    'Delete Account',
    true
  );
  if (!confirmed) return;

  const res = await apiRequest(`/admin/users/${userId}`, 'DELETE');
  if (res.ok && res.data.success) {
    showToast(res.data.message || 'User deleted successfully', 'success');
    loadAdminDashboard();
  } else {
    showToast(res.data.message || 'Failed to delete user', 'error');
  }
}

// Load All Tasks for Admin
async function loadAdminTasks() {
  const tbody = document.getElementById('admin-tasks-tbody');
  if (!tbody) return;

  const res = await apiRequest('/admin/tasks', 'GET');
  if (!res.ok || !res.data.success) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger); padding: 1.5rem;">Failed to load tasks.</td></tr>`;
    return;
  }

  cachedAdminTasks = res.data.tasks || [];
  renderAdminTasksTable(cachedAdminTasks);
}

// Render Admin Tasks Table
function renderAdminTasksTable(tasks) {
  const tbody = document.getElementById('admin-tasks-tbody');
  if (!tbody) return;

  if (tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-light); padding: 2rem;">No tasks published.</td></tr>`;
    return;
  }

  tbody.innerHTML = tasks
    .map((task) => {
      let statusBadge = 'badge-open';
      if (task.status === 'Completed') statusBadge = 'badge-completed';
      if (task.status === 'In Progress') statusBadge = 'badge-assigned';
      if (task.status === 'Cancelled') statusBadge = 'badge-danger';

      const ngoName = task.createdBy && task.createdBy.orgName ? task.createdBy.orgName : 'Community NGO';

      return `
        <tr>
          <td><strong><a href="/task-details.html?id=${task._id}" target="_blank">${task.title}</a></strong></td>
          <td><span class="badge ${getCategoryBadgeClass(task.category)}">${task.category}</span></td>
          <td>${ngoName}</td>
          <td>${task.city}</td>
          <td style="text-align: center; white-space: nowrap;">${task.volunteersAssigned || 0} / ${task.volunteersRequired}</td>
          <td style="text-align: center; white-space: nowrap;"><span class="badge ${statusBadge}">[${task.status.toUpperCase()}]</span></td>
          <td style="white-space: nowrap; text-align: right;">
            <select onchange="updateTaskStatusByAdmin('${task._id}', this.value)" class="form-control" style="width: auto; padding: 0.25rem 0.5rem; font-size: 0.8rem; display: inline-block;">
              <option value="" disabled selected>Status: ${task.status}</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button onclick="deleteTaskByAdmin('${task._id}', '${task.title.replace(/'/g, "\\'")}')" class="btn btn-sm btn-danger" style="margin-left: 0.3rem;">Delete</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

// Filter Admin Tasks by Category
function filterAdminTasks() {
  const cat = document.getElementById('admin-task-category-filter').value;
  if (cat === 'All') {
    renderAdminTasksTable(cachedAdminTasks);
  } else {
    const filtered = cachedAdminTasks.filter((t) => t.category === cat);
    renderAdminTasksTable(filtered);
  }
}

// Delete Task by Admin
async function deleteTaskByAdmin(taskId, title) {
  const confirmed = await showConfirmModal(
    'Delete Task',
    `Are you sure you want to permanently delete task: "${title}"? All volunteer applications and certificates for this task will be removed.`,
    'Delete Task',
    true
  );
  if (!confirmed) return;

  const res = await apiRequest(`/admin/tasks/${taskId}`, 'DELETE');
  if (res.ok && res.data.success) {
    showToast(res.data.message || 'Task deleted successfully', 'success');
    loadAdminDashboard();
  } else {
    showToast(res.data.message || 'Failed to delete task', 'error');
  }
}

// Update Task Status by Admin
async function updateTaskStatusByAdmin(taskId, status) {
  const res = await apiRequest(`/admin/tasks/${taskId}/status`, 'PUT', { status });
  if (res.ok && res.data.success) {
    showToast(`Task status updated to ${status} by Administrator`, 'success');
    loadAdminTasks();
  } else {
    showToast(res.data.message || 'Failed to update task status', 'error');
  }
}
