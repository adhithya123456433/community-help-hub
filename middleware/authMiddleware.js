const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');

// Middleware to verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'community_help_hub_jwt_secret_key_2026'
      );

      // Find user from decoded token
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Attach user and role-specific profile id to request object
      req.user = {
        userId: user._id,
        email: user.email,
        role: user.role
      };

      if (user.role === 'volunteer') {
        const volunteer = await Volunteer.findOne({ userId: user._id });
        if (volunteer) req.user.volunteerId = volunteer._id;
      } else if (user.role === 'ngo') {
        const ngo = await NGO.findOne({ userId: user._id });
        if (ngo) req.user.ngoId = ngo._id;
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }
};

// Middleware to restrict access to volunteers only
const requireVolunteer = (req, res, next) => {
  if (req.user && req.user.role === 'volunteer') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Volunteers only' });
  }
};

// Middleware to restrict access to NGOs only
const requireNGO = (req, res, next) => {
  if (req.user && req.user.role === 'ngo') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: NGOs only' });
  }
};

// Middleware to restrict access to Admins only
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admins only' });
  }
};

module.exports = {
  protect,
  requireVolunteer,
  requireNGO,
  requireAdmin
};
