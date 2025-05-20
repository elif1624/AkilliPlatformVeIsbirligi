const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register
router.post('/register', authController.register);
// Login
router.post('/login', authController.login);
// Şifremi Unuttum
router.post('/forgot-password', authController.forgotPassword);
// Şifre Sıfırlama Kodu Doğrulama
router.post('/verify-reset-code', authController.verifyResetCode);

module.exports = router;
