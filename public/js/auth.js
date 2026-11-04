document.addEventListener('DOMContentLoaded', () => {
  // Handle Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showAlert('Please provide both email and password', 'danger');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Verifying...';

      const res = await apiRequest('/auth/login', 'POST', { email, password });
      submitBtn.disabled = false;
      submitBtn.innerText = 'Login';

      if (res.ok && res.data.success) {
        setAuthSession(res.data.token, res.data.user);
        showAlert('Login successful. Redirecting...', 'success');

        setTimeout(() => {
          if (res.data.user.role === 'admin') {
            window.location.href = '/admin-dashboard.html';
          } else if (res.data.user.role === 'ngo') {
            window.location.href = '/ngo-dashboard.html';
          } else {
            window.location.href = '/volunteer-dashboard.html';
          }
        }, 800);
      } else {
        showAlert(res.data.message || 'Login failed', 'danger');
      }
    });
  }

  // Validation helpers
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/;

  const sanitizeClientPhone = (p) => {
    let clean = (p || '').replace(/[\s\-\(\)\+]/g, '');
    if (clean.startsWith('91') && clean.length === 12) clean = clean.slice(2);
    return clean;
  };

  // Handle Volunteer Registration Form
  const volunteerForm = document.getElementById('volunteer-register-form');
  if (volunteerForm) {
    volunteerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      const fullName = document.getElementById('vol-name').value.trim();
      const email = document.getElementById('vol-email').value.trim();
      const password = document.getElementById('vol-password').value;
      const rawPhone = document.getElementById('vol-phone').value.trim();
      const city = document.getElementById('vol-city').value.trim();
      const skills = document.getElementById('vol-skills').value.trim();

      if (!fullName || !email || !password || !rawPhone || !city) {
        showAlert('Please fill in all mandatory fields', 'danger');
        return;
      }

      if (!emailRegex.test(email)) {
        showAlert('Please enter a valid email address (e.g. name@example.com)', 'danger');
        return;
      }

      const phone = sanitizeClientPhone(rawPhone);
      if (!phoneRegex.test(phone)) {
        showAlert('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9', 'danger');
        return;
      }

      if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'danger');
        return;
      }

      const submitBtn = volunteerForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Registering...';

      const res = await apiRequest('/auth/register-volunteer', 'POST', {
        fullName,
        email,
        password,
        phone,
        city,
        skills
      });

      submitBtn.disabled = false;
      submitBtn.innerText = 'Register as Volunteer';

      if (res.ok && res.data.success) {
        setAuthSession(res.data.token, res.data.user);
        showAlert('Volunteer registered successfully. Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/volunteer-dashboard.html';
        }, 800);
      } else {
        showAlert(res.data.message || 'Registration failed', 'danger');
      }
    });
  }

  // Handle NGO Registration Form
  const ngoForm = document.getElementById('ngo-register-form');
  if (ngoForm) {
    ngoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      const orgName = document.getElementById('ngo-name').value.trim();
      const registrationNumber = document.getElementById('ngo-reg').value.trim();
      const contactPerson = document.getElementById('ngo-contact').value.trim();
      const email = document.getElementById('ngo-email').value.trim();
      const password = document.getElementById('ngo-password').value;
      const rawPhone = document.getElementById('ngo-phone').value.trim();
      const city = document.getElementById('ngo-city').value.trim();
      const address = document.getElementById('ngo-address').value.trim();

      if (!orgName || !registrationNumber || !contactPerson || !email || !password || !rawPhone || !city) {
        showAlert('Please fill in all mandatory NGO fields', 'danger');
        return;
      }

      if (!emailRegex.test(email)) {
        showAlert('Please enter a valid official email address', 'danger');
        return;
      }

      const phone = sanitizeClientPhone(rawPhone);
      if (!phoneRegex.test(phone)) {
        showAlert('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9', 'danger');
        return;
      }

      if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'danger');
        return;
      }

      const submitBtn = ngoForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Registering...';

      const res = await apiRequest('/auth/register-ngo', 'POST', {
        orgName,
        registrationNumber,
        contactPerson,
        email,
        password,
        phone,
        city,
        address
      });

      submitBtn.disabled = false;
      submitBtn.innerText = 'Register Organization';

      if (res.ok && res.data.success) {
        setAuthSession(res.data.token, res.data.user);
        showAlert('NGO registered successfully. Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/ngo-dashboard.html';
        }, 800);
      } else {
        showAlert(res.data.message || 'Registration failed', 'danger');
      }
    });
  }
});

// Helper functions for alerts
function showAlert(message, type = 'danger') {
  const container = document.getElementById('alert-container');
  if (!container) return;
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

function clearAlert() {
  const container = document.getElementById('alert-container');
  if (container) container.innerHTML = '';
}
