const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // teacher
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  start_date: { type: Date },
  end_date: { type: Date },
  max_students: { type: Number, required: true },
  estimated_months: { type: Number, default: 1 },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // başvuran öğrenciler
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
