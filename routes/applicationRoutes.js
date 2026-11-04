const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Task = require('../models/Task');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const Certificate = require('../models/Certificate');
const { protect, requireVolunteer, requireNGO } = require('../middleware/authMiddleware');

// Volunteer applies for a task
// POST /api/applications/apply
router.post('/apply', protect, requireVolunteer, async (req, res) => {
  try {
    const { taskId, notes } = req.body;

    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status === 'Completed' || task.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This task is no longer accepting applications' });
    }

    // Check if volunteer already applied
    const existingApp = await Application.findOne({
      taskId,
      volunteerId: req.user.volunteerId
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this task'
      });
    }

    const application = new Application({
      taskId,
      volunteerId: req.user.volunteerId,
      notes: notes || '',
      status: 'Applied'
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error submitting application',
      error: error.message
    });
  }
});

// Volunteer gets their applied and assigned tasks
// GET /api/applications/my-tasks
router.get('/my-tasks', protect, requireVolunteer, async (req, res) => {
  try {
    const applications = await Application.find({ volunteerId: req.user.volunteerId })
      .populate({
        path: 'taskId',
        populate: {
          path: 'createdBy',
          select: 'orgName city phone contactPerson'
        }
      })
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching volunteer tasks',
      error: error.message
    });
  }
});

// NGO gets all applications for a specific task
// GET /api/applications/task/:taskId
router.get('/task/:taskId', protect, requireNGO, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to task applicants' });
    }

    const applications = await Application.find({ taskId: req.params.taskId })
      .populate('volunteerId', 'fullName email phone city skills totalHours completedTasksCount')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      taskTitle: task.title,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching applicants',
      error: error.message
    });
  }
});

// NGO gets all incoming applications across all their tasks
// GET /api/applications/ngo/all
router.get('/ngo/all', protect, requireNGO, async (req, res) => {
  try {
    // Find all tasks created by this NGO
    const myTasks = await Task.find({ createdBy: req.user.ngoId }).select('_id');
    const taskIds = myTasks.map((t) => t._id);

    const applications = await Application.find({ taskId: { $in: taskIds } })
      .populate('taskId', 'title category dateTime city hours status')
      .populate('volunteerId', 'fullName phone city skills')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching NGO applications',
      error: error.message
    });
  }
});

// NGO updates application status (Assign, Reject, or Complete)
// PUT /api/applications/:id/status
router.put('/:id/status', protect, requireNGO, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Assigned', 'Completed', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const application = await Application.findById(req.params.id).populate('taskId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify NGO owns the task
    const task = await Task.findById(application.taskId._id);
    if (task.createdBy.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this application' });
    }

    const previousStatus = application.status;
    application.status = status;

    // Handle Assignment
    if (status === 'Assigned' && previousStatus !== 'Assigned') {
      task.volunteersAssigned = (task.volunteersAssigned || 0) + 1;
      if (task.status === 'Open') {
        task.status = 'In Progress';
      }
      await task.save();
    }

    // Handle Un-assignment / Rejection after assignment
    if (status === 'Rejected' && previousStatus === 'Assigned') {
      if (task.volunteersAssigned > 0) {
        task.volunteersAssigned -= 1;
      }
      if (task.volunteersAssigned === 0 && task.status === 'In Progress') {
        task.status = 'Open';
      }
      await task.save();
    }

    // Handle Task Completion for Volunteer
    if (status === 'Completed' && previousStatus !== 'Completed') {
      application.completedAt = new Date();

      // Update volunteer record (hours, completed count, ranking points)
      const volunteer = await Volunteer.findById(application.volunteerId);
      if (volunteer) {
        volunteer.completedTasksCount = (volunteer.completedTasksCount || 0) + 1;
        const taskHours = task.hours || 3;
        volunteer.totalHours = (volunteer.totalHours || 0) + taskHours;
        // 10 base points per task + 2 points per hour
        volunteer.rankingPoints = (volunteer.rankingPoints || 0) + (10 + taskHours * 2);
        await volunteer.save();

        // Check if certificate already exists, otherwise create it
        const existingCert = await Certificate.findOne({
          volunteerId: volunteer._id,
          taskId: task._id
        });

        if (!existingCert) {
          const timestamp = Date.now().toString().slice(-6);
          const certificateId = `CHH-CERT-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;

          const certificate = new Certificate({
            certificateId,
            volunteerId: volunteer._id,
            taskId: task._id,
            ngoId: task.createdBy,
            hoursCompleted: taskHours,
            issueDate: new Date()
          });
          await certificate.save();
        }
      }
    }

    await application.save();

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating application status',
      error: error.message
    });
  }
});

module.exports = router;
