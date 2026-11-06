const Application = require('../models/Application');
const Task = require('../models/Task');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const Certificate = require('../models/Certificate');

// Apply for a task (Volunteer only)
// POST /api/applications/apply
exports.applyForTask = async (req, res) => {
  try {
    const { taskId, message } = req.body;

    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: `Task is currently ${task.status} and not accepting new volunteer applications`
      });
    }

    // Capacity guard check
    if (task.volunteersAssigned >= task.volunteersRequired) {
      return res.status(400).json({
        success: false,
        message: 'Task quota is completely full. No further volunteer slots available.'
      });
    }

    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    // Check for duplicate application
    const existingApp = await Application.findOne({
      task: taskId,
      volunteer: volunteer._id
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this community task'
      });
    }

    const application = new Application({
      task: taskId,
      volunteer: volunteer._id,
      message: message ? message.trim() : '',
      status: 'Applied'
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Error applying for task:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get current volunteer's applications
// GET /api/applications/my-tasks
exports.getMyApplications = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    const applications = await Application.find({ volunteer: volunteer._id })
      .populate({
        path: 'task',
        populate: {
          path: 'ngo',
          select: 'organizationName phone city registrationNumber'
        }
      })
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Error fetching volunteer applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all applications for a specific task (NGO owner only)
// GET /api/applications/task/:taskId
exports.getTaskApplications = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ user: req.user._id });
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO profile not found' });
    }

    const task = await Task.findOne({ _id: req.params.taskId, ngo: ngo._id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you are not authorized to view its applications'
      });
    }

    const applications = await Application.find({ task: req.params.taskId })
      .populate('volunteer', 'fullName phone city skills')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Error fetching task applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all applications across all tasks for this NGO
// GET /api/applications/ngo/all
exports.getAllNgoApplications = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ user: req.user._id });
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO profile not found' });
    }

    const tasks = await Task.find({ ngo: ngo._id });
    const taskIds = tasks.map(t => t._id);

    const applications = await Application.find({ task: { $in: taskIds } })
      .populate('volunteer', 'fullName phone city skills')
      .populate('task', 'title category eventDate estimatedHours status')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Error fetching NGO applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update volunteer application status (Assigned, Completed, Rejected)
// PUT /api/applications/:id/status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['Applied', 'Assigned', 'Completed', 'Rejected'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required: Applied, Assigned, Completed, Rejected'
      });
    }

    const ngo = await NGO.findOne({ user: req.user._id });
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO profile not found' });
    }

    const application = await Application.findById(req.params.id)
      .populate('task')
      .populate('volunteer');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify task ownership
    if (application.task.ngo.toString() !== ngo._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage applications for this task'
      });
    }

    const previousStatus = application.status;
    application.status = status;
    if (notes) application.notes = notes;

    // Headcount reconciliation
    const task = await Task.findById(application.task._id);

    if (previousStatus !== 'Assigned' && previousStatus !== 'Completed' && (status === 'Assigned' || status === 'Completed')) {
      if (task.volunteersAssigned >= task.volunteersRequired) {
        return res.status(400).json({
          success: false,
          message: 'Task quota is already full. Cannot assign additional volunteers.'
        });
      }
      task.volunteersAssigned += 1;
    } else if ((previousStatus === 'Assigned' || previousStatus === 'Completed') && status === 'Rejected') {
      task.volunteersAssigned = Math.max(0, task.volunteersAssigned - 1);
    }

    await task.save();
    await application.save();

    // Auto-generate Certificate upon completion
    let certificate = null;
    if (status === 'Completed') {
      const existingCert = await Certificate.findOne({
        volunteer: application.volunteer._id,
        task: task._id
      });

      if (!existingCert) {
        certificate = new Certificate({
          volunteer: application.volunteer._id,
          task: task._id,
          ngo: ngo._id,
          category: task.category,
          hoursServed: task.estimatedHours || 3
        });
        await certificate.save();
      }
    }

    res.json({
      success: true,
      message: `Application marked as ${status}`,
      application,
      certificate
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
