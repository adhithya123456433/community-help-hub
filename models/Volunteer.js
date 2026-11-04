const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit mobile number']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    minlength: [2, 'City name must be at least 2 characters']
  },
  skills: {
    type: [String],
    default: []
  },
  completedTasksCount: {
    type: Number,
    default: 0
  },
  totalHours: {
    type: Number,
    default: 0
  },
  rankingPoints: {
    type: Number,
    default: 0
  },
  badgeTier: {
    type: String,
    enum: ['Bronze Tier', 'Silver Tier', 'Gold Champion'],
    default: 'Bronze Tier'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
