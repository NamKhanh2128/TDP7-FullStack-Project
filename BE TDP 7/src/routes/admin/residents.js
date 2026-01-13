const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');
const crypto = require('crypto');

router.get('/residents', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT m.*, h.code as household_code, h.address as household_address
      FROM [HouseholdMember] m
      LEFT JOIN [Household] h ON m.household_id = h.id
      ORDER BY m.created_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/residents', async (req, res) => {
  try {
    const { household_code, full_name, dob, gender, relation, cccd } = req.body;
    if (!household_code || !full_name || !relation) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    }

    const pool = await getPool();
    const findHouseholdRequest = pool.request();
    findHouseholdRequest.input('code', sql.NVarChar, household_code);
    const householdResult = await findHouseholdRequest.query("SELECT id FROM [Household] WHERE code = @code");
    
    if (householdResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hộ khẩu' });
    }

    const memberId = crypto.randomUUID();
    const insertRequest = pool.request();
    insertRequest.input('id', sql.NVarChar, memberId);
    insertRequest.input('household_id', sql.NVarChar, householdResult.recordset[0].id);
    insertRequest.input('name', sql.NVarChar, full_name);
    insertRequest.input('role', sql.NVarChar, relation);
    insertRequest.input('dob', sql.Date, dob);
    insertRequest.input('gender', sql.NVarChar, gender);
    insertRequest.input('idCard', sql.NVarChar, cccd || '');
    
    await insertRequest.query(`
      INSERT INTO [HouseholdMember] (id, household_id, name, role, dob, gender, idCard, created_at)
      VALUES (@id, @household_id, @name, @role, @dob, @gender, @idCard, GETDATE())
    `);

    res.json({ success: true, data: { id: memberId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/residents/:id', async (req, res) => {
  try {
    const { name, dob, gender, role, idCard } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.NVarChar, req.params.id);
    request.input('name', sql.NVarChar, name);
    request.input('dob', sql.Date, dob);
    request.input('gender', sql.NVarChar, gender);
    request.input('role', sql.NVarChar, role);
    request.input('idCard', sql.NVarChar, idCard);
    
    await request.query(`
      UPDATE [HouseholdMember]
      SET name = @name, dob = @dob, gender = @gender, role = @role, idCard = @idCard
      WHERE id = @id
    `);
    res.json({ success: true, message: 'Đã cập nhật' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/residents/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.NVarChar, req.params.id);
    await request.query("DELETE FROM [HouseholdMember] WHERE id = @id");
    res.json({ success: true, message: 'Đã xóa' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
