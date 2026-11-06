const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const Task = require('../models/Task');
const Application = require('../models/Application');
const Certificate = require('../models/Certificate');

// Volunteer Dashboard
// GET /api/dashboard/volunteer
exports.getVolunteerDashboard = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    const applications = await Application.find({ volunteer: volunteer._id })
      .populate({
        path: 'task',
        select: 'title category eventDate estimatedHours status address city ngo',
        populate: {
          path: 'ngo',
          select: 'organizationName phone city'
        }
      })
      .sort({ appliedAt: -1 });

    const totalApplied = applications.length;
    const assignedTasks = applications.filter(a => a.status === 'Assigned').length;
    const completedTasks = applications.filter(a => a.status === 'Completed').length;
    
    // Dynamic calculate verified hours
    let hoursServed = 0;
    applications.forEach(a => {
      if (a.status === 'Completed' && a.task && a.task.estimatedHours) {
        hoursServed += a.task.estimatedHours;
      }
    });

    const certificatesCount = await Certificate.countDocuments({ volunteer: volunteer._id });

    // Category breakdown
    const categoryBreakdown = {};
    applications.forEach(a => {
      if (a.task && a.task.category) {
        categoryBreakdown[a.task.category] = (categoryBreakdown[a.task.category] || 0) + 1;
      }
    });

    res.json({
      success: true,
      stats: {
        totalApplied,
        assignedTasks,
        completedTasks,
        hoursServed,
        certificatesEarned: certificatesCount
      },
      categoryBreakdown,
      volunteer: {
        id: volunteer._id,
        fullName: volunteer.fullName,
        city: volunteer.city,
        skills: volunteer.skills
      },
      recentApplications: applications.slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching volunteer dashboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// NGO Dashboard
// GET /api/dashboard/ngo
exports.getNgoDashboard = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ user: req.user._id });
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO profile not found' });
    }

    const tasks = await Task.find({ ngo: ngo._id }).sort({ createdAt: -1 });
    const taskIds = tasks.map(t => t._id);

    const applications = await Application.find({ task: { $in: taskIds } })
      .populate('volunteer', 'fullName phone city skills')
      .populate('task', 'title category eventDate status')
      .sort({ appliedAt: -1 });

    const totalTasks = tasks.length;
    const activeDrives = tasks.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const completedDrives = tasks.filter(t => t.status === 'Completed').length;
    const totalApplications = applications.length;
    const assignedVolunteers = applications.filter(a => a.status === 'Assigned' || a.status === 'Completed').length;

    res.json({
      success: true,
      stats: {
        totalTasks,
        activeDrives,
        completedDrives,
        totalApplications,
        assignedVolunteers
      },
      ngo: {
        id: ngo._id,
        organizationName: ngo.organizationName,
        registrationNumber: ngo.registrationNumber,
        city: ngo.city,
        contactPerson: ngo.contactPerson
      },
      recentTasks: tasks.slice(0, 5),
      recentApplications: applications.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching NGO dashboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Public Platform Impact Analytics
// GET /api/dashboard/impact
exports.getImpactMetrics = async (req, res) => {
  try {
    const totalVolunteers = await Volunteer.countDocuments();
    const totalNGOs = await NGO.countDocuments();
    const totalTasks = await Task.countDocuments();
    
    // Calculate total verified hours platform-wide
    const completedApps = await Application.find({ status: 'Completed' })
      .populate('task', 'estimatedHours');

    let totalHoursServed = 0;
    completedApps.forEach(a => {
      if (a.task && a.task.estimatedHours) {
        totalHoursServed += a.task.estimatedHours;
      }
    });

    // Category distribution
    const categoryDistribution = await Task.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // City distribution
    const cityDistribution = await Task.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    const certificatesIssued = await Certificate.countDocuments();

    res.json({
      success: true,
      impact: {
        registeredVolunteers: totalVolunteers,
        partnerNGOs: totalNGOs,
        totalTasksPublished: totalTasks,
        verifiedHoursServed: totalHoursServed,
        certificatesIssued
      },
      categoryDistribution: categoryDistribution.map(c => ({ category: c._id, count: c.count })),
      cityDistribution: cityDistribution.map(c => ({ city: c._id, count: c.count }))
    });
  } catch (error) {
    console.error('Error fetching platform impact metrics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Volunteer Leaderboard & Recognition
// GET /api/dashboard/rankings
exports.getRankings = async (req, res) => {
  try {
    // Dynamic calculate verified hours from completed applications
    const completedApps = await Application.find({ status: 'Completed' })
      .populate('volunteer', 'fullName city skills')
      .populate('task', 'estimatedHours');

    const volunteerMap = {};

    completedApps.forEach(app => {
      if (!app.volunteer) return;
      const vId = app.volunteer._id.toString();
      if (!volunteerMap[vId]) {
        volunteerMap[vId] = {
          volunteerId: vId,
          fullName: app.volunteer.fullName,
          city: app.volunteer.city,
          skills: app.volunteer.skills || [],
          completedTasks: 0,
          hoursServed: 0
        };
      }
      volunteerMap[vId].completedTasks += 1;
      volunteerMap[vId].hoursServed += (app.task && app.task.estimatedHours) ? app.task.estimatedHours : 0;
    });

    const rankings = Object.values(volunteerMap)
      .sort((a, b) => b.hoursServed - a.hoursServed || b.completedTasks - a.completedTasks)
      .slice(0, 15);

    res.json({
      success: true,
      count: rankings.length,
      rankings
    });
  } catch (error) {
    console.error('Error calculating volunteer rankings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
