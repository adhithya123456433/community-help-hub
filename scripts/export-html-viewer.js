const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const exportFullDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is missing in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully. Fetching all collections...');

    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).sort({ role: 1, email: 1 }).toArray();
    const volunteers = await db.collection('volunteers').find({}).sort({ rankingPoints: -1 }).toArray();
    const ngos = await db.collection('ngos').find({}).sort({ orgName: 1 }).toArray();
    const tasks = await db.collection('tasks').find({}).sort({ createdAt: -1 }).toArray();
    const applications = await db.collection('applications').find({}).sort({ createdAt: -1 }).toArray();
    const certificates = await db.collection('certificates').find({}).sort({ issueDate: -1 }).toArray();

    const dataPayload = {
      exportedAt: new Date().toISOString(),
      counts: {
        users: users.length,
        volunteers: volunteers.length,
        ngos: ngos.length,
        tasks: tasks.length,
        applications: applications.length,
        certificates: certificates.length
      },
      collections: {
        users,
        volunteers,
        ngos,
        tasks,
        applications,
        certificates
      }
    };

    // Also write full raw JSON dump
    const jsonPath = path.join(__dirname, '..', 'DATABASE_DUMP.json');
    fs.writeFileSync(jsonPath, JSON.stringify(dataPayload, null, 2), 'utf-8');
    console.log(`Saved raw JSON dump: ${jsonPath}`);

    // Build standalone interactive HTML viewer
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CommunityHelp Hub - Complete Database Viewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; }
    .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 24px; color: #38bdf8; font-weight: 700; }
    .header p { color: #94a3b8; font-size: 14px; margin-top: 4px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer; transition: transform 0.15s, border-color 0.15s; }
    .stat-card:hover { border-color: #38bdf8; transform: translateY(-2px); }
    .stat-num { font-size: 32px; font-weight: 700; color: #38bdf8; }
    .stat-label { font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
    .tab-bar { display: flex; gap: 8px; border-bottom: 1px solid #334155; margin-bottom: 16px; overflow-x: auto; }
    .tab-btn { background: none; border: none; padding: 12px 20px; font-size: 14px; font-weight: 600; color: #94a3b8; cursor: pointer; border-bottom: 3px solid transparent; }
    .tab-btn.active { color: #38bdf8; border-bottom-color: #38bdf8; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px; }
    .search-input { flex: 1; max-width: 400px; padding: 10px 14px; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 14px; }
    .search-input:focus { outline: none; border-color: #38bdf8; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .badge-admin { background: #7c3aed; color: #ede9fe; }
    .badge-ngo { background: #2563eb; color: #dbeafe; }
    .badge-volunteer { background: #059669; color: #d1fae5; }
    .table-container { background: #1e293b; border: 1px solid #334155; border-radius: 8px; overflow-x: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
    table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    th { background: #0f172a; padding: 12px 14px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155; white-space: nowrap; }
    td { padding: 10px 14px; border-bottom: 1px solid #1e293b; border-top: 1px solid #334155; color: #e2e8f0; vertical-align: middle; }
    tr:hover td { background: #273549; }
    .code-cell { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; color: #cbd5e1; }
    .hash-cell { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 11px; color: #94a3b8; word-break: break-all; max-width: 200px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>CommunityHelp Hub - Complete Database View</h1>
      <p>Source: MongoDB Atlas (community_help_hub) | Exported: ${new Date().toLocaleString()}</p>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card" onclick="switchTab('users')">
      <div class="stat-num">${users.length}</div>
      <div class="stat-label">Users</div>
    </div>
    <div class="stat-card" onclick="switchTab('volunteers')">
      <div class="stat-num">${volunteers.length}</div>
      <div class="stat-label">Volunteers</div>
    </div>
    <div class="stat-card" onclick="switchTab('ngos')">
      <div class="stat-num">${ngos.length}</div>
      <div class="stat-label">NGOs</div>
    </div>
    <div class="stat-card" onclick="switchTab('tasks')">
      <div class="stat-num">${tasks.length}</div>
      <div class="stat-label">Tasks</div>
    </div>
    <div class="stat-card" onclick="switchTab('applications')">
      <div class="stat-num">${applications.length}</div>
      <div class="stat-label">Applications</div>
    </div>
    <div class="stat-card" onclick="switchTab('certificates')">
      <div class="stat-num">${certificates.length}</div>
      <div class="stat-label">Certificates</div>
    </div>
  </div>

  <div class="tab-bar">
    <button class="tab-btn active" id="tab-users-btn" onclick="switchTab('users')">Users (${users.length})</button>
    <button class="tab-btn" id="tab-volunteers-btn" onclick="switchTab('volunteers')">Volunteers (${volunteers.length})</button>
    <button class="tab-btn" id="tab-ngos-btn" onclick="switchTab('ngos')">NGOs (${ngos.length})</button>
    <button class="tab-btn" id="tab-tasks-btn" onclick="switchTab('tasks')">Tasks (${tasks.length})</button>
    <button class="tab-btn" id="tab-applications-btn" onclick="switchTab('applications')">Applications (${applications.length})</button>
    <button class="tab-btn" id="tab-certificates-btn" onclick="switchTab('certificates')">Certificates (${certificates.length})</button>
  </div>

  <div class="toolbar">
    <input type="text" id="searchInput" class="search-input" placeholder="Search this collection..." onkeyup="filterTable()">
    <span id="rowCount" style="color: #94a3b8; font-size: 13px;"></span>
  </div>

  <div id="tableContainer" class="table-container"></div>

  <script>
    const database = ${JSON.stringify(dataPayload.collections)};
    let activeCollection = 'users';

    function renderTable() {
      const rows = database[activeCollection] || [];
      const container = document.getElementById('tableContainer');
      const search = document.getElementById('searchInput').value.toLowerCase();
      
      const filtered = rows.filter(row => {
        return Object.values(row).some(v => String(v).toLowerCase().includes(search));
      });

      document.getElementById('rowCount').textContent = 'Showing ' + filtered.length + ' of ' + rows.length + ' records';

      if (filtered.length === 0) {
        container.innerHTML = '<div style="padding: 32px; text-align: center; color: #94a3b8;">No matching records found</div>';
        return;
      }

      const headers = Object.keys(filtered[0]);
      let html = '<table><thead><tr>';
      headers.forEach(h => { html += '<th>' + h + '</th>'; });
      html += '</tr></thead><tbody>';

      filtered.forEach(item => {
        html += '<tr>';
        headers.forEach(h => {
          let val = item[h];
          if (val === null || val === undefined) val = '';
          else if (typeof val === 'object') val = Array.isArray(val) ? val.join(', ') : JSON.stringify(val);
          
          if (h === 'role') {
            html += '<td><span class="badge badge-' + val + '">' + val + '</span></td>';
          } else if (h === 'password') {
            html += '<td class="hash-cell" title="' + val + '">' + String(val).substring(0, 16) + '...</td>';
          } else if (h === '_id' || h.endsWith('Id')) {
            html += '<td class="code-cell">' + val + '</td>';
          } else {
            html += '<td>' + val + '</td>';
          }
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      container.innerHTML = html;
    }

    function switchTab(coll) {
      activeCollection = coll;
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById('tab-' + coll + '-btn');
      if (activeBtn) activeBtn.classList.add('active');
      document.getElementById('searchInput').value = '';
      renderTable();
    }

    function filterTable() {
      renderTable();
    }

    // Initial render
    renderTable();
  </script>
</body>
</html>`;

    const htmlPath = path.join(__dirname, '..', 'DATABASE_FULL_VIEW.html');
    fs.writeFileSync(htmlPath, html, 'utf-8');
    console.log(`Saved interactive HTML viewer: ${htmlPath}`);

    process.exit(0);
  } catch (error) {
    console.error('Error exporting database:', error);
    process.exit(1);
  }
};

exportFullDatabase();
