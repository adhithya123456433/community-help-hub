const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Volunteer Registration
router.post('/register-volunteer', authController.registerVolunteer);

// NGO Partner Registration
router.post('/register-ngo', authController.registerNGO);

// User Login (Volunteer, NGO, Admin)
router.post('/login', authController.login);

// Get Current User Profile
router.get('/me', protect, authController.getMe);

// Update Volunteer Skills
router.put('/volunteer/skills', protect, authController.updateVolunteerSkills);

module.exports = router;
