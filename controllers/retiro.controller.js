const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const solicitarRetiro = async (req, res) => {
  const { monto } = req.body;
  const usuarioId = req.user.userId;

  const { rows } = await pool.query(
    'INSERT INTO retiros (usuario_id, monto) VALUES ($1, $2) RETURNING *',
    [usuarioId, monto]
  );
  res.status(201).json(rows[0]);
};

const aprobarRetiro = async (req, res) => {
  const { retiroId } = req.params;

  const { rows } = await pool.query('SELECT * FROM retiros WHERE id = $1', [retiroId]);
  const retiro = rows[0];
  if (!retiro || retiro.estado === 'pagado') return res.status(400).json({ message: 'Inválido o ya pagado' });

  await pool.query('UPDATE retiros SET estado = $1 WHERE id = $2', ['pagado', retiroId]);
  res.json({ message: 'Retiro pagado correctamente' });
};

module.exports = { solicitarRetiro, aprobarRetiro };
