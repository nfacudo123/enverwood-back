const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Endpoint para listar todos los países
const listarPaises = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM paises'
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No hay países disponibles' });
    }
    res.json({ paises: result.rows });
  } catch (error) {
    console.error('Error al listar países:', error);
    res.status(500).json({ error: 'Error al obtener países' });
  }
};

module.exports = { listarPaises };
