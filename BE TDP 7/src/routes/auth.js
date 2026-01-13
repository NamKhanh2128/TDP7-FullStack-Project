const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getPool, sql } = require('../config/dbConfig');
const { verifyToken } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;
    if (!full_name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const pool = await getPool();
    const request = pool.request();
    request.input('email', sql.NVarChar, email.toLowerCase().trim());
    
    const exists = await request.query("SELECT id FROM [AppUser] WHERE LOWER(email) = LOWER(@email)");
    if (exists.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const secretKey = process.env.JWT_SECRET || 'secret_mac_dinh';

    const insertRequest = pool.request();
    insertRequest.input('id', sql.NVarChar, userId);
    insertRequest.input('full_name', sql.NVarChar, full_name.trim());
    insertRequest.input('email', sql.NVarChar, email.toLowerCase().trim());
    insertRequest.input('password', sql.NVarChar, hashedPassword);
    insertRequest.input('phone', sql.NVarChar, phone.trim());
    insertRequest.input('role', sql.NVarChar, 'user');
    insertRequest.input('status', sql.NVarChar, 'pending');

    await insertRequest.query(`
      INSERT INTO [AppUser] (id, full_name, email, password, phone, role, status, created_at)
      VALUES (@id, @full_name, @email, @password, @phone, @role, @status, GETDATE())
    `);

    const token = jwt.sign({ id: userId, role: 'user' }, secretKey, { expiresIn: '1d' });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      accessToken: token,
      user: { id: userId, full_name, email, role: 'user', status: 'pending' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const pool = await getPool();
    const request = pool.request();
    request.input('email', sql.NVarChar, email.toLowerCase().trim());
    
    const result = await request.query("SELECT * FROM [AppUser] WHERE LOWER(email) = LOWER(@email)");
    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'Email không tồn tại' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mật khẩu không đúng' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Tài khoản đang chờ phê duyệt', status: 'pending' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị vô hiệu hóa' });
    }

    const secretKey = process.env.JWT_SECRET || 'secret_mac_dinh';
    const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: '1d' });

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      accessToken: token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
        household_id: user.household_id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.NVarChar, req.user.id);
    
    const result = await request.query(`
      SELECT id, full_name, email, phone, role, avatar, status, household_id, created_at
      FROM [AppUser] WHERE id = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Change password
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới' });
    }

    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.NVarChar, req.user.id);
    
    const result = await request.query("SELECT password FROM [AppUser] WHERE id = @id");
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    const isMatch = await bcrypt.compare(currentPassword, result.recordset[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updateRequest = pool.request();
    updateRequest.input('id', sql.NVarChar, req.user.id);
    updateRequest.input('password', sql.NVarChar, hashedNewPassword);
    
    await updateRequest.query("UPDATE [AppUser] SET password = @password WHERE id = @id");

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
