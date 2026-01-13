const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');

router.post('/bookings', async (req, res) => {
  try {
    const { facility_id, booking_date, start_time, end_time, purpose, attendees_count } = req.body;
    if (!facility_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    }

    const pool = await getPool();
    const request = pool.request();
    request.input('user_id', sql.NVarChar, req.user.id);
    request.input('facility_id', sql.Int, facility_id);
    request.input('booking_date', sql.Date, booking_date);
    request.input('start_time', sql.Time, start_time);
    request.input('end_time', sql.Time, end_time);
    request.input('purpose', sql.NVarChar, purpose);
    request.input('attendees_count', sql.Int, attendees_count || 1);
    
    const result = await request.query(`
      INSERT INTO [FacilityBooking] (user_id, facility_id, booking_date, start_time, end_time, purpose, attendees_count, status, created_at)
      OUTPUT INSERTED.id
      VALUES (@user_id, @facility_id, @booking_date, @start_time, @end_time, @purpose, @attendees_count, 'Pending', GETDATE())
    `);
    res.json({ success: true, data: { id: result.recordset[0].id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/bookings/my-bookings', async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('user_id', sql.NVarChar, req.user.id);
    const result = await request.query(`
      SELECT b.*, f.name as facility_name, f.location as facility_location
      FROM [FacilityBooking] b
      LEFT JOIN [Facility] f ON b.facility_id = f.id
      WHERE b.user_id = @user_id
      ORDER BY b.created_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
