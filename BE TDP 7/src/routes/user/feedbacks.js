const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');

router.post('/feedbacks', async (req, res) => {
  try {
    const { title, content } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('user_id', sql.NVarChar, req.user.id);
    request.input('title', sql.NVarChar, title);
    request.input('content', sql.NVarChar, content);
    
    const result = await request.query(`
      INSERT INTO [Feedback] (user_id, title, content, status, created_at)
      OUTPUT INSERTED.id
      VALUES (@user_id, @title, @content, 'Pending', GETDATE())
    `);
    res.json({ success: true, data: { id: result.recordset[0].id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/feedbacks/stats', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT status, COUNT(*) as count
      FROM [Feedback]
      GROUP BY status
    `);
    
    // Format theo yêu cầu frontend: { pending, reviewed, resolved }
    const stats = {
      pending: 0,
      reviewed: 0,
      resolved: 0
    };
    
    result.recordset.forEach(row => {
      const status = row.status?.toLowerCase();
      if (status === 'pending') stats.pending = row.count;
      else if (status === 'reviewed') stats.reviewed = row.count;
      else if (status === 'resolved') stats.resolved = row.count;
    });
    
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
