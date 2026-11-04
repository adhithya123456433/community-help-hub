let currentFilter = {
  category: 'All',
  city: 'All',
  search: '',
  mode: 'all' // 'all', 'skills', 'location', 'ai'
};

document.addEventListener('DOMContentLoaded', () => {
  // Check if explore tasks page is active
  const tasksContainer = document.getElementById('tasks-grid');
  if (tasksContainer) {
    initExploreTasks();
  }

  // Check if create task form is active
  const createTaskForm = document.getElementById('create-task-form');
  if (createTaskForm) {
    initCreateTask();
  }

  // Check if single task details page is active
  const taskDetailsContainer = document.getElementById('task-details-view');
  if (taskDetailsContainer) {
    loadTaskDetails();
  }
});

// Initialize Explore Tasks View
function initExploreTasks() {
  loadTasks();

  // Category filter dropdown
  const categoryFilter = document.getElementById('filter-category');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      currentFilter.category = e.target.value;
      loadTasks();
    });
  }

  // City filter dropdown
  const cityFilter = document.getElementById('filter-city');
  if (cityFilter) {
    cityFilter.addEventListener('change', (e) => {
      currentFilter.city = e.target.value;
      loadTasks();
    });
  }

  // Search input with debouncing and Enter key handler
  const searchInput = document.getElementById('filter-search');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentFilter.search = e.target.value.trim();
        loadTasks();
      }, 250);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(debounceTimer);
        currentFilter.search = e.target.value.trim();
        loadTasks();
      }
    });
  }

  // Exploration Mode Tabs (All, Skill Match, Location Match, AI Recommendations)
  const modeTabs = document.querySelectorAll('.mode-tab');
  modeTabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      modeTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter.mode = tab.dataset.mode;

      // Handle matching modes requiring volunteer login
      if (['skills', 'location', 'ai'].includes(currentFilter.mode) && !isLoggedIn()) {
        const container = document.getElementById('tasks-grid');
        container.innerHTML = `
          <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 2.5rem;">
            <h3>Login Required for Matching</h3>
            <p>Please log in as a registered volunteer to view personalized skill matches and recommendations.</p>
            <a href="/login.html" class="btn btn-primary" style="margin-top: 0.5rem;">Login Now</a>
          </div>
        `;
        return;
      }

      loadTasks();
    });
  });
}

