const { Pool } = require('pg');
const path = require('path');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Listar todos
const listarMetodoPago = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM metodo_pago ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al listar:', err);
    res.status(500).json({ error: 'Error al listar métodos de pago' });
  }
};

// Agregar nuevo
const agregarMetodoPago = async (req, res) => {
  const { titulo, dato } = req.body;
  const file = req.file;

  if (!titulo || !file) {
    return res.status(400).json({ error: 'Faltan datos requeridos o imagen QR' });
  }

  const img_qr = path.join('uploads/qr', file.filename);

  try {
    const result = await pool.query(
      'INSERT INTO metodo_pago (titulo, img_qr, dato) VALUES ($1, $2, $3) RETURNING *',
      [titulo, img_qr, dato]
    );
    res.json({ message: 'Método agregado', metodo: result.rows[0] });
  } catch (err) {
    console.error('❌ Error al agregar método:', err);
    res.status(500).json({ error: 'Error al agregar método de pago' });
  }
};

// Editar
const editarMetodoPago = async (req, res) => {
  const id = req.params.id;
  const { titulo, dato } = req.body;
  const file = req.file;

  try {
    let query, values;
    if (file) {
      const img_qr = path.join('uploads/qr', file.filename);
      query = `
        UPDATE metodo_pago SET 
          titulo = COALESCE($1, titulo), 
          img_qr = $2,
          dato = COALESCE($3, dato) 
        WHERE id = $4 RETURNING *`;
      values = [titulo, img_qr, dato, id];
    } else {
      query = `
        UPDATE metodo_pago SET 
          titulo = COALESCE($1, titulo), 
          dato = COALESCE($2, dato) 
        WHERE id = $3 RETURNING *`;
      values = [titulo, dato, id];
    }

    const result = await pool.query(query, values);
    res.json({ message: 'Método actualizado', metodo: result.rows[0] });
  } catch (err) {
    console.error('❌ Error al editar método:', err);
    res.status(500).json({ error: 'Error al editar método de pago' });
  }
};

// Eliminar
const eliminarMetodoPago = async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM metodo_pago WHERE id = $1', [id]);
    res.json({ message: 'Método eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar:', err);
    res.status(500).json({ error: 'Error al eliminar método de pago' });
  }
};

module.exports = {
  listarMetodoPago,
  agregarMetodoPago,
  editarMetodoPago,
  eliminarMetodoPago
};
