const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');

router.get('/reports', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT r.*, u.full_name as user_name
      FROM [Report] r
      LEFT JOIN [AppUser] u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/stats', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT status, COUNT(*) as count
      FROM [Report]
      GROUP BY status
    `);
    
    // Format theo yêu cầu frontend: { pending, processing, resolved }
    const stats = {
      pending: 0,
      processing: 0,
      resolved: 0
    };
    
    result.recordset.forEach(row => {
      const status = row.status?.toLowerCase();
      if (status === 'pending') stats.pending = row.count;
      else if (status === 'processing') stats.processing = row.count;
      else if (status === 'resolved') stats.resolved = row.count;
    });
    
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/reports/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.Int, req.params.id);
    request.input('status', sql.NVarChar, status);
    await request.query("UPDATE [Report] SET status = @status WHERE id = @id");
    res.json({ success: true, message: 'Đã cập nhật' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/demographic-stats', async (req, res) => {
  try {
    const pool = await getPool();
    
    // Lấy counts
    const countsResult = await pool.request().query(`
      SELECT 
        SUM(CASE WHEN DATEDIFF(YEAR, dob, GETDATE()) < 18 THEN 1 ELSE 0 END) as children,
        SUM(CASE WHEN DATEDIFF(YEAR, dob, GETDATE()) BETWEEN 18 AND 60 THEN 1 ELSE 0 END) as voters,
        SUM(CASE WHEN DATEDIFF(YEAR, dob, GETDATE()) > 60 THEN 1 ELSE 0 END) as elderly,
        COUNT(*) as total
      FROM [HouseholdMember]
      WHERE dob IS NOT NULL
    `);
    
    // Lấy lists
    const childrenResult = await pool.request().query(`
      SELECT id, name, dob, gender, idCard
      FROM [HouseholdMember]
      WHERE DATEDIFF(YEAR, dob, GETDATE()) < 18 AND dob IS NOT NULL
      ORDER BY name
    `);
    
    const votersResult = await pool.request().query(`
      SELECT id, name, dob, gender, idCard
      FROM [HouseholdMember]
      WHERE DATEDIFF(YEAR, dob, GETDATE()) BETWEEN 18 AND 60 AND dob IS NOT NULL
      ORDER BY name
    `);
    
    const elderlyResult = await pool.request().query(`
      SELECT id, name, dob, gender, idCard
      FROM [HouseholdMember]
      WHERE DATEDIFF(YEAR, dob, GETDATE()) > 60 AND dob IS NOT NULL
      ORDER BY name
    `);
    
    const counts = countsResult.recordset[0] || { children: 0, voters: 0, elderly: 0, total: 0 };
    
    res.json({
      success: true,
      counts: {
        children: counts.children || 0,
        voters: counts.voters || 0,
        elderly: counts.elderly || 0,
        total: counts.total || 0
      },
      lists: {
        children: childrenResult.recordset || [],
        voters: votersResult.recordset || [],
        elderly: elderlyResult.recordset || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