// Fetch and render tasks based on mode and active filters
async function loadTasks() {
  const container = document.getElementById('tasks-grid');
  if (!container) return;

  container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">Loading opportunities...</div>';

  let endpoint = '/tasks';

  // Choose endpoint depending on active mode
  if (currentFilter.mode === 'skills') {
    endpoint = '/tasks/matching/skills';
  } else if (currentFilter.mode === 'location') {
    endpoint = '/tasks/matching/location';
  } else if (currentFilter.mode === 'ai') {
    endpoint = '/tasks/recommendations/ai';
  } else {
    // Normal query with category, city, and search
    const params = new URLSearchParams();
    if (currentFilter.category !== 'All') params.append('category', currentFilter.category);
    if (currentFilter.city !== 'All') params.append('city', currentFilter.city);
    if (currentFilter.search) params.append('search', currentFilter.search);
    endpoint = `/tasks?${params.toString()}`;
  }

  const res = await apiRequest(endpoint, 'GET');

  if (!res.ok || !res.data.success) {
    container.innerHTML = `
      <div class="alert alert-danger" style="grid-column: 1 / -1;">
        ${res.data.message || 'Failed to fetch tasks'}
      </div>
    `;
    return;
  }

  let tasksToRender = [];

  if (currentFilter.mode === 'skills') {
    tasksToRender = res.data.tasks || [];
  } else if (currentFilter.mode === 'location') {
    tasksToRender = [...(res.data.localTasks || []), ...(res.data.otherTasks || [])];
  } else if (currentFilter.mode === 'ai') {
    tasksToRender = res.data.recommendations || [];
  } else {
    tasksToRender = res.data.tasks || [];
  }

  // Apply search and category filtering in matching modes client-side
  if (['skills', 'location', 'ai'].includes(currentFilter.mode)) {
    if (currentFilter.category !== 'All') {
      tasksToRender = tasksToRender.filter((t) => t.category === currentFilter.category);
    }
    if (currentFilter.city !== 'All') {
      tasksToRender = tasksToRender.filter((t) => (t.city || '').toLowerCase() === currentFilter.city.toLowerCase());
    }
    if (currentFilter.search) {
      const q = currentFilter.search.toLowerCase();
      tasksToRender = tasksToRender.filter((t) => {
        const titleMatch = (t.title || '').toLowerCase().includes(q);
        const descMatch = (t.description || '').toLowerCase().includes(q);
        const locMatch = (t.location || '').toLowerCase().includes(q);
        const cityMatch = (t.city || '').toLowerCase().includes(q);
        const catMatch = (t.category || '').toLowerCase().includes(q);
        const skillsMatch = (t.requiredSkills || []).some((s) => s.toLowerCase().includes(q));
        return titleMatch || descMatch || locMatch || cityMatch || catMatch || skillsMatch;
      });
    }
  }

  if (tasksToRender.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <h3>No Social Service Tasks Found</h3>
        <p>No community opportunities match your current filter selection. Try adjusting the category, city, or search keyword.</p>
      </div>
    `;
    return;
  }

  // Fetch volunteer applied tasks map if logged in as volunteer
  const appliedTaskMap = new Map();
  if (isLoggedIn() && getUserRole() === 'volunteer') {
    try {
      const myAppsRes = await apiRequest('/applications/my-tasks', 'GET');
      if (myAppsRes.ok && myAppsRes.data && Array.isArray(myAppsRes.data.applications)) {
        myAppsRes.data.applications.forEach((app) => {
          if (app.taskId) {
            const tId = app.taskId._id ? app.taskId._id.toString() : app.taskId.toString();
            appliedTaskMap.set(tId, app);
          }
        });
      }
    } catch (err) {
      // Non-blocking fallback
    }
  }

  let bannerHtml = '';
  if (currentFilter.mode === 'location' && res.data.volunteerCity) {
    bannerHtml = `
      <div class="card" style="grid-column: 1 / -1; background-color: #ecfdf5; border: 1.5px solid #059669; margin-bottom: 0.5rem; padding: 1rem 1.25rem;">
        <div style="font-weight: 800; color: #065f46; margin-bottom: 0.25rem; letter-spacing: 0.5px;">
          LOCATION MATCH ACTIVE FOR: ${res.data.volunteerCity.toUpperCase()}
        </div>
        <div style="font-size: 0.9rem; color: #047857;">
          Displaying <strong>${res.data.localCount || 0}</strong> drive(s) in your registered city first with <strong>[LOCAL MATCH: ${res.data.volunteerCity.toUpperCase()}]</strong>, followed by available community drives across other cities.
        </div>
      </div>
    `;
  } else if (currentFilter.mode === 'skills') {
    bannerHtml = `
      <div class="card" style="grid-column: 1 / -1; background-color: #eff6ff; border: 1.5px solid #3b82f6; margin-bottom: 0.5rem; padding: 1rem 1.25rem;">
        <div style="font-weight: 800; color: #1e40af; margin-bottom: 0.25rem; letter-spacing: 0.5px;">
          SKILL-BASED MATCHING ACTIVE
        </div>
        <div style="font-size: 0.9rem; color: #1d4ed8;">
          Tasks are ranked by matching your volunteer profile skills with task prerequisites.
        </div>
      </div>
    `;
  } else if (currentFilter.mode === 'ai') {
    bannerHtml = `
      <div class="card" style="grid-column: 1 / -1; background-color: #faf5ff; border: 1.5px solid #a855f7; margin-bottom: 0.5rem; padding: 1rem 1.25rem;">
        <div style="font-weight: 800; color: #6b21a8; margin-bottom: 0.25rem; letter-spacing: 0.5px;">
          AI TASK RECOMMENDATIONS ACTIVE
        </div>
        <div style="font-size: 0.9rem; color: #7e22ce;">
          Personalized ranking combining skills (40 pts), city location (30 pts), previous engagement (20 pts), and urgency (10 pts).
        </div>
      </div>
    `;
  }

  renderTaskCards(container, tasksToRender, bannerHtml, appliedTaskMap);
}

// Helper function to return category badge class
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

// Render task cards HTML
function renderTaskCards(container, tasks, bannerHtml = '', appliedTaskMap = new Map()) {
  const cardsHtml = tasks
    .map((task) => {
      const skillsHtml = (task.requiredSkills || [])
        .map((skill) => `<span class="badge badge-skill">${skill}</span>`)
        .join(' ');

      const formattedDate = new Date(task.dateTime).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const ngoName = task.createdBy && task.createdBy.orgName ? task.createdBy.orgName : 'Community Partner';

      let matchBadgeHtml = '';
      if (typeof task.isLocalMatch !== 'undefined') {
        if (task.isLocalMatch) {
          matchBadgeHtml = `<span class="badge" style="margin-bottom: 0.5rem; background-color: #ecfdf5; color: #047857; border: 1.5px solid #047857; font-weight: 800;">[LOCAL MATCH: ${task.city.toUpperCase()}]</span>`;
        } else {
          matchBadgeHtml = `<span class="badge" style="margin-bottom: 0.5rem; background-color: #f8fafc; color: #64748b; border: 1px solid #cbd5e1; font-weight: 600;">[OTHER CITY: ${task.city.toUpperCase()}]</span>`;
        }
      } else if (typeof task.matchScore !== 'undefined') {
        matchBadgeHtml = `<span class="badge badge-primary" style="margin-bottom: 0.5rem; background-color: #ecfdf5; color: #047857; border-color: #a7f3d0;">[${task.matchScore}% SKILL MATCH]</span>`;
      } else if (typeof task.recommendationScore !== 'undefined') {
        matchBadgeHtml = `<span class="badge badge-primary" style="margin-bottom: 0.5rem; background-color: #eff6ff; color: #1d4ed8; border-color: #bfdbfe;">[RECOMMENDED: ${task.recommendationScore} PTS]</span>`;
      }

      const catBadgeClass = getCategoryBadgeClass(task.category);
      const isAlreadyApplied = appliedTaskMap.has(task._id.toString());
      const existingApp = isAlreadyApplied ? appliedTaskMap.get(task._id.toString()) : null;

      let appliedBadgeHtml = '';
      if (isAlreadyApplied) {
        appliedBadgeHtml = `<span class="badge badge-assigned" style="margin-bottom: 0.5rem; font-weight: 800;">[APPLIED: ${existingApp.status.toUpperCase()}]</span>`;
      }

      return `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid var(--primary);">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.65rem; gap: 0.5rem;">
              <span class="badge ${catBadgeClass}">${task.category}</span>
              <span class="badge badge-open">[${task.status.toUpperCase()}]</span>
            </div>

            ${appliedBadgeHtml || matchBadgeHtml}

            <h3 style="margin-top: 0.25rem;">
              <a href="/task-details.html?id=${task._id}" style="color: var(--text-main); font-weight: 800;">${task.title}</a>
            </h3>

            <p style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 0.6rem;">
              Organized by: <strong style="color: var(--primary-dark); font-weight: 700;">${ngoName}</strong>
            </p>

            <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.55; margin-bottom: 0.85rem;">
              ${task.description.length > 120 ? task.description.slice(0, 120) + '...' : task.description}
            </p>

            <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.85rem; display: flex; flex-direction: column; gap: 0.35rem; background: #f8fafc; padding: 0.75rem 0.9rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <div><strong>Location:</strong> <span style="color: var(--text-main);">${task.location}, ${task.city}</span></div>
              <div><strong>Schedule:</strong> <span style="color: var(--text-main);">${formattedDate} (${task.hours} Hours)</span></div>
              <div><strong>Volunteers:</strong> <span style="color: var(--primary); font-weight: 700;">${task.volunteersAssigned || 0} / ${task.volunteersRequired} Filled</span></div>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1.1rem;">
              ${skillsHtml}
            </div>
          </div>

          <div style="border-top: 1.5px solid var(--border-color); padding-top: 0.95rem; display: flex; justify-content: space-between; align-items: center;">
            <a href="/task-details.html?id=${task._id}" class="btn btn-outline btn-sm">View Details</a>
            ${
              isAlreadyApplied
                ? `<a href="/task-details.html?id=${task._id}" class="btn btn-outline btn-sm" style="color: var(--primary); border-color: var(--primary); font-weight: 700;">Applied (${existingApp.status})</a>`
                : `<button onclick="quickApply('${task._id}')" class="btn btn-primary btn-sm">Apply for Task</button>`
            }
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = bannerHtml + cardsHtml;
}

// Quick apply handler from task cards and detail page
async function quickApply(taskId) {
  if (!isLoggedIn()) {
    showToast('Please log in as a volunteer to apply for tasks.', 'warning');
    setTimeout(() => { window.location.href = '/login.html'; }, 1500);
    return;
  }

  const role = getUserRole();
  if (role !== 'volunteer') {
    showToast('Only registered volunteers can apply for tasks.', 'error');
    return;
  }

  const notes = await showPromptModal({
    title: 'Confirm Task Application',
    message: 'Your volunteer profile (name, mobile number, registered city, and skills) will be submitted to the organizing NGO. You can also provide an optional note or availability details below:',
    placeholder: 'e.g., Available on the scheduled date; experienced in tutoring, mentoring, and event coordination...',
    submitText: 'Submit Application'
  });

  if (notes === null) return; // User cancelled

  const res = await apiRequest('/applications/apply', 'POST', { taskId, notes: notes.trim() });

  if (res.ok && res.data.success) {
    showToast('Application successfully submitted! Your application is now recorded as [APPLIED].', 'success', 4000);
    // Reload task list or details to immediately reflect the [APPLIED] status
    if (document.getElementById('tasks-grid')) {
      loadTasks();
    } else if (document.getElementById('task-details-view')) {
      loadTaskDetails();
    }
  } else {
    showToast(res.data.message || 'Failed to submit application', 'error');
  }
}

// Initialize Create Task View (for NGOs)
function initCreateTask() {
  const form = document.getElementById('create-task-form');
  if (!form) return;

  const banner = document.getElementById('ngo-status-banner');
  const currentUser = getCurrentUser();

  // Protect page: require NGO role
  if (!isLoggedIn() || getUserRole() !== 'ngo') {
    if (banner) {
      banner.innerHTML = `
        <div class="card" style="background-color: #fef2f2; border: 1.5px solid #f87171; border-left: 6px solid #dc2626; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem;">
          <h3 style="color: #991b1b; margin-top: 0; margin-bottom: 0.4rem;">NGO Login Required</h3>
          <p style="color: #7f1d1d; margin-bottom: 0.75rem; font-size: 0.95rem;">
            Only verified NGO organizations can create and publish community service opportunities.
            Your current status: <strong>${isLoggedIn() ? `Logged in as ${getUserRole().toUpperCase()}` : 'Not logged in (Guest)'}</strong>.
          </p>
          <a href="/login.html" class="btn btn-primary btn-sm">Go to Login Page</a>
        </div>
      `;
    }
    showAlert('Access restricted: Only registered NGOs can create tasks. Please log in with your NGO credentials.', 'danger');
    showToast('Access restricted: Only registered NGOs can create tasks.', 'error');
    return;
  }

  // Display authorized NGO publisher status banner
  if (banner && currentUser && currentUser.profile) {
    const orgName = currentUser.profile.orgName || 'Registered Community NGO';
    const regNum = currentUser.profile.registrationNumber || 'Verified Partner';
    const city = currentUser.profile.city || 'India';
    banner.innerHTML = `
      <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-left: 5px solid #16a34a; border-radius: var(--radius-sm); padding: 0.9rem 1.2rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <span class="badge" style="background-color: #dcfce7; color: #166534; font-weight: 800; margin-bottom: 0.25rem;">[AUTHORIZED NGO PUBLISHER]</span>
          <div style="font-weight: 800; color: #14532d; font-size: 1.05rem; margin-top: 0.2rem;">${orgName}</div>
          <div style="font-size: 0.82rem; color: #15803d;">Registration Number: <strong>${regNum}</strong> | Registered Base: <strong>${city}</strong></div>
        </div>
        <div>
          <a href="/ngo-dashboard.html" class="btn btn-outline btn-sm" style="color: #166534; border-color: #86efac;">Manage Published Tasks</a>
        </div>
      </div>
    `;
  }

  // Bind submit event listener FIRST to guarantee form submission handling
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const titleInput = document.getElementById('task-title');
    const categoryInput = document.getElementById('task-category');
    const descInput = document.getElementById('task-desc');
    const skillsInput = document.getElementById('task-skills');
    const locationInput = document.getElementById('task-location');
    const cityInput = document.getElementById('task-city');
    const datetimeInput = document.getElementById('task-datetime');
    const hoursInput = document.getElementById('task-hours');
    const volsInput = document.getElementById('task-volunteers');

    const title = titleInput ? titleInput.value.trim() : '';
    const category = categoryInput ? categoryInput.value : '';
    const description = descInput ? descInput.value.trim() : '';
    const requiredSkills = skillsInput ? skillsInput.value.trim() : '';
    const location = locationInput ? locationInput.value.trim() : '';
    const city = cityInput ? cityInput.value.trim() : '';
    const dateTime = datetimeInput ? datetimeInput.value : '';
    const hours = hoursInput ? hoursInput.value : '3';
    const volunteersRequired = volsInput ? volsInput.value : '5';

    // Detailed field-by-field validation with explicit feedback
    const missing = [];
    if (!title) missing.push('Task Title');
    if (!category) missing.push('Category');
    if (!description) missing.push('Activity Description');
    if (!location) missing.push('Area / Locality Address');
    if (!city) missing.push('City');
    if (!dateTime) missing.push('Date & Time');
    if (!volunteersRequired) missing.push('Volunteers Required');

    if (missing.length > 0) {
      const msg = `Please fill in all mandatory fields. Missing: ${missing.join(', ')}`;
      showAlert(msg, 'danger');
      showToast(msg, 'error', 4500);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Publishing Task to Community...';
    }

    try {
      const res = await apiRequest('/tasks', 'POST', {
        title,
        category,
        description,
        requiredSkills,
        location,
        city,
        dateTime,
        hours: Number(hours),
        volunteersRequired: Number(volunteersRequired)
      });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Publish Task';
      }

      if (res.ok && res.data.success) {
        const createdTask = res.data.task;
        showAlert(`Task "${createdTask.title}" published successfully! Redirecting to NGO Dashboard...`, 'success');
        showToast(`Task "${createdTask.title}" published successfully!`, 'success', 3500);
        setTimeout(() => {
          window.location.href = '/ngo-dashboard.html';
        }, 1200);
      } else {
        const errorMsg = res.data && res.data.message ? res.data.message : 'Failed to create task';
        showAlert(errorMsg, 'danger');
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Publish Task';
      }
      showAlert('Network error or server unavailable while creating task', 'danger');
      showToast('Network error while creating task', 'error');
    }
  });

  // Safe pre-fill logic (wrapped in try-catch so it never halts form listener)
  try {
    const datetimeInput = document.getElementById('task-datetime');
    if (datetimeInput && !datetimeInput.value) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const pad = (n) => String(n).padStart(2, '0');
      const localTomorrow = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
      datetimeInput.value = localTomorrow;
    }
  } catch (err) {
    // Non-blocking
  }

  try {
    if (currentUser && currentUser.profile && currentUser.profile.city) {
      const citySelect = document.getElementById('task-city');
      if (citySelect) {
        for (let option of citySelect.options) {
          if (option.value.toLowerCase() === currentUser.profile.city.toLowerCase() ||
              option.text.toLowerCase().includes(currentUser.profile.city.toLowerCase())) {
            option.selected = true;
            break;
          }
        }
      }
    }
  } catch (err) {
    // Non-blocking
  }
}

