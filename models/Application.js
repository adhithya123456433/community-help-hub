const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer',
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Assigned', 'Completed', 'Rejected'],
    default: 'Applied'
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Avoid duplicate applications by same volunteer for same task
applicationSchema.index({ taskId: 1, volunteerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
