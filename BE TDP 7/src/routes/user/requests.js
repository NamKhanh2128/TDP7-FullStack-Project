const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');

router.post('/requests', async (req, res) => {
  try {
    const { type, reason, start_date, end_date } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('user_id', sql.NVarChar, req.user.id);
    request.input('type', sql.NVarChar, type);
    request.input('reason', sql.NVarChar, reason);
    request.input('start_date', sql.DateTime, start_date);
    request.input('end_date', sql.DateTime, end_date);
    
    const result = await request.query(`
      INSERT INTO [RegistrationRequest] (user_id, type, reason, start_date, end_date, status, created_at)
      OUTPUT INSERTED.id
      VALUES (@user_id, @type, @reason, @start_date, @end_date, 'Pending', GETDATE())
    `);
    res.json({ success: true, data: { id: result.recordset[0].id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/requests/my-requests', async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('user_id', sql.NVarChar, req.user.id);
    const result = await request.query(`
      SELECT * FROM [RegistrationRequest] WHERE user_id = @user_id ORDER BY created_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/requests/my-requests/:id', async (req, res) => {
  try {
    const { reason, start_date, end_date } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.UniqueIdentifier, req.params.id);
    request.input('user_id', sql.NVarChar, req.user.id);
    request.input('reason', sql.NVarChar, reason);
    request.input('start_date', sql.DateTime, start_date);
    request.input('end_date', sql.DateTime, end_date);
    
    await request.query(`
      UPDATE [RegistrationRequest]
      SET reason = @reason, start_date = @start_date, end_date = @end_date
      WHERE id = @id AND user_id = @user_id AND status = 'Pending'
    `);
    res.json({ success: true, message: 'Đã cập nhật' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
