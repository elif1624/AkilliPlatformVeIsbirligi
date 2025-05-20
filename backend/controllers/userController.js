const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

// Profilini getir
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Profilini güncelle
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    // Şifre güncellenmek istenirse engelle (ayrı endpoint ile yapılmalı)
    if (updates.password) delete updates.password;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true, select: '-password' }
    );
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Avatar yükle/güncelle
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Dosya yok' });
    const user = await User.findById(req.user.userId);
    user.avatar_url = `/uploads/avatars/${req.file.filename}`;
    await user.save();
    res.json({ avatar_url: user.avatar_url });
  } catch (err) {
    res.status(500).json({ message: 'Avatar güncellenemedi', error: err.message });
  }
};

// Avatar sil
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.avatar_url = null;
    await user.save();
    res.json({ message: 'Avatar silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Avatar silinemedi', error: err.message });
  }
};

// Kullanıcının bildirimlerini getir
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId }).sort({ created_at: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Bildirimler alınamadı', error: err.message });
  }
};

// Tek bildirimi okundu işaretle
exports.markNotificationRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, user: req.user.userId });
    if (!notif) return res.status(404).json({ message: 'Bildirim bulunamadı' });
    notif.read = true;
    await notif.save();
    res.json({ message: 'Bildirim okundu olarak işaretlendi' });
  } catch (err) {
    res.status(500).json({ message: 'Bildirim güncellenemedi', error: err.message });
  }
};

// Tüm bildirimleri okundu işaretle
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.userId, read: false }, { $set: { read: true } });
    res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (err) {
    res.status(500).json({ message: 'Bildirimler güncellenemedi', error: err.message });
  }
};

// Tüm kullanıcıları getir (role ve arama ile)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { surname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Kullanıcılar alınamadı', error: err.message });
  }
};

// Belirli bir kullanıcıyı id ile getir (public profil)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// CV yükle
exports.uploadCv = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Dosya yok' });
    const user = await User.findById(req.user.userId);
    user.cv_url = `/uploads/cv/${req.file.filename}`;
    await user.save();
    res.json({ cv_url: user.cv_url });
  } catch (err) {
    res.status(500).json({ message: 'CV yüklenemedi', error: err.message });
  }
};

// CV sil
exports.deleteCv = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.cv_url) {
      return res.status(404).json({ message: 'CV bulunamadı.' });
    }
    // Dosya yolunu belirle
    const filePath = path.join(__dirname, '..', user.cv_url.startsWith('/') ? user.cv_url : '/' + user.cv_url);
    // Kullanıcıdan cv_url bilgisini sil
    user.cv_url = null;
    await user.save();
    // Dosyayı sil (varsa)
    fs.unlink(filePath, (err) => {
      // Dosya yoksa bile hata vermesin
    });
    res.json({ message: 'CV silindi.' });
  } catch (err) {
    res.status(500).json({ message: 'CV silinemedi', error: err.message });
  }
};
