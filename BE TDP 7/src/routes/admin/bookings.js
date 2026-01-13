const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');

router.get('/bookings', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT b.*, u.full_name as user_name, f.name as facility_name
      FROM [FacilityBooking] b
      LEFT JOIN [AppUser] u ON b.user_id = u.id
      LEFT JOIN [Facility] f ON b.facility_id = f.id
      ORDER BY b.created_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.Int, req.params.id);
    request.input('status', sql.NVarChar, status);
    await request.query("UPDATE [FacilityBooking] SET status = @status WHERE id = @id");
    res.json({ success: true, message: 'Đã cập nhật' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
