const jwt = require('jsonwebtoken');
const supabase = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Authentication token bulunamadı');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Supabase'den kullanıcıyı kontrol et
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Lütfen giriş yapın', error: error.message });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz bulunmamaktadır' });
    }
    next();
  };
};

module.exports = { auth, checkRole }; 