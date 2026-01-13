const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');

router.get('/notifications', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM [Notification] ORDER BY created_at DESC");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/notifications', async (req, res) => {
  try {
    const { title, type, content, location, event_date, is_urgent } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('title', sql.NVarChar, title);
    request.input('type', sql.NVarChar, type);
    request.input('content', sql.NVarChar, content);
    request.input('location', sql.NVarChar, location);
    request.input('event_date', sql.DateTime, event_date);
    request.input('is_urgent', sql.Bit, is_urgent || 0);
    
    const result = await request.query(`
      INSERT INTO [Notification] (title, type, content, location, event_date, is_urgent, created_at)
      OUTPUT INSERTED.id
      VALUES (@title, @type, @content, @location, @event_date, @is_urgent, GETDATE())
    `);
    res.json({ success: true, data: { id: result.recordset[0].id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/notifications/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.Int, req.params.id);
    await request.query("DELETE FROM [Notification] WHERE id = @id");
    res.json({ success: true, message: 'Đã xóa' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
