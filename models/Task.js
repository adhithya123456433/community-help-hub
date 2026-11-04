const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Education',
      'Food distribution',
      'Environment',
      'Elder support',
      'Disaster support',
      'Community service'
    ]
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    required: [true, 'Location area is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  dateTime: {
    type: Date,
    required: [true, 'Date and time is required']
  },
  hours: {
    type: Number,
    required: [true, 'Estimated hours are required'],
    default: 3
  },
  volunteersRequired: {
    type: Number,
    required: [true, 'Number of volunteers required is required'],
    min: 1
  },
  volunteersAssigned: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Open'
  },
  urgency: {
    type: String,
    enum: ['Standard', 'High Priority', 'Urgent'],
    default: 'Standard'
  },
  targetBeneficiaries: {
    type: String,
    default: 'Community Residents'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', taskSchema);
