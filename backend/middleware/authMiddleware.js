const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkisiz: Token yok.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
      ...decoded
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Yetkisiz: Token geçersiz.' });
  }
};

module.exports = authMiddleware;
