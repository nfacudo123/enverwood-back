const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function crearInversion(usuarioId, monto, dias, tasa) {
  const inicio = new Date();
  const termino = new Date(inicio);
  termino.setDate(inicio.getDate() + dias);

  const res = await pool.query(
    `INSERT INTO inversiones (usuario_id, monto, fecha_inicio, fecha_termino, tasa_diaria)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [usuarioId, monto, inicio, termino, tasa]
  );
  return res.rows[0];
}

async function obtenerInversionesPorUsuario(usuarioId) {
  const res = await pool.query(
    `SELECT * FROM inversiones WHERE usuario_id = $1 ORDER BY fecha_inicio DESC`,
    [usuarioId]
  );
  return res.rows;
}

module.exports = { crearInversion, obtenerInversionesPorUsuario };
