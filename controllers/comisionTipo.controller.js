const { Pool } = require('pg');
const path = require('path');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 1. Crear tipo de comisión
const crearComisionTipo = async (req, res) => {
  const { tipo, porcentaje } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO comision_tipo (descripcion, porcentaje) VALUES ($1, $2) RETURNING *',
      [tipo, porcentaje]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear tipo de comisión:', error);
    res.status(500).json({ error: 'Error al crear tipo de comisión' });
  }
};

// 2. Editar tipo de comisión por ID
const editarComisionTipo = async (req, res) => {
  const id = req.params.id;
  const { descripcion, porcentaje } = req.body;

  try {
    const result = await pool.query(
      'UPDATE comision_tipo SET descripcion = $1, porcentaje = $2 WHERE id = $3 RETURNING *',
      [descripcion, porcentaje, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tipo de comisión no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al editar tipo de comisión:', error);
    res.status(500).json({ error: 'Error al editar tipo de comisión' });
  }
};

// 3. Listar todos los tipos de comisión
const listarComisionTipos = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comision_tipo ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar tipos de comisión:', error);
    res.status(500).json({ error: 'Error al listar tipos de comisión' });
  }
};

module.exports = {
  crearComisionTipo,
  editarComisionTipo,
  listarComisionTipos
};
