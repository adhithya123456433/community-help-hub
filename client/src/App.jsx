import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import ExploreTasks from './pages/ExploreTasks';
import TaskDetails from './pages/TaskDetails';
import CreateTask from './pages/CreateTask';
import VolunteerDashboard from './pages/VolunteerDashboard';
import NgoDashboard from './pages/NgoDashboard';
import MyTasks from './pages/MyTasks';
import ImpactDashboard from './pages/ImpactDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Legacy URL redirect handler for task-details.html?id=...
function LegacyTaskRedirect() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  if (id) {
    return <Navigate to={`/tasks/${id}`} replace />;
  }
  return <Navigate to="/explore-tasks" replace />;
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/explore-tasks" element={<ExploreTasks />} />
        <Route path="/tasks/:id" element={<TaskDetails />} />
        <Route path="/impact" element={<ImpactDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Volunteer Protected Routes */}
        <Route
          path="/volunteer-dashboard"
          element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tasks"
          element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <MyTasks />
            </ProtectedRoute>
          }
        />

        {/* NGO Protected Routes */}
        <Route
          path="/ngo-dashboard"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <NgoDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-task"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <CreateTask />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Legacy .html route aliases for seamless backward compatibility */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/explore-tasks.html" element={<Navigate to="/explore-tasks" replace />} />
        <Route path="/task-details.html" element={<LegacyTaskRedirect />} />
        <Route path="/impact.html" element={<Navigate to="/impact" replace />} />
        <Route path="/volunteer-dashboard.html" element={<Navigate to="/volunteer-dashboard" replace />} />
        <Route path="/ngo-dashboard.html" element={<Navigate to="/ngo-dashboard" replace />} />
        <Route path="/my-tasks.html" element={<Navigate to="/my-tasks" replace />} />
        <Route path="/create-task.html" element={<Navigate to="/create-task" replace />} />
        <Route path="/admin-dashboard.html" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="/login.html" element={<Navigate to="/login" replace />} />
        <Route path="/register.html" element={<Navigate to="/register" replace />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}
