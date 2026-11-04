const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const Task = require('../models/Task');
const Application = require('../models/Application');
const Certificate = require('../models/Certificate');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// Protect all admin routes with protect + requireAdmin
router.use(protect);
router.use(requireAdmin);

// Platform Overview & System Health
// GET /api/admin/overview
router.get('/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVolunteers = await Volunteer.countDocuments();
    const totalNGOs = await NGO.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const totalApplications = await Application.countDocuments();
    const totalCertificates = await Certificate.countDocuments();

    // Sum total volunteer hours
    const hoursAgg = await Volunteer.aggregate([
      { $group: { _id: null, total: { $sum: '$totalHours' } } }
    ]);
    const totalHours = hoursAgg.length > 0 ? hoursAgg[0].total : 0;

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalVolunteers,
        totalNGOs,
        totalTasks,
        completedTasks,
        totalApplications,
        totalCertificates,
        totalHours
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds: Math.floor(process.uptime()),
        database: 'Connected (MongoDB 127.0.0.1:27017/community_help_hub)',
        status: 'Operational'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching admin overview',
      error: error.message
    });
  }
});

// Get All Registered Users with Profiles
// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        let profile = null;
        if (u.role === 'volunteer') {
          profile = await Volunteer.findOne({ userId: u._id }).select('fullName city phone rankingPoints totalHours completedTasksCount');
        } else if (u.role === 'ngo') {
          profile = await NGO.findOne({ userId: u._id }).select('orgName city phone registrationNumber contactPerson');
        }
        return {
          _id: u._id,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          profile
        };
      })
    );

    res.json({
      success: true,
      count: enrichedUsers.length,
      users: enrichedUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching user directory',
      error: error.message
    });
  }
});

// Delete User Account
// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting self (the logged-in admin)
    if (userToDelete._id.toString() === req.user.userId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active administrator account' });
    }

    // Cascade deletion based on role
    if (userToDelete.role === 'volunteer') {
      const vol = await Volunteer.findOne({ userId: userToDelete._id });
      if (vol) {
        await Application.deleteMany({ volunteerId: vol._id });
        await Certificate.deleteMany({ volunteerId: vol._id });
        await Volunteer.findByIdAndDelete(vol._id);
      }
    } else if (userToDelete.role === 'ngo') {
      const ngo = await NGO.findOne({ userId: userToDelete._id });
      if (ngo) {
        const tasks = await Task.find({ createdBy: ngo._id });
        const taskIds = tasks.map((t) => t._id);
        await Application.deleteMany({ taskId: { $in: taskIds } });
        await Certificate.deleteMany({ taskId: { $in: taskIds } });
        await Task.deleteMany({ createdBy: ngo._id });
        await NGO.findByIdAndDelete(ngo._id);
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `User account (${userToDelete.email}) and related records deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting user',
      error: error.message
    });
  }
});

// Get All Tasks Across All NGOs
// GET /api/admin/tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'orgName city phone registrationNumber contactPerson')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching all tasks',
      error: error.message
    });
  }
});

// Delete Any Task
// DELETE /api/admin/tasks/:id
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Application.deleteMany({ taskId: task._id });
    await Certificate.deleteMany({ taskId: task._id });
    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task and associated applications removed by Administrator'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting task',
      error: error.message
    });
  }
});

// Update Any Task Status
// PUT /api/admin/tasks/:id/status
router.put('/tasks/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    await task.save();

    res.json({
      success: true,
      message: `Task status updated to ${status} by Administrator`,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating task status',
      error: error.message
    });
  }
});

module.exports = router;
