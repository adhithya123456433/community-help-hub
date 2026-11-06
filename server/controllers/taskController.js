const Task = require('../models/Task');
const NGO = require('../models/NGO');
const Volunteer = require('../models/Volunteer');
const Application = require('../models/Application');
const Certificate = require('../models/Certificate');
const VALID_CATEGORIES = [
  'Education',
  'Food distribution',
  'Environment',
  'Elder support',
  'Disaster support',
  'Community service'
];

const VALID_STATUSES = ['Open', 'In Progress', 'Completed', 'Cancelled'];

// Create a new task (NGO only)
// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      requiredSkills,
      location,
      city,
      dateTime,
      hours,
      volunteersRequired,
      urgency,
      targetBeneficiaries
    } = req.body;

    if (!title || !description || !category || !location || !city || !dateTime || !volunteersRequired) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory task fields: title, description, category, location, city, dateTime, and volunteersRequired'
      });
    }

    if (!title.trim() || !description.trim() || !location.trim() || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title, description, location, and city cannot be empty or blank spaces'
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid task category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
      });
    }

    const numVolunteers = Number(volunteersRequired);
    if (isNaN(numVolunteers) || numVolunteers < 1) {
      return res.status(400).json({
        success: false,
        message: 'Volunteers required must be a positive number of at least 1'
      });
    }

    const numHours = hours ? Number(hours) : 3;
    if (isNaN(numHours) || numHours < 1) {
      return res.status(400).json({
        success: false,
        message: 'Estimated hours must be a positive number of at least 1'
      });
    }

    const parsedDate = new Date(dateTime);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date and time for the community drive'
      });
    }

    // Parse required skills
    let parsedSkills = [];
    if (Array.isArray(requiredSkills)) {
      parsedSkills = requiredSkills.map((s) => s.trim()).filter((s) => s.length > 0);
    } else if (typeof requiredSkills === 'string') {
      parsedSkills = requiredSkills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    }

    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      category,
      requiredSkills: parsedSkills,
      location: location.trim(),
      city: city.trim(),
      dateTime: new Date(dateTime),
      hours: numHours,
      volunteersRequired: numVolunteers,
      urgency: urgency && ['Standard', 'High Priority', 'Urgent'].includes(urgency) ? urgency : 'Standard',
      targetBeneficiaries: (targetBeneficiaries && targetBeneficiaries.trim()) || 'Community Residents',
      createdBy: req.user.ngoId
    });

    if (urgency && ['Standard', 'High Priority', 'Urgent'].includes(urgency)) task.urgency = urgency;
    if (targetBeneficiaries && targetBeneficiaries.trim()) task.targetBeneficiaries = targetBeneficiaries.trim();

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating task',
      error: error.message
    });
  }
};

// Get all tasks with search and filtering
// GET /api/tasks
exports.getAllTasks = async (req, res) => {
  try {
    const { category, city, search, status } = req.query;
    let query = {};

    // Filter by status (default to Open if not specified, or allow All)
    if (status && status !== 'All') {
      query.status = status;
    } else if (!status) {
      query.status = { $in: ['Open', 'In Progress'] };
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by city
    if (city && city !== 'All') {
      const safeCity = city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.city = new RegExp(safeCity, 'i');
    }

    // Search keyword safely across title, description, location, city, category, and skills
    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { location: { $regex: safeSearch, $options: 'i' } },
        { city: { $regex: safeSearch, $options: 'i' } },
        { category: { $regex: safeSearch, $options: 'i' } },
        { requiredSkills: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'orgName registrationNumber phone city contactPerson')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching tasks',
      error: error.message
    });
  }
};

// Skill-Based Volunteer Matching
// GET /api/tasks/matching/skills
exports.getMatchingSkills = async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ success: false, message: 'Volunteers only' });
    }

    const volunteer = await Volunteer.findById(req.user.volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    const volunteerSkills = volunteer.skills.map((s) => s.toLowerCase().trim());
    const openTasks = await Task.find({ status: { $in: ['Open', 'In Progress'] } })
      .populate('createdBy', 'orgName city');

    // Calculate match score for each task
    const matchedTasks = openTasks.map((task) => {
      const taskSkills = task.requiredSkills.map((s) => s.toLowerCase().trim());

      let commonSkills = 0;
      taskSkills.forEach((skill) => {
        if (volunteerSkills.includes(skill)) {
          commonSkills++;
        }
      });

      // Calculate percentage match
      let matchScore = 0;
      if (taskSkills.length > 0) {
        matchScore = Math.round((commonSkills / taskSkills.length) * 100);
      } else {
        matchScore = 50; // Neutral score if no specific skills required
      }

      return {
        ...task.toObject(),
        matchScore,
        matchedSkillsCount: commonSkills
      };
    });

    // Sort by highest match score
    matchedTasks.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      volunteerSkills: volunteer.skills,
      tasks: matchedTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error computing skill match',
      error: error.message
    });
  }
};

// Location-Based Matching
// GET /api/tasks/matching/location
exports.getMatchingLocation = async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ success: false, message: 'Volunteers only' });
    }

    const volunteer = await Volunteer.findById(req.user.volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    // Find tasks in the same city as volunteer
    const cityTasks = await Task.find({
      city: new RegExp(`^${volunteer.city}$`, 'i'),
      status: { $in: ['Open', 'In Progress'] }
    }).populate('createdBy', 'orgName city phone');

    // Also fetch other tasks
    const otherTasks = await Task.find({
      city: { $not: new RegExp(`^${volunteer.city}$`, 'i') },
      status: { $in: ['Open', 'In Progress'] }
    }).populate('createdBy', 'orgName city phone');

    const localTasks = cityTasks.map((t) => ({
      ...t.toObject(),
      isLocalMatch: true
    }));

    const nonLocalTasks = otherTasks.map((t) => ({
      ...t.toObject(),
      isLocalMatch: false
    }));

    res.json({
      success: true,
      volunteerCity: volunteer.city,
      localCount: cityTasks.length,
      otherCount: otherTasks.length,
      localTasks,
      otherTasks: nonLocalTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching location matched tasks',
      error: error.message
    });
  }
};

