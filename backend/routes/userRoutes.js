const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer storage ayarı
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.userId + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

const cvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/cv'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.userId + '-cv-' + Date.now() + ext);
  }
});
const uploadCv = multer({ storage: cvStorage });

// Profilini getir
router.get('/me', authMiddleware, userController.getProfile);
// Profilini güncelle
router.put('/me', authMiddleware, userController.updateProfile);
// Avatar yükle/güncelle
router.put('/me/avatar', authMiddleware, upload.single('avatar'), userController.updateAvatar);
// Avatar sil
router.delete('/me/avatar', authMiddleware, userController.deleteAvatar);
// Bildirimler
router.get('/me/notifications', authMiddleware, userController.getNotifications);
router.patch('/me/notifications/:id/read', authMiddleware, userController.markNotificationRead);
router.patch('/me/notifications/read', authMiddleware, userController.markAllNotificationsRead);
// Tüm kullanıcıları getir (role ve arama destekli)
router.get('/', authMiddleware, userController.getAllUsers);
// Belirli bir kullanıcıyı id ile getir (public profil)
router.get('/:id', userController.getUserById);
// CV yükle
router.post('/upload-cv', authMiddleware, uploadCv.single('cv'), userController.uploadCv);
// CV sil
router.delete('/delete-cv', authMiddleware, userController.deleteCv);

module.exports = router;