// Load Single Task Details
async function loadTaskDetails() {
  const container = document.getElementById('task-details-view');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get('id');

  if (!taskId) {
    container.innerHTML = '<div class="alert alert-danger">Task ID not provided</div>';
    return;
  }

  const res = await apiRequest(`/tasks/${taskId}`, 'GET');
  if (!res.ok || !res.data.success) {
    container.innerHTML = `<div class="alert alert-danger">${res.data.message || 'Task not found'}</div>`;
    return;
  }

  const task = res.data.task;
  const ngo = task.createdBy || {};
  const formattedDate = new Date(task.dateTime).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const skillsHtml = (task.requiredSkills || [])
    .map((s) => `<span class="badge badge-skill">${s}</span>`)
    .join(' ');

  const catBadgeClass = getCategoryBadgeClass(task.category);

  // Check if current user is logged in as volunteer and has already applied
  let existingApp = null;
  if (isLoggedIn() && getUserRole() === 'volunteer') {
    try {
      const myAppsRes = await apiRequest('/applications/my-tasks', 'GET');
      if (myAppsRes.ok && myAppsRes.data && Array.isArray(myAppsRes.data.applications)) {
        existingApp = myAppsRes.data.applications.find((app) => {
          if (!app.taskId) return false;
          const tId = app.taskId._id ? app.taskId._id.toString() : app.taskId.toString();
          return tId === taskId;
        });
      }
    } catch (e) {
      // non-blocking
    }
  }

  let applicationBannerHtml = '';
  let applyActionButtonHtml = '';

  if (existingApp) {
    const appDate = existingApp.appliedAt
      ? new Date(existingApp.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Recently';

    applicationBannerHtml = `
      <div class="card" style="background-color: #ecfdf5; border: 1.5px solid #059669; padding: 1.25rem 1.5rem; margin-bottom: 1.75rem; border-left: 6px solid #059669;">
        <div style="font-weight: 800; color: #065f46; font-size: 1.05rem; margin-bottom: 0.35rem;">
          [YOUR APPLICATION IS RECORDED]
        </div>
        <div style="font-size: 0.92rem; color: #047857; margin-bottom: 0.5rem;">
          Application Status: <strong style="text-transform: uppercase;">[${existingApp.status}]</strong> | Applied on: <strong>${appDate}</strong>
        </div>
        <div style="font-size: 0.9rem; color: var(--text-main); background: #ffffff; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid #a7f3d0;">
          <strong>Application Note Sent to NGO:</strong> ${existingApp.notes ? `<em>"${existingApp.notes}"</em>` : '<span style="color: var(--text-light);">(Standard application with no additional note)</span>'}
        </div>
      </div>
    `;

    applyActionButtonHtml = `
      <button class="btn btn-outline" disabled style="padding: 0.85rem 1.75rem; font-size: 1rem; opacity: 0.85; cursor: not-allowed; border-color: #059669; color: #059669; font-weight: 700;">
        Already Applied [${existingApp.status.toUpperCase()}]
      </button>
      <a href="/volunteer-dashboard.html" class="btn btn-primary" style="padding: 0.85rem 1.75rem; font-size: 1rem;">Go to Volunteer Dashboard</a>
    `;
  } else {
    applyActionButtonHtml = `
      <button onclick="quickApply('${task._id}')" class="btn btn-primary" style="padding: 0.85rem 2rem; font-size: 1.05rem;">Apply for this Task</button>
    `;
  }

  container.innerHTML = `
    <div class="card" style="margin-bottom: 2rem; border-top: 5px solid var(--primary);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <span class="badge ${catBadgeClass}">${task.category}</span>
        <span class="badge badge-open">[STATUS: ${task.status.toUpperCase()}]</span>
      </div>

      ${applicationBannerHtml}

      <h1 style="font-size: 2.2rem; margin-bottom: 0.6rem; color: var(--text-main);">${task.title}</h1>
      <p style="font-size: 1.05rem; color: var(--text-muted); margin-bottom: 1.5rem;">
        Published by <strong style="color: var(--primary-dark);">${ngo.orgName || 'Community NGO'}</strong> (Registration ID: <span style="color: var(--text-main); font-weight: 600;">${ngo.registrationNumber || 'Verified'}</span>)
      </p>

      <div style="background: #f8fafc; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem;">
        <div>
          <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-light); font-weight: 800; letter-spacing: 0.5px;">Location & City</div>
          <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-top: 0.3rem;">${task.location}, ${task.city}</div>
        </div>
        <div>
          <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-light); font-weight: 800; letter-spacing: 0.5px;">Date & Time</div>
          <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-top: 0.3rem;">${formattedDate}</div>
        </div>
        <div>
          <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-light); font-weight: 800; letter-spacing: 0.5px;">Duration Commitment</div>
          <div style="font-size: 1.05rem; font-weight: 700; color: var(--primary); margin-top: 0.3rem;">${task.hours} Hours Service</div>
        </div>
        <div>
          <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-light); font-weight: 800; letter-spacing: 0.5px;">Volunteers Needed</div>
          <div style="font-size: 1.05rem; font-weight: 700; color: var(--secondary); margin-top: 0.3rem;">${task.volunteersAssigned || 0} / ${task.volunteersRequired} Assigned</div>
        </div>
      </div>

      <h3 style="margin-bottom: 0.6rem;">Activity Description</h3>
      <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.75; margin-bottom: 1.75rem;">
        ${task.description}
      </p>

      <h3 style="margin-bottom: 0.6rem;">Required Skills & Competencies</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 0.45rem; margin-bottom: 2rem;">
        ${skillsHtml.length > 0 ? skillsHtml : '<span style="color: var(--text-light); font-size: 0.9rem;">General volunteer assistance; no specialized technical skills required.</span>'}
      </div>

      <div class="card" style="background-color: #f1f5f9; border: 1.5px solid var(--border-color); border-left: 5px solid var(--secondary); margin-bottom: 2.25rem;">
        <h4 style="color: var(--secondary); margin-bottom: 0.6rem;">Organizing NGO Details</h4>
        <p style="font-size: 0.92rem; margin-bottom: 0.4rem;"><strong>Organization:</strong> ${ngo.orgName}</p>
        <p style="font-size: 0.92rem; margin-bottom: 0.4rem;"><strong>Registration ID:</strong> ${ngo.registrationNumber}</p>
        <p style="font-size: 0.92rem; margin-bottom: 0.4rem;"><strong>City:</strong> ${ngo.city}</p>
        <p style="font-size: 0.92rem; margin-bottom: 0;"><strong>Coordinator Contact:</strong> ${ngo.contactPerson} (${ngo.phone})</p>
      </div>

      <div style="display: flex; gap: 1.1rem; align-items: center; flex-wrap: wrap;">
        ${applyActionButtonHtml}
        <a href="/explore-tasks.html" class="btn btn-outline" style="padding: 0.85rem 1.5rem;">Back to All Tasks</a>
      </div>
    </div>
  `;
}
