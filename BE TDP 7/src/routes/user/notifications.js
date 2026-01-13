const express = require('express');
const router = express.Router();
const { getPool } = require('../../config/dbConfig');

router.get('/notifications', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM [Notification] ORDER BY created_at DESC");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
