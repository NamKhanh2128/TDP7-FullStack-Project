const express = require('express');
const router = express.Router();
const { getPool } = require('../../config/dbConfig');

router.get('/dashboard/stats', async (req, res) => {
  try {
    const pool = await getPool();
    
    // Lấy các số liệu cơ bản
    const [households, members, requests, tamTru] = await Promise.all([
      pool.request().query("SELECT COUNT(*) as count FROM [Household]"),
      pool.request().query("SELECT COUNT(*) as count FROM [HouseholdMember]"),
      pool.request().query("SELECT COUNT(*) as count FROM [RegistrationRequest] WHERE status = 'Pending'"),
      pool.request().query("SELECT COUNT(*) as count FROM [RegistrationRequest] WHERE type = 'TamTru' AND status = 'Pending'")
    ]);

    // Lấy thống kê giới tính
    const genderResult = await pool.request().query(`
      SELECT 
        CASE 
          WHEN gender = 'Nam' OR gender = 'nam' THEN 'Nam'
          WHEN gender = 'Nữ' OR gender = 'nữ' THEN 'Nữ'
          ELSE 'Khác'
        END as gender,
        COUNT(*) as count
      FROM [HouseholdMember]
      WHERE gender IS NOT NULL
      GROUP BY 
        CASE 
          WHEN gender = 'Nam' OR gender = 'nam' THEN 'Nam'
          WHEN gender = 'Nữ' OR gender = 'nữ' THEN 'Nữ'
          ELSE 'Khác'
        END
    `);

    // Lấy thống kê độ tuổi
    const ageResult = await pool.request().query(`
      SELECT 
        SUM(CASE WHEN DATEDIFF(YEAR, dob, GETDATE()) BETWEEN 0 AND 5 THEN 1 ELSE 0 END) as mam_non,
        SUM(CASE WHEN DATEDIFF(YEAR, dob, GETDATE()) BETWEEN 6 AND 14 THEN 1 ELSE 0 END) as hoc_sinh,
        SUM(CASE WHEN DATEDIFF(YEAR, dob, GETDATE()) BETWEEN 15 AND 18 THEN 1 ELSE 0 END) as thpt,
        SUM(CASE WHEN DATEDIFF(YEAR, dob, GETDATE()) BETWEEN 19 AND 60 THEN 1 ELSE 0 END) as lao_dong,
        SUM(CASE WHEN DATEDIFF(YEAR, dob, GETDATE()) > 60 THEN 1 ELSE 0 END) as cao_tuoi
      FROM [HouseholdMember]
      WHERE dob IS NOT NULL
    `);

    res.json({
      success: true,
      total_households: households.recordset[0].count,
      total_residents: members.recordset[0].count,
      tam_tru_count: tamTru.recordset[0].count,
      pending_requests: requests.recordset[0].count,
      gender_stats: genderResult.recordset.map(r => ({
        gender: r.gender,
        count: r.count
      })),
      age_stats: ageResult.recordset[0] || {
        mam_non: 0,
        hoc_sinh: 0,
        thpt: 0,
        lao_dong: 0,
        cao_tuoi: 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
