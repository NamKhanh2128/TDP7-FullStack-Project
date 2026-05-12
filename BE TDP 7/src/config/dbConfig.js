const sql = require('mssql');
require('dotenv').config();

let pool = null;

function buildConfigFromEnv() {
  const rawHost = process.env.DB_HOST || 'localhost';
  let server = rawHost;
  let instanceName;
  if (rawHost.includes('\\')) {
    const parts = rawHost.split('\\');
    server = parts[0];
    instanceName = parts.slice(1).join('\\');
  }
  const portValue = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;

  return {
    server: String(server),
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
}

async function connectDB() {
  if (pool && pool.connected) return pool;

  const connStr = process.env.DB_CONNECTION_STRING && process.env.DB_CONNECTION_STRING.trim();

  try {
    if (connStr) {
      const useTrusted = /trusted[_ ]?connection\s*=\s*true/i.test(connStr);
      if (useTrusted) {
        pool = await new sql.ConnectionPool({ connectionString: connStr, driver: 'msnodesqlv8' }).connect();
      } else {
        pool = await new sql.ConnectionPool(connStr).connect();
      }
    } else {
      const cfg = buildConfigFromEnv();
      pool = await new sql.ConnectionPool(cfg).connect();
    }

    console.log('✅ Database pool created');
    return pool;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message || err);
    throw err;
  }
}

async function getPool() {
  if (pool && pool.connected) return pool;
  return connectDB();
}

async function closePool() {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('✅ Database pool closed');
    }
  } catch (err) {
    console.error('❌ Error closing pool:', err.message || err);
  }
}

module.exports = { sql, connectDB, getPool, closePool };