const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');

// Helper function to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'community_help_hub_jwt_secret_key_2026',
    { expiresIn: '7d' }
  );
};

// Helper validation utilities
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

const sanitizePhone = (phone) => {
  if (!phone) return '';
  let cleaned = phone.toString().replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  }
  return cleaned;
};

// Volunteer Registration
// POST /api/auth/register-volunteer
exports.registerVolunteer = async (req, res) => {
  try {
    const { email, password, fullName, phone, city, skills } = req.body;

    if (!email || !password || !fullName || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields: name, email, password, phone, and city'
      });
    }

    if (!fullName.trim() || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name and city cannot be empty or blank spaces'
      });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address (e.g., student@kct.ac.in)'
      });
    }

    const cleanPhone = sanitizePhone(phone);
    if (!PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      role: 'VOLUNTEER'
    });
    await user.save();

    let skillsArray = [];
    if (skills) {
      if (Array.isArray(skills)) {
        skillsArray = skills;
      } else if (typeof skills === 'string') {
        skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const volunteer = new Volunteer({
      user: user._id,
      fullName: fullName.trim(),
      phone: cleanPhone,
      city: city.trim(),
      skills: skillsArray
    });
    await volunteer.save();

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Volunteer account registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: {
          fullName: volunteer.fullName,
          phone: volunteer.phone,
          city: volunteer.city,
          skills: volunteer.skills
        }
      }
    });
  } catch (error) {
    console.error('[AUTH ERROR] register-volunteer:', error);
    return res.status(500).json({
      success: false,
      message: 'Error registering volunteer account',
      error: error.message
    });
  }
};

// NGO Partner Registration
// POST /api/auth/register-ngo
exports.registerNGO = async (req, res) => {
  try {
    const { email, password, organizationName, registrationNumber, contactPerson, phone, city } = req.body;

    if (!email || !password || !organizationName || !registrationNumber || !contactPerson || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields for NGO partner registration'
      });
    }

    if (!organizationName.trim() || !contactPerson.trim() || !city.trim() || !registrationNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Organization name, registration number, contact person, and city cannot be empty'
      });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid official NGO email address'
      });
    }

    const cleanPhone = sanitizePhone(phone);
    if (!PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian phone number for NGO coordinator'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const existingNgo = await NGO.findOne({
      registrationNumber: registrationNumber.trim().toUpperCase()
    });
    if (existingNgo) {
      return res.status(400).json({
        success: false,
        message: 'An NGO with this Government Registration Number is already registered on CommunityHelp Hub'
      });
    }

    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      role: 'NGO'
    });
    await user.save();

    const ngo = new NGO({
      user: user._id,
      organizationName: organizationName.trim(),
      registrationNumber: registrationNumber.trim().toUpperCase(),
      contactPerson: contactPerson.trim(),
      phone: cleanPhone,
      city: city.trim()
    });
    await ngo.save();

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'NGO organization registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: {
          organizationName: ngo.organizationName,
          registrationNumber: ngo.registrationNumber,
          contactPerson: ngo.contactPerson,
          phone: ngo.phone,
          city: ngo.city
        }
      }
    });
  } catch (error) {
    console.error('[AUTH ERROR] register-ngo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error registering NGO organization',
      error: error.message
    });
  }
};

// User Login (Volunteer, NGO, Admin)
// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    let profile = null;
    if (user.role === 'VOLUNTEER') {
      profile = await Volunteer.findOne({ user: user._id });
    } else if (user.role === 'NGO') {
      profile = await NGO.findOne({ user: user._id });
    }

    const token = generateToken(user._id, user.role);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile
      }
    });
  } catch (error) {
    console.error('[AUTH ERROR] login:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Get Current User Profile
// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'VOLUNTEER') {
      profile = await Volunteer.findOne({ user: user._id });
    } else if (user.role === 'NGO') {
      profile = await NGO.findOne({ user: user._id });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile
      }
    });
  } catch (error) {
    console.error('[AUTH ERROR] me:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile data',
      error: error.message
    });
  }
};

// Update Volunteer Skills
// PUT /api/auth/volunteer/skills
exports.updateVolunteerSkills = async (req, res) => {
  try {
    if (req.user.role !== 'VOLUNTEER') {
      return res.status(403).json({
        success: false,
        message: 'Only volunteers can update skills'
      });
    }

    const { skills, city } = req.body;
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer profile not found'
      });
    }

    if (skills) {
      if (Array.isArray(skills)) {
        volunteer.skills = skills;
      } else if (typeof skills === 'string') {
        volunteer.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    if (city && city.trim()) {
      volunteer.city = city.trim();
    }

    await volunteer.save();

    return res.json({
      success: true,
      message: 'Volunteer profile updated successfully',
      volunteer
    });
  } catch (error) {
    console.error('[AUTH ERROR] update-skills:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};
