const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:8080', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/admin'));
app.use('/api', require('./routes/user'));

app.get('/', (req, res) => {
  res.json({ message: 'TDP7 Backend API', version: '2.0.0' });
});

app.get('/api/health', async (req, res) => {
  try {
    const { getPool } = require('./config/dbConfig');
    const pool = await getPool();
    await pool.request().query('SELECT 1');
    res.json({ success: true, status: 'UP' });
  } catch (error) {
    res.status(500).json({ success: false, status: 'DOWN', error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;
