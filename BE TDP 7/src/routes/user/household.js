const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');
const crypto = require('crypto');

router.get('/users/my-household', async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.NVarChar, req.user.id);
    
    const result = await request.query(`
      SELECT h.*, u.full_name as owner_name
      FROM [AppUser] u
      LEFT JOIN [Household] h ON u.household_id = h.id
      WHERE u.id = @id
    `);
    
    if (!result.recordset[0]?.id) {
      return res.json({ success: true, data: null });
    }

    const membersRequest = pool.request();
    membersRequest.input('household_id', sql.NVarChar, result.recordset[0].id);
    const members = await membersRequest.query(`
      SELECT * FROM [HouseholdMember] WHERE household_id = @household_id
    `);

    res.json({ success: true, data: { ...result.recordset[0], members: members.recordset } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/users/household/members', async (req, res) => {
  try {
    const { full_name, dob, gender, relation, cccd } = req.body;
    const pool = await getPool();
    const userRequest = pool.request();
    userRequest.input('id', sql.NVarChar, req.user.id);
    const user = await userRequest.query("SELECT household_id FROM [AppUser] WHERE id = @id");
    
    if (!user.recordset[0]?.household_id) {
      return res.status(400).json({ success: false, message: 'Bạn chưa có hộ khẩu' });
    }

    const memberId = crypto.randomUUID();
    const insertRequest = pool.request();
    insertRequest.input('id', sql.NVarChar, memberId);
    insertRequest.input('household_id', sql.NVarChar, user.recordset[0].household_id);
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

router.put('/users/household/members/:id', async (req, res) => {
  try {
    const { full_name, dob, gender, relation, cccd } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.NVarChar, req.params.id);
    request.input('name', sql.NVarChar, full_name);
    request.input('dob', sql.Date, dob);
    request.input('gender', sql.NVarChar, gender);
    request.input('role', sql.NVarChar, relation);
    request.input('idCard', sql.NVarChar, cccd);
    
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

module.exports = router;
