const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student'], required: true },
  university: { type: String },
  department: { type: String },
  title: { type: String },
  class: { type: String },
  about: { type: String },
  skills: { type: [String], default: [] },
  links: { type: Object, default: {} }, // { linkedin: '', github: '', website: '' }
  avatar_url: { type: String },
  cv_url: { type: String },
  created_at: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
