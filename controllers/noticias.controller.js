const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const listarNoticias = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM noticias ORDER BY id DESC');
    res.json({ noticias: result.rows });
  } catch (error) {
    console.error('Error al listar noticias:', error);
    res.status(500).json({ error: 'Error al obtener noticias' });
  }
};

// Crear noticia
const crearNoticia = async (req, res) => {
  const { titulo, noticia } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO noticias (titulo, noticia) VALUES ($1, $2) RETURNING *',
      [titulo, noticia]
    );
    res.status(201).json({ mensaje: 'Noticia creada exitosamente', noticia: result.rows[0] });
  } catch (error) {
    console.error('Error al crear noticia:', error);
    res.status(500).json({ error: 'Error al crear la noticia' });
  }
};

// Eliminar noticia por ID
const eliminarNoticia = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM noticias WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }

    res.json({ mensaje: 'Noticia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar noticia:', error);
    res.status(500).json({ error: 'Error al eliminar la noticia' });
  }
};

module.exports = {
  crearNoticia,
  eliminarNoticia,
  listarNoticias
};