// AI Task Recommendation
// GET /api/tasks/recommendations/ai
// Evaluates skills, user location, and previous volunteer applications to recommend best tasks
exports.getRecommendationsAI = async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ success: false, message: 'Volunteers only' });
    }

    const volunteer = await Volunteer.findById(req.user.volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    // Get previous applications of this volunteer to understand interest categories
    const pastApplications = await Application.find({ volunteerId: volunteer._id }).populate('taskId');
    const preferredCategories = {};
    pastApplications.forEach((app) => {
      if (app.taskId && app.taskId.category) {
        preferredCategories[app.taskId.category] = (preferredCategories[app.taskId.category] || 0) + 1;
      }
    });

    const openTasks = await Task.find({ status: 'Open' }).populate('createdBy', 'orgName city');
    const volunteerSkills = volunteer.skills.map((s) => s.toLowerCase().trim());
    const volunteerCity = volunteer.city.toLowerCase().trim();

    // Recommendation Scoring Engine
    const scoredTasks = openTasks.map((task) => {
      let score = 0;
      let reasons = [];

      // A. Skill Match Factor (Up to 40 points)
      const taskSkills = task.requiredSkills.map((s) => s.toLowerCase().trim());
      let matchedSkills = 0;
      taskSkills.forEach((skill) => {
        if (volunteerSkills.includes(skill)) matchedSkills++;
      });
      if (taskSkills.length > 0 && matchedSkills > 0) {
        const skillPercentage = matchedSkills / taskSkills.length;
        score += Math.round(skillPercentage * 40);
        reasons.push(`Matches ${matchedSkills} of your skills`);
      }

      // B. Location Proximity Factor (Up to 30 points)
      if (task.city.toLowerCase().trim() === volunteerCity) {
        score += 30;
        reasons.push(`Located in your city (${volunteer.city})`);
      }

      // C. Category Interest Factor (Up to 20 points)
      if (preferredCategories[task.category]) {
        score += 20;
        reasons.push(`Aligns with your interest in ${task.category}`);
      }

      // D. Urgency / Availability Factor (10 points)
      if (task.volunteersAssigned < task.volunteersRequired) {
        score += 10;
      }

      return {
        ...task.toObject(),
        recommendationScore: score,
        recommendationReasons: reasons
      };
    });

    // Sort by recommendation score descending
    scoredTasks.sort((a, b) => b.recommendationScore - a.recommendationScore);

    res.json({
      success: true,
      recommendations: scoredTasks.slice(0, 6)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error generating AI recommendations',
      error: error.message
    });
  }
};

// Get single task by ID
// GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      'createdBy',
      'orgName registrationNumber phone city contactPerson address'
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching task details',
      error: error.message
    });
  }
};

// Update task (NGO owner only)
// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Verify task ownership
    if (task.createdBy.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this task' });
    }

    // Update fields
    const {
      title,
      description,
      category,
      requiredSkills,
      location,
      city,
      dateTime,
      hours,
      volunteersRequired,
      status,
      urgency,
      targetBeneficiaries
    } = req.body;

    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid task category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
        });
      }
      task.category = category;
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid task status. Must be one of: ${VALID_STATUSES.join(', ')}`
        });
      }
      task.status = status;
    }

    if (title && title.trim()) task.title = title.trim();
    if (description && description.trim()) task.description = description.trim();
    if (location && location.trim()) task.location = location.trim();
    if (city && city.trim()) task.city = city.trim();
    if (dateTime) task.dateTime = new Date(dateTime);
    if (hours) {
      const numHours = Number(hours);
      if (!isNaN(numHours) && numHours >= 1) task.hours = numHours;
    }
    if (volunteersRequired) {
      const numVolunteers = Number(volunteersRequired);
      if (!isNaN(numVolunteers) && numVolunteers >= 1) {
        if (numVolunteers < (task.volunteersAssigned || 0)) {
          return res.status(400).json({
            success: false,
            message: `Cannot reduce volunteers required to ${numVolunteers} because ${task.volunteersAssigned} volunteers are already assigned.`
          });
        }
        task.volunteersRequired = numVolunteers;
      }
    }

    if (requiredSkills) {
      if (Array.isArray(requiredSkills)) {
        task.requiredSkills = requiredSkills;
      } else if (typeof requiredSkills === 'string') {
        task.requiredSkills = requiredSkills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      }
    }

    if (urgency && ['Standard', 'High Priority', 'Urgent'].includes(urgency)) task.urgency = urgency;
    if (targetBeneficiaries && targetBeneficiaries.trim()) task.targetBeneficiaries = targetBeneficiaries.trim();

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating task',
      error: error.message
    });
  }
};

// Delete task (NGO owner only)
// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Verify ownership
    if (task.createdBy.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    // Remove associated applications and certificates
    await Application.deleteMany({ taskId: task._id });
    await Certificate.deleteMany({ taskId: task._id });

    // Delete task
    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task and related applications deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting task',
      error: error.message
    });
  }
};
