const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const crearTiempoRetiro = async ({ horario, fee, mensaje_retiro }) => {
  const result = await pool.query(
    'INSERT INTO tiempo_retiro (horario, fee, mensaje_retiro) VALUES ($1, $2, $3) RETURNING *',
    [horario, fee, mensaje_retiro]
  );
  return result.rows[0];
};

const listarTiempoRetiro = async () => {
  const result = await pool.query('SELECT * FROM tiempo_retiro ORDER BY horario ASC');
  return result.rows;
};

const editarTiempoRetiro = async (id, { horario, fee, mensaje_retiro }) => {
  const result = await pool.query(
    `UPDATE tiempo_retiro 
     SET horario = COALESCE($1, horario),
         fee = COALESCE($2, fee),
         mensaje_retiro = COALESCE($3, mensaje_retiro)
     WHERE id = $4 RETURNING *`,
    [horario, fee, mensaje_retiro, id]
  );
  return result.rows[0];
};

const eliminarTiempoRetiro = async (id) => {
  const result = await pool.query('DELETE FROM tiempo_retiro WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = {
  crearTiempoRetiro,
  listarTiempoRetiro,
  editarTiempoRetiro,
  eliminarTiempoRetiro,
};
