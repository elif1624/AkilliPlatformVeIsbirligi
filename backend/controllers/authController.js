const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Kullanıcı kaydı
exports.register = async (req, res) => {
  try {
    const { name, surname, email, password, role } = req.body;
    // Zorunlu alan kontrolü
    if (!name || !surname || !email || !password || !role) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
    }
    // Kullanıcı var mı?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta ile kayıtlı kullanıcı var.' });
    }
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    // Yeni kullanıcı oluştur
    const user = new User({
      name,
      surname,
      email,
      password: hashedPassword,
      role
    });
    await user.save();
    res.status(201).json({ message: 'Kayıt başarılı.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'E-posta ve şifre zorunludur.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Şifre hatalı.' });
    }
    // JWT token oluştur
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Şifremi Unuttum (Kod ile)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'E-posta zorunludur.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.' });
    // 6 haneli kod üret
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 10; // 10 dakika geçerli
    await user.save();
    // Kod ile e-posta gönder
    const transporter = require('nodemailer').createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'MindMesh Şifre Sıfırlama Kodu',
      html: `<p>Şifre sıfırlama kodunuz: <b>${code}</b><br>Kod 10 dakika geçerlidir.</p>`
    }, (err, info) => {
      if (err) {
        console.error('Mail gönderim hatası:', err);
      } else {
        console.log('Mail gönderildi:', info.response);
      }
    });
    res.json({ message: 'Şifre sıfırlama kodu e-posta adresinize gönderildi.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Şifre Sıfırlama Kodu Doğrulama ve Şifre Güncelleme
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
    const user = await User.findOne({ email, resetPasswordCode: code, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Kod hatalı veya süresi dolmuş.' });
    user.password = await require('bcryptjs').hash(password, 10);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Şifre başarıyla güncellendi.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};
