const API_BASE = '/api';

// Retrieve authentication token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Retrieve current user object
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

// User object alias for backward and forward compatibility
function getUser() {
  return getCurrentUser();
}

// Save authentication session
function setAuthSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// Get user role
function getUserRole() {
  const user = getCurrentUser();
  return user ? user.role : null;
}

// Logout user and redirect to home
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

// Generic API fetch wrapper with token injection
async function apiRequest(endpoint, method = 'GET', data = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    return { ok: response.ok, status: response.status, data: result };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      data: { success: false, message: 'Network or server communication error' }
    };
  }
}

// Synchronize top navigation bar with current authentication state
function syncNavigation() {
  const navActions = document.getElementById('nav-actions');
  const navLinks = document.getElementById('nav-links');
  if (!navActions) return;

  const user = getCurrentUser();

  if (user) {
    let dashboardLink = '/volunteer-dashboard.html';
    let dashboardTitle = 'Volunteer Dashboard';
    let roleBadge = `<span class="badge badge-primary" style="margin-left: 0.4rem;">${user.role.toUpperCase()}</span>`;
    let displayName = user.email;

    if (user.profile && (user.profile.fullName || user.profile.orgName)) {
      displayName = user.profile.fullName || user.profile.orgName;
    } else if (user.role === 'admin') {
      displayName = 'System Admin';
    }

    if (user.role === 'admin') {
      dashboardLink = '/admin-dashboard.html';
      dashboardTitle = 'Admin Portal';
      roleBadge = `<span class="badge" style="margin-left: 0.4rem; background-color: #fee2e2; color: #991b1b; border: 1.5px solid #f87171; font-weight: 800;">ADMIN</span>`;
    } else if (user.role === 'ngo') {
      dashboardLink = '/ngo-dashboard.html';
      dashboardTitle = 'NGO Dashboard';
      roleBadge = `<span class="badge" style="margin-left: 0.4rem; background-color: #eff6ff; color: #1d4ed8; border: 1.5px solid #93c5fd; font-weight: 800;">NGO</span>`;
    }

    navActions.innerHTML = `
      <span style="font-size: 0.88rem; color: var(--text-muted); font-weight: 600; white-space: nowrap;">
        ${displayName}
        ${roleBadge}
      </span>
      <a href="${dashboardLink}" class="btn btn-outline btn-sm" style="white-space: nowrap;">${dashboardTitle}</a>
      <button onclick="logout()" class="btn btn-sm" style="background: none; border: 1px solid var(--border-color); color: var(--danger); white-space: nowrap;">Logout</button>
    `;
  } else {
    navActions.innerHTML = `
      <a href="/login.html" class="btn btn-outline btn-sm">Login</a>
      <a href="/register.html" class="btn btn-primary btn-sm">Register</a>
    `;
  }
}

// Auto-run navigation sync when DOM is ready
document.addEventListener('DOMContentLoaded', syncNavigation);

// ==============================================================
// Global In-Page Alert Helpers (Universal Form & View Banners)
// ==============================================================
function showAlert(message, type = 'danger', containerId = 'alert-container') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="alert alert-${type}" style="display: flex; justify-content: space-between; align-items: center;">
      <span>${message}</span>
      <button type="button" onclick="clearAlert('${containerId}')" class="toast-close-btn" aria-label="Close" style="color: inherit; font-size: 1.25rem;">&times;</button>
    </div>
  `;
  setTimeout(() => {
    clearAlert(containerId);
  }, 4500);
}

function clearAlert(containerId = 'alert-container') {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
}

// ==============================================================
// Modern Toast Notification System (In-Page, Non-Blocking)
// ==============================================================
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const normalizedType = (type === 'danger') ? 'error' : type;
  toast.className = `toast toast-${normalizedType}`;

  let tagLabel = 'INFO';
  if (normalizedType === 'success') tagLabel = 'SUCCESS';
  else if (normalizedType === 'error') tagLabel = 'ERROR';
  else if (normalizedType === 'warning') tagLabel = 'WARNING';

  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-tag">${tagLabel}</span>
      <div class="toast-msg">${message}</div>
    </div>
    <button type="button" class="toast-close-btn" aria-label="Close">&times;</button>
  `;

  const removeToast = () => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 250);
  };

  toast.querySelector('.toast-close-btn').addEventListener('click', removeToast);
  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
}

// ==============================================================
// Modern In-Page Confirmation Dialog (Promise-based, Non-Blocking)
// ==============================================================
function showConfirmModal(title, message, confirmText = 'Confirm', isDanger = false) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'app-modal-backdrop';

    const btnClass = isDanger ? 'btn-danger' : 'btn-primary';

    backdrop.innerHTML = `
      <div class="app-modal-card">
        <div class="app-modal-header">
          <h3>${title}</h3>
          <button type="button" class="toast-close-btn" id="modal-close-x">&times;</button>
        </div>
        <div class="app-modal-body">
          <p style="margin: 0; color: var(--text-main);">${message}</p>
        </div>
        <div class="app-modal-footer">
          <button type="button" class="btn btn-outline btn-sm" id="modal-cancel-btn">Cancel</button>
          <button type="button" class="btn ${btnClass} btn-sm" id="modal-confirm-btn">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const close = (result) => {
      backdrop.remove();
      resolve(result);
    };

    backdrop.querySelector('#modal-close-x').addEventListener('click', () => close(false));
    backdrop.querySelector('#modal-cancel-btn').addEventListener('click', () => close(false));
    backdrop.querySelector('#modal-confirm-btn').addEventListener('click', () => close(true));

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close(false);
    });
  });
}

// ==============================================================
// Modern In-Page Prompt Modal (Textarea note input for tasks)
// ==============================================================
function showPromptModal({ title = 'Submit Note', message = '', placeholder = '', submitText = 'Submit', required = false }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'app-modal-backdrop';

    backdrop.innerHTML = `
      <div class="app-modal-card">
        <div class="app-modal-header">
          <h3>${title}</h3>
          <button type="button" class="toast-close-btn" id="modal-prompt-close">&times;</button>
        </div>
        <div class="app-modal-body">
          ${message ? `<p style="margin-bottom: 0.85rem; color: var(--text-main); font-weight: 500;">${message}</p>` : ''}
          <textarea id="modal-prompt-input" class="form-control" placeholder="${placeholder}" style="min-height: 100px; font-size: 0.95rem;"></textarea>
          <div id="modal-prompt-error" style="color: var(--danger); font-size: 0.82rem; margin-top: 0.35rem; display: none;">Please provide a note before submitting.</div>
        </div>
        <div class="app-modal-footer">
          <button type="button" class="btn btn-outline btn-sm" id="modal-prompt-cancel">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" id="modal-prompt-submit">${submitText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    const input = backdrop.querySelector('#modal-prompt-input');
    input.focus();

    const close = (result) => {
      backdrop.remove();
      resolve(result);
    };

    backdrop.querySelector('#modal-prompt-close').addEventListener('click', () => close(null));
    backdrop.querySelector('#modal-prompt-cancel').addEventListener('click', () => close(null));

    backdrop.querySelector('#modal-prompt-submit').addEventListener('click', () => {
      const val = input.value.trim();
      if (required && !val) {
        backdrop.querySelector('#modal-prompt-error').style.display = 'block';
        return;
      }
      close(val);
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close(null);
    });
  });
}

// Safe native alert override to prevent browser-freezing dialogs
window.alert = function(msg) {
  showToast(msg, 'info');
};
