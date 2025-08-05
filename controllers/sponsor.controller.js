const { Pool } = require('pg');
const path = require('path');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const cambiarSponsor = async (req, res) => {
  const { iduser1, iduser2 } = req.body;

  if (!iduser1 || !iduser2) {
    return res.status(400).json({ error: 'Se requieren iduser1 y iduser2' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET sponsor_id = $1 WHERE id = $2 RETURNING id, sponsor_id',
      [iduser1, iduser2]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Sponsor actualizado correctamente', data: result.rows[0] });
  } catch (err) {
    console.error('Error al cambiar sponsor:', err);
    res.status(500).json({ error: 'Error al cambiar sponsor' });
  }
};

module.exports = { cambiarSponsor };
