const { Pool } = require("pg");

function makePool() {
  const connectionString =
    process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5432/myl1_squid";
  return new Pool({ connectionString });
}

async function ensureSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transfers (
      id TEXT PRIMARY KEY,
      block_number INTEGER NOT NULL,
      extrinsic_hash TEXT NULL,
      from_account TEXT NOT NULL,
      to_account TEXT NOT NULL,
      amount TEXT NOT NULL
    );
  `);
}

module.exports = { makePool, ensureSchema };


