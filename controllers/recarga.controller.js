const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const { repartirBonosPorRecarga } = require('../services/bono.service');

const solicitarRecarga = async (req, res) => {
  const { monto } = req.body;
  const usuarioId = req.user.userId;
  const result = await pool.query(
    'INSERT INTO recargas (usuario_id, monto) VALUES ($1, $2) RETURNING *',
    [usuarioId, monto]
  );
  res.status(201).json(result.rows[0]);
};

const aprobarRecarga = async (req, res) => {
  const { recargaId } = req.params;
  const { rows } = await pool.query('SELECT * FROM recargas WHERE id = $1', [recargaId]);
  const recarga = rows[0];
  if (!recarga || recarga.estado === 'aprobada') return res.status(400).json({ message: 'Inválida o ya aprobada' });

  await pool.query('UPDATE recargas SET estado = $1 WHERE id = $2', ['aprobada', recargaId]);
  await repartirBonosPorRecarga(recarga.usuario_id, recarga.monto);
  res.json({ message: 'Recarga aprobada y bonos distribuidos' });
};
module.exports = { solicitarRecarga, aprobarRecarga };
