const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  is_mentor: { type: Boolean, default: false },
  message: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
