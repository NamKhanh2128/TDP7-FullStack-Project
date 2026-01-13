const sql = require('mssql');
require('dotenv').config();

const rawHost = process.env.DB_HOST || 'localhost';
let server = rawHost;
let instanceName;
if (rawHost.includes('\\')) {
  const parts = rawHost.split('\\');
  server = parts[0];
  instanceName = parts.slice(1).join('\\');
}

const portValue = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;

const config = {
  server: String(server),
  // If using a named instance, omit port so the driver uses instanceName/SQL Browser.
  port: instanceName ? undefined : portValue,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    ...(instanceName ? { instanceName } : {})
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  connectionTimeout: 30000,
  requestTimeout: 30000
};

async function connectDB() {
  try {
    await sql.connect(config);
    console.log('Database connected');
    return sql;
  } catch (err) {
    console.error('Database connection failed:', err.message || err);
    throw err;
  }
}

module.exports = { sql, connectDB, config };