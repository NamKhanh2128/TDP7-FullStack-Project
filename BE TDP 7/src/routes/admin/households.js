const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');
const crypto = require('crypto');

router.get('/households', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT h.*, u.full_name as owner_name,
        (SELECT COUNT(*) FROM [HouseholdMember] m WHERE m.household_id = h.id) as member_count
      FROM [Household] h
      LEFT JOIN [AppUser] u ON h.owner_id = u.id
      ORDER BY h.created_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/households/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.NVarChar, req.params.id);
    const result = await request.query(`
      SELECT h.*, u.full_name as owner_name
      FROM [Household] h
      LEFT JOIN [AppUser] u ON h.owner_id = u.id
      WHERE h.id = @id
    `);
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/households', async (req, res) => {
  try {
    const { code, address, email_chu_ho, area } = req.body;
    if (!code || !address || !email_chu_ho) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    }

    const pool = await getPool();
    const findUserRequest = pool.request();
    findUserRequest.input('email', sql.NVarChar, email_chu_ho.toLowerCase());
    const userResult = await findUserRequest.query("SELECT id FROM [AppUser] WHERE LOWER(email) = LOWER(@email)");
    
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user với email này' });
    }

    const householdId = crypto.randomUUID();
    const insertRequest = pool.request();
    insertRequest.input('id', sql.NVarChar, householdId);
    insertRequest.input('code', sql.NVarChar, code);
    insertRequest.input('address', sql.NVarChar, address);
    insertRequest.input('area', sql.Decimal, area || 0);
    insertRequest.input('owner_id', sql.NVarChar, userResult.recordset[0].id);
    
    await insertRequest.query(`
      INSERT INTO [Household] (id, code, address, area, owner_id, created_at)
      VALUES (@id, @code, @address, @area, @owner_id, GETDATE())
    `);

    const updateUserRequest = pool.request();
    updateUserRequest.input('userId', sql.NVarChar, userResult.recordset[0].id);
    updateUserRequest.input('householdId', sql.NVarChar, householdId);
    await updateUserRequest.query("UPDATE [AppUser] SET household_id = @householdId WHERE id = @userId");

    res.json({ success: true, data: { id: householdId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
