const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getUserByUsername(username) {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
}

async function getUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function createUser(name, apellidos, username, email, passwordHash, paisId, telefono, sponsorId = null) {
  const result = await pool.query(
    `
    INSERT INTO users (name, apellidos, username, email, password, pais_id, telefono, sponsor_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, name, email, role
    `,
    [name, apellidos, username, email, passwordHash, paisId, telefono, sponsorId]
  );
  return result.rows[0];
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserByUsername
};
