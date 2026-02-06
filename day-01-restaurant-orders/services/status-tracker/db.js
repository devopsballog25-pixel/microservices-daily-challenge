const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'status',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_states (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        state VARCHAR(20) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_analytics (
        order_id VARCHAR(50) PRIMARY KEY,
        completed_at TIMESTAMP,
        wait_time_seconds INTEGER
      )
    `);

    console.log('Status database initialized');
  } finally {
    client.release();
  }
}

async function logState(order_id, state) {
  await pool.query(
    'INSERT INTO order_states (order_id, state) VALUES ($1, $2)',
    [order_id, state]
  );

  // If completed, calculate wait time
  if (state === 'completed') {
    const result = await pool.query(
      `SELECT MIN(timestamp) as start_time
       FROM order_states
       WHERE order_id = $1`,
      [order_id]
    );

    if (result.rows[0].start_time) {
      const waitTime = Math.floor((Date.now() - new Date(result.rows[0].start_time)) / 1000);

      await pool.query(
        `INSERT INTO order_analytics (order_id, completed_at, wait_time_seconds)
         VALUES ($1, NOW(), $2)
         ON CONFLICT (order_id) DO UPDATE SET
         completed_at = NOW(), wait_time_seconds = $2`,
        [order_id, waitTime]
      );
    }
  }
}

async function getCurrentState(order_id) {
  const result = await pool.query(
    `SELECT state, timestamp
     FROM order_states
     WHERE order_id = $1
     ORDER BY timestamp DESC
     LIMIT 1`,
    [order_id]
  );
  return result.rows[0];
}

async function getStateHistory(order_id) {
  const result = await pool.query(
    `SELECT state, timestamp
     FROM order_states
     WHERE order_id = $1
     ORDER BY timestamp ASC`,
    [order_id]
  );
  return result.rows;
}

async function getDailyAnalytics() {
  const result = await pool.query(`
    SELECT
      COUNT(*) as orders_completed,
      AVG(wait_time_seconds) as avg_wait_time_seconds
    FROM order_analytics
    WHERE DATE(completed_at) = CURRENT_DATE
  `);
  return result.rows[0];
}

module.exports = {
  initDatabase,
  logState,
  getCurrentState,
  getStateHistory,
  getDailyAnalytics
};
