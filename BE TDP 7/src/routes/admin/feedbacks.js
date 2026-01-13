const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');

router.get('/feedbacks', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT f.*, u.full_name as user_name
      FROM [Feedback] f
      LEFT JOIN [AppUser] u ON f.user_id = u.id
      ORDER BY f.created_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/feedbacks/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.UniqueIdentifier, req.params.id);
    request.input('status', sql.NVarChar, status);
    await request.query("UPDATE [Feedback] SET status = @status WHERE id = @id");
    res.json({ success: true, message: 'Đã cập nhật' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
