const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Bildirimin hedefi
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Bildirime konu olan kullanıcı (örn. başvuran öğrenci)
  message: { type: String, required: true },
  type: { type: String, enum: ['project', 'application', 'other'], default: 'other' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
