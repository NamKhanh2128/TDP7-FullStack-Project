const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');

router.post('/reports', async (req, res) => {
  try {
    const { title, category, content } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('user_id', sql.NVarChar, req.user.id);
    request.input('title', sql.NVarChar, title);
    request.input('category', sql.NVarChar, category);
    request.input('content', sql.NVarChar, content);
    
    const result = await request.query(`
      INSERT INTO [Report] (user_id, title, category, content, status, created_at)
      OUTPUT INSERTED.id
      VALUES (@user_id, @title, @category, @content, 'Pending', GETDATE())
    `);
    res.json({ success: true, data: { id: result.recordset[0].id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/my-reports', async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('user_id', sql.NVarChar, req.user.id);
    const result = await request.query(`
      SELECT * FROM [Report] WHERE user_id = @user_id ORDER BY created_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
