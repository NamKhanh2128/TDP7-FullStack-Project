const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Không tìm thấy token' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }

    const secretKey = process.env.JWT_SECRET || 'secret_mac_dinh';
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Chỉ Admin mới được phép' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
