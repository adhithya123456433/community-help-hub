const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const { protect } = require('../middleware/authMiddleware');

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
router.post('/register-volunteer', async (req, res) => {
  try {
    const { email, password, fullName, phone, city, skills } = req.body;

    // Check mandatory fields
    if (!email || !password || !fullName || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields: name, email, password, phone, and city'
      });
    }

    // Validate whitespace strings
    if (!fullName.trim() || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name and city cannot be empty or blank spaces'
      });
    }

    // Validate Email format
    const normalizedEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address (e.g. name@example.com)'
      });
    }

    // Validate Password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate Indian Phone Number
    const cleanedPhone = sanitizePhone(phone);
    if (!PHONE_REGEX.test(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number starting with 6, 7, 8, or 9'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // Create User record
    const user = new User({
      email: normalizedEmail,
      password,
      role: 'volunteer'
    });
    await user.save();

    // Parse skills if string
    let parsedSkills = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills;
    } else if (typeof skills === 'string') {
      parsedSkills = skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    }

    // Create Volunteer profile
    const volunteer = new Volunteer({
      userId: user._id,
      fullName: fullName.trim(),
      phone: cleanedPhone,
      city: city.trim(),
      skills: parsedSkills
    });
    await volunteer.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Volunteer registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: volunteer
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during volunteer registration',
      error: error.message
    });
  }
});

// NGO Registration
// POST /api/auth/register-ngo
router.post('/register-ngo', async (req, res) => {
  try {
    const { email, password, orgName, registrationNumber, contactPerson, phone, city, address } = req.body;

    // Check mandatory fields
    if (!email || !password || !orgName || !registrationNumber || !contactPerson || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory NGO fields'
      });
    }

    // Validate whitespace strings
    if (!orgName.trim() || !registrationNumber.trim() || !contactPerson.trim() || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Organization name, registration number, contact person, and city cannot be empty'
      });
    }

    // Validate Email format
    const normalizedEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid official email address'
      });
    }

    // Validate Password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate Indian Phone Number
    const cleanedPhone = sanitizePhone(phone);
    if (!PHONE_REGEX.test(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit contact mobile number starting with 6, 7, 8, or 9'
      });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // Check duplicate NGO Registration Number
    const cleanRegNumber = registrationNumber.trim().toUpperCase();
    const existingNGO = await NGO.findOne({ registrationNumber: cleanRegNumber });
    if (existingNGO) {
      return res.status(400).json({
        success: false,
        message: 'An organization with this NGO Registration Number already exists'
      });
    }

    // Create User record
    const user = new User({
      email: normalizedEmail,
      password,
      role: 'ngo'
    });
    await user.save();

    // Create NGO profile
    const ngo = new NGO({
      userId: user._id,
      orgName: orgName.trim(),
      registrationNumber: cleanRegNumber,
      contactPerson: contactPerson.trim(),
      phone: cleanedPhone,
      city: city.trim(),
      address: (address || '').trim()
    });
    await ngo.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'NGO registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: ngo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during NGO registration',
      error: error.message
    });
  }
});

// User Login (Volunteers, NGOs, Admins)
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Fetch corresponding profile
    let profile = null;
    if (user.role === 'volunteer') {
      profile = await Volunteer.findOne({ userId: user._id });
    } else if (user.role === 'ngo') {
      profile = await NGO.findOne({ userId: user._id });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Get Current User Profile
// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'volunteer') {
      profile = await Volunteer.findOne({ userId: user._id });
    } else if (user.role === 'ngo') {
      profile = await NGO.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
      error: error.message
    });
  }
});

// Update Volunteer Skills
// PUT /api/auth/volunteer/skills
router.put('/volunteer/skills', protect, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ success: false, message: 'Access restricted: Volunteers only' });
    }

    const { skills } = req.body;
    let parsedSkills = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills.map((s) => s.trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      parsedSkills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const volunteer = await Volunteer.findOneAndUpdate(
      { userId: req.user.userId },
      { skills: parsedSkills },
      { new: true }
    );

    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    res.json({
      success: true,
      message: 'Skills updated successfully',
      skills: volunteer.skills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating skills',
      error: error.message
    });
  }
});

module.exports = router;
