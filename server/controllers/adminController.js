const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const Task = require('../models/Task');
const Application = require('../models/Application');
const Certificate = require('../models/Certificate');

// Platform Overview & Telemetry
// GET /api/admin/overview
exports.getOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVolunteers = await Volunteer.countDocuments();
    const totalNGOs = await NGO.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalCertificates = await Certificate.countDocuments();

    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const tasksByCategory = await Task.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Total verified hours platform-wide
    const completedApps = await Application.find({ status: 'Completed' })
      .populate('task', 'estimatedHours');

    let totalHoursServed = 0;
    completedApps.forEach(a => {
      if (a.task && a.task.estimatedHours) {
        totalHoursServed += a.task.estimatedHours;
      }
    });

    res.json({
      success: true,
      telemetry: {
        totalUsers,
        totalVolunteers,
        totalNGOs,
        totalTasks,
        totalApplications,
        totalCertificates,
        totalHoursServed
      },
      tasksByStatus: tasksByStatus.map(s => ({ status: s._id, count: s.count })),
      tasksByCategory: tasksByCategory.map(c => ({ category: c._id, count: c.count }))
    });
  } catch (error) {
    console.error('Error fetching admin telemetry:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// User Accounts Directory
// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const enrichedUsers = await Promise.all(
      users.map(async user => {
        let profile = null;
        if (user.role === 'VOLUNTEER') {
          profile = await Volunteer.findOne({ user: user._id });
        } else if (user.role === 'NGO') {
          profile = await NGO.findOne({ user: user._id });
        }
        return {
          _id: user._id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
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
    console.error('Error fetching users for admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete User Account
// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Security Guard: Root platform Administrator accounts cannot be deleted'
      });
    }

    if (user.role === 'VOLUNTEER') {
      const vol = await Volunteer.findOne({ user: userId });
      if (vol) {
        await Application.deleteMany({ volunteer: vol._id });
        await Certificate.deleteMany({ volunteer: vol._id });
        await Volunteer.findByIdAndDelete(vol._id);
      }
    } else if (user.role === 'NGO') {
      const ngo = await NGO.findOne({ user: userId });
      if (ngo) {
        const tasks = await Task.find({ ngo: ngo._id });
        const taskIds = tasks.map(t => t._id);
        await Application.deleteMany({ task: { $in: taskIds } });
        await Task.deleteMany({ ngo: ngo._id });
        await NGO.findByIdAndDelete(ngo._id);
      }
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: `User account (${user.email}) and related records deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Global Task Directory
// GET /api/admin/tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('ngo', 'organizationName registrationNumber city phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Error fetching tasks for admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Administrative Delete Task
// DELETE /api/admin/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Application.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Task "${task.title}" deleted by platform administrator`
    });
  } catch (error) {
    console.error('Error deleting task via admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Administrative Update Task Status
// PUT /api/admin/tasks/:id/status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Completed', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required: Open, In Progress, Completed, Cancelled'
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    await task.save();

    res.json({
      success: true,
      message: `Task status updated to ${status} by administrator`,
      task
    });
  } catch (error) {
    console.error('Error updating task status via admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
