const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const Task = require('../models/Task');
const Application = require('../models/Application');
const Certificate = require('../models/Certificate');
const { protect, requireVolunteer, requireNGO } = require('../middleware/authMiddleware');

// Volunteer Dashboard Metrics
// GET /api/dashboard/volunteer
router.get('/volunteer', protect, requireVolunteer, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.user.volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    // Total tasks completed and dynamic hours calculation from completed applications
    const completedApps = await Application.find({
      volunteerId: volunteer._id,
      status: 'Completed'
    }).populate('taskId');

    const completedCount = completedApps.length;
    let dynamicHours = 0;
    completedApps.forEach((app) => {
      if (app.taskId && app.taskId.hours) {
        dynamicHours += app.taskId.hours;
      }
    });

    const displayCount = completedCount > 0 ? completedCount : (volunteer.completedTasksCount || 0);
    const displayHours = dynamicHours > 0 ? dynamicHours : (volunteer.totalHours || 0);
    // 10 base points per task + 2 points per hour
    const displayPoints = (displayCount * 10) + (displayHours * 2);

    // Keep volunteer document synchronized in database
    if (volunteer.totalHours !== displayHours || volunteer.completedTasksCount !== displayCount || volunteer.rankingPoints !== displayPoints) {
      volunteer.totalHours = displayHours;
      volunteer.completedTasksCount = displayCount;
      volunteer.rankingPoints = displayPoints;
      await volunteer.save();
    }

    // Active assignments (Assigned or In Progress)
    const activeAssignments = await Application.find({
      volunteerId: volunteer._id,
      status: { $in: ['Applied', 'Assigned'] }
    }).populate('taskId');

    // Available opportunities (Open tasks)
    const availableOpportunities = await Task.countDocuments({ status: 'Open' });

    // Certificates earned
    const certificates = await Certificate.find({ volunteerId: volunteer._id })
      .populate('taskId', 'title category')
      .populate('ngoId', 'orgName');

    // Calculate volunteer ranking
    // Volunteers with higher ranking points get better rank
    const higherRankedCount = await Volunteer.countDocuments({
      rankingPoints: { $gt: volunteer.rankingPoints }
    });
    const currentRank = higherRankedCount + 1;

    res.json({
      success: true,
      stats: {
        fullName: volunteer.fullName,
        city: volunteer.city,
        skills: volunteer.skills,
        totalTasksCompleted: displayCount,
        activeAssignmentsCount: activeAssignments.length,
        availableOpportunities,
        totalHours: displayHours,
        rankingPoints: displayPoints,
        rank: currentRank,
        certificatesCount: certificates.length
      },
      activeAssignments,
      certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching volunteer dashboard data',
      error: error.message
    });
  }
});

// NGO Dashboard Metrics
// GET /api/dashboard/ngo
router.get('/ngo', protect, requireNGO, async (req, res) => {
  try {
    const ngo = await NGO.findById(req.user.ngoId);
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO profile not found' });
    }

    // Total tasks created by this NGO
    const totalTasks = await Task.countDocuments({ createdBy: ngo._id });

    // Active tasks (Open or In Progress)
    const activeTasks = await Task.countDocuments({
      createdBy: ngo._id,
      status: { $in: ['Open', 'In Progress'] }
    });

    // Completed tasks
    const completedTasks = await Task.countDocuments({
      createdBy: ngo._id,
      status: 'Completed'
    });

    // NGO's task IDs
    const myTasks = await Task.find({ createdBy: ngo._id }).sort({ createdAt: -1 });
    const taskIds = myTasks.map((t) => t._id);

    // Volunteer applications received
    const totalApplications = await Application.countDocuments({ taskId: { $in: taskIds } });
    const pendingApplications = await Application.countDocuments({
      taskId: { $in: taskIds },
      status: 'Applied'
    });

    // Number of unique volunteers assigned
    const assignedApplications = await Application.find({
      taskId: { $in: taskIds },
      status: { $in: ['Assigned', 'Completed'] }
    }).distinct('volunteerId');

    res.json({
      success: true,
      ngo: {
        orgName: ngo.orgName,
        registrationNumber: ngo.registrationNumber,
        city: ngo.city,
        contactPerson: ngo.contactPerson,
        phone: ngo.phone
      },
      stats: {
        totalTasksCreated: totalTasks,
        activeTasks,
        completedTasks,
        totalApplicationsReceived: totalApplications,
        pendingApplications,
        assignedVolunteersCount: assignedApplications.length
      },
      tasks: myTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching NGO dashboard data',
      error: error.message
    });
  }
});

// Impact Dashboard Analytics (Public)
// GET /api/dashboard/impact
router.get('/impact', async (req, res) => {
  try {
    const totalVolunteers = await Volunteer.countDocuments();
    const totalNGOs = await NGO.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Completed' });

    // Aggregate total hours served
    const volunteersHoursAgg = await Volunteer.aggregate([
      { $group: { _id: null, totalHours: { $sum: '$totalHours' } } }
    ]);
    const totalHoursServed = volunteersHoursAgg.length > 0 ? volunteersHoursAgg[0].totalHours : 0;

    // Category breakdown for Chart.js
    const categoryAgg = await Task.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categories = [
      'Education',
      'Food distribution',
      'Environment',
      'Elder support',
      'Disaster support',
      'Community service'
    ];

    const categoryData = categories.map((cat) => {
      const match = categoryAgg.find((c) => c._id === cat);
      return {
        category: cat,
        count: match ? match.count : 0
      };
    });

    // City distribution for Chart.js
    const cityAgg = await Task.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      metrics: {
        totalVolunteers,
        totalNGOs,
        totalTasks,
        completedTasks,
        totalHoursServed
      },
      categoryData,
      cityData: cityAgg
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching impact analytics',
      error: error.message
    });
  }
});

// Volunteer Ranking Leaderboard
// GET /api/dashboard/rankings
router.get('/rankings', async (req, res) => {
  try {
    const rankings = await Volunteer.find()
      .select('fullName city skills completedTasksCount totalHours rankingPoints')
      .sort({ rankingPoints: -1, totalHours: -1 })
      .limit(10);

    res.json({
      success: true,
      rankings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching volunteer rankings',
      error: error.message
    });
  }
});

module.exports = router;
