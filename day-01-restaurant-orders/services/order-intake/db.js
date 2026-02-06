const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'orders',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        items JSONB NOT NULL,
        customer_info JSONB,
        table_number INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Database initialized');
  } finally {
    client.release();
  }
}

async function createOrder(order) {
  const { id, type, items, customer_info, table_number } = order;
  const result = await pool.query(
    'INSERT INTO orders (id, type, items, customer_info, table_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [id, type, JSON.stringify(items), JSON.stringify(customer_info || {}), table_number]
  );
  return result.rows[0];
}

async function getOrder(id) {
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = { initDatabase, createOrder, getOrder };
