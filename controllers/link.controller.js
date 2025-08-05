const { Pool } = require('pg');
const path = require('path');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Obtener el link (asumimos id = 1 por defecto)
const obtenerLink = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM link WHERE id = 1');
    if (result.rows.length === 0) return res.status(404).json({ error: 'Link no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener el link:', error);
    res.status(500).json({ error: 'Error interno al obtener el link' });
  }
};

// Actualizar el link (por ID)
const actualizarLink = async (req, res) => {
  const { id } = req.params;
  const { link } = req.body;

  if (!link) return res.status(400).json({ error: 'El campo link es obligatorio' });

  try {
    const result = await pool.query(
      'UPDATE link SET link = $1 WHERE id = $2 RETURNING *',
      [link, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Link no encontrado' });

    res.json({ message: 'Link actualizado correctamente', data: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar el link:', error);
    res.status(500).json({ error: 'Error interno al actualizar el link' });
  }
};

module.exports = { obtenerLink, actualizarLink };
