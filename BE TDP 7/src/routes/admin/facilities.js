const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../../config/dbConfig');

router.get('/facilities', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM [Facility] ORDER BY created_at DESC");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/facilities/locations', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT DISTINCT location FROM [Facility] WHERE location IS NOT NULL");
    res.json({ success: true, data: result.recordset.map(r => r.location) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/facilities/equipments', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM [Facility] WHERE type = 'ThietBi'");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/facilities', async (req, res) => {
  try {
    const { name, type, price, location, capacity, status } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('name', sql.NVarChar, name);
    request.input('type', sql.NVarChar, type);
    request.input('price', sql.Decimal, price || 0);
    request.input('location', sql.NVarChar, location);
    request.input('capacity', sql.Int, capacity);
    request.input('status', sql.NVarChar, status || 'Active');
    
    const result = await request.query(`
      INSERT INTO [Facility] (name, type, price, location, capacity, status, created_at)
      OUTPUT INSERTED.id
      VALUES (@name, @type, @price, @location, @capacity, @status, GETDATE())
    `);
    res.json({ success: true, data: { id: result.recordset[0].id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/facilities/:id', async (req, res) => {
  try {
    const { name, type, price, location, capacity, status } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.Int, req.params.id);
    request.input('name', sql.NVarChar, name);
    request.input('type', sql.NVarChar, type);
    request.input('price', sql.Decimal, price);
    request.input('location', sql.NVarChar, location);
    request.input('capacity', sql.Int, capacity);
    request.input('status', sql.NVarChar, status);
    
    await request.query(`
      UPDATE [Facility]
      SET name = @name, type = @type, price = @price, location = @location, capacity = @capacity, status = @status
      WHERE id = @id
    `);
    res.json({ success: true, message: 'Đã cập nhật' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/facilities/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.Int, req.params.id);
    await request.query("DELETE FROM [Facility] WHERE id = @id");
    res.json({ success: true, message: 'Đã xóa' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
