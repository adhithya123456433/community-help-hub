const fs = require('fs');
const path = require('path');

// 1. Patch Register.jsx
const registerPath = path.join(__dirname, '../client/src/pages/Register.jsx');
if (fs.existsSync(registerPath)) {
  let reg = fs.readFileSync(registerPath, 'utf8');
  if (!reg.includes('useEffect')) {
    reg = reg.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");
  }
  if (!reg.includes('// Auto-dismiss warning after 4.5 seconds')) {
    reg = reg.replace(
      "const [errorMessage, setErrorMessage] = useState('');",
      `const [errorMessage, setErrorMessage] = useState('');

  // Auto-dismiss warning after 4.5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);`
    );
  }
  reg = reg.replace(
    '{errorMessage && <div className="alert alert-danger">{errorMessage}</div>}',
    `{errorMessage && (
              <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span>{errorMessage}</span>
                <button type="button" onClick={() => setErrorMessage('')} className="toast-close-btn" style={{ color: 'inherit', fontSize: '1.25rem' }} aria-label="Close">&times;</button>
              </div>
            )}`
  );
  fs.writeFileSync(registerPath, reg, 'utf8');
  console.log('Patched Register.jsx');
}

// 2. Patch CreateTask.jsx
const createTaskPath = path.join(__dirname, '../client/src/pages/CreateTask.jsx');
if (fs.existsSync(createTaskPath)) {
  let ct = fs.readFileSync(createTaskPath, 'utf8');
  if (!ct.includes('// Auto-dismiss error alert after 4.5 seconds')) {
    ct = ct.replace(
      "const [errorAlert, setErrorAlert] = useState('');",
      `const [errorAlert, setErrorAlert] = useState('');

  // Auto-dismiss error alert after 4.5 seconds
  useEffect(() => {
    if (errorAlert) {
      const timer = setTimeout(() => {
        setErrorAlert('');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [errorAlert]);`
    );
  }
  ct = ct.replace(
    '{errorAlert && <div className="alert alert-danger">{errorAlert}</div>}',
    `{errorAlert && (
              <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span>{errorAlert}</span>
                <button type="button" onClick={() => setErrorAlert('')} className="toast-close-btn" style={{ color: 'inherit', fontSize: '1.25rem' }} aria-label="Close">&times;</button>
              </div>
            )}`
  );
  fs.writeFileSync(createTaskPath, ct, 'utf8');
  console.log('Patched CreateTask.jsx');
}

// 3. Patch NgoDashboard.jsx
const ngoDashPath = path.join(__dirname, '../client/src/pages/NgoDashboard.jsx');
if (fs.existsSync(ngoDashPath)) {
  let ngo = fs.readFileSync(ngoDashPath, 'utf8');
  if (!ngo.includes('// Auto-dismiss modal error alert after 4.5 seconds')) {
    ngo = ngo.replace(
      "const [editModalError, setEditModalError] = useState('');",
      `const [editModalError, setEditModalError] = useState('');

  // Auto-dismiss modal error alert after 4.5 seconds
  useEffect(() => {
    if (editModalError) {
      const timer = setTimeout(() => {
        setEditModalError('');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [editModalError]);`
    );
  }
  ngo = ngo.replace(
    '{editModalError && <div className="alert alert-danger">{editModalError}</div>}',
    `{editModalError && (
              <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span>{editModalError}</span>
                <button type="button" onClick={() => setEditModalError('')} className="toast-close-btn" style={{ color: 'inherit', fontSize: '1.25rem' }} aria-label="Close">&times;</button>
              </div>
            )}`
  );
  fs.writeFileSync(ngoDashPath, ngo, 'utf8');
  console.log('Patched NgoDashboard.jsx');
}

// 4. Patch public/js/api.js
const apiJsPath = path.join(__dirname, '../public/js/api.js');
if (fs.existsSync(apiJsPath)) {
  let apiJs = fs.readFileSync(apiJsPath, 'utf8');
  apiJs = apiJs.replace(
    /function showAlert\(message, type = 'danger', containerId = 'alert-container'\) \{[\s\S]*?container\.innerHTML = `[\s\S]*?`;\s*\}/,
    `function showAlert(message, type = 'danger', containerId = 'alert-container') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = \`
    <div class="alert alert-\${type}" style="display: flex; justify-content: space-between; align-items: center;">
      <span>\${message}</span>
      <button type="button" onclick="clearAlert('\${containerId}')" class="toast-close-btn" aria-label="Close" style="color: inherit; font-size: 1.25rem;">&times;</button>
    </div>
  \`;
  setTimeout(() => {
    clearAlert(containerId);
  }, 4500);
}`
  );
  fs.writeFileSync(apiJsPath, apiJs, 'utf8');
  console.log('Patched public/js/api.js');
}

// 5. Patch public/js/auth.js
const authJsPath = path.join(__dirname, '../public/js/auth.js');
if (fs.existsSync(authJsPath)) {
  let authJs = fs.readFileSync(authJsPath, 'utf8');
  authJs = authJs.replace(
    /function showAlert\(message, type = 'danger'\) \{[\s\S]*?container\.innerHTML = `<div class="alert alert-\${type}">\${message}<\/div>`;\s*\}/,
    `function showAlert(message, type = 'danger') {
  const container = document.getElementById('alert-container');
  if (!container) return;
  container.innerHTML = \`
    <div class="alert alert-\${type}" style="display: flex; justify-content: space-between; align-items: center;">
      <span>\${message}</span>
      <button type="button" onclick="clearAlert()" class="toast-close-btn" aria-label="Close" style="color: inherit; font-size: 1.25rem;">&times;</button>
    </div>
  \`;
  setTimeout(() => {
    clearAlert();
  }, 4500);
}`
  );
  fs.writeFileSync(authJsPath, authJs, 'utf8');
  console.log('Patched public/js/auth.js');
}

console.log('All warning persistence fixes applied successfully.');
