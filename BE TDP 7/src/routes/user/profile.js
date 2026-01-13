const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');

router.get('/users/profile', async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.NVarChar, req.user.id);
    const result = await request.query(`
      SELECT id, full_name, email, phone, role, status, household_id, cccd, dob, gender, job, workplace
      FROM [AppUser] WHERE id = @id
    `);
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/profile', async (req, res) => {
  try {
    const { full_name, phone, dob, gender, cccd, job, workplace } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.NVarChar, req.user.id);
    request.input('full_name', sql.NVarChar, full_name);
    request.input('phone', sql.NVarChar, phone);
    request.input('dob', sql.Date, dob);
    request.input('gender', sql.NVarChar, gender);
    request.input('cccd', sql.NVarChar, cccd);
    request.input('job', sql.NVarChar, job);
    request.input('workplace', sql.NVarChar, workplace);
    
    await request.query(`
      UPDATE [AppUser]
      SET full_name = @full_name, phone = @phone, dob = @dob, gender = @gender, cccd = @cccd, job = @job, workplace = @workplace
      WHERE id = @id
    `);
    res.json({ success: true, message: 'Đã cập nhật' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
