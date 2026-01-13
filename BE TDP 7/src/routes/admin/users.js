const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');

router.get('/users/pending', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT id, full_name, email, phone, status, created_at
      FROM [AppUser] WHERE status = 'pending' ORDER BY created_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/approve/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.NVarChar, req.params.id);
    await request.query("UPDATE [AppUser] SET status = 'active' WHERE id = @id");
    res.json({ success: true, message: 'Đã duyệt user' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
