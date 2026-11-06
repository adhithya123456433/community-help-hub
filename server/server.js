const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const clientDistCandidates = [
  path.resolve(__dirname, '../client/dist'),
  path.resolve(__dirname, 'client/dist'),
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, 'public')
];

const clientDistPath = clientDistCandidates.find(p => fs.existsSync(p)) || path.resolve(__dirname, '../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, {
    etag: false,
    maxAge: 0,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }));
}

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'CommunityHelp Hub',
    timestamp: new Date().toISOString()
  });
});

app.get('*', (req, res) => {
  const indexCandidates = [
    path.join(clientDistPath, 'index.html'),
    path.resolve(__dirname, '../client/dist/index.html'),
    path.resolve(__dirname, '../public/index.html'),
    path.resolve(__dirname, 'public/index.html')
  ];
  for (const candidate of indexCandidates) {
    if (fs.existsSync(candidate)) {
      return res.sendFile(candidate);
    }
  }
  res.status(404).send('CommunityHelp Hub - Page Not Found');
});

app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred',
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
