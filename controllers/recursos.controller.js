const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'soportes');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Subir recurso
const subirRecurso = async (req, res) => {
  const { nombre } = req.body; // Se debe enviar el nombre del recurso en el body
  const archivo = req.file; // El archivo subido por Multer

  if (!archivo) {
    return res.status(400).json({ message: 'No se subió ningún archivo' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO recursos (nombre, ruta_archivo) VALUES ($1, $2) RETURNING *',
      [nombre, archivo.path] // Guardar la ruta del archivo en la base de datos
    );

    res.status(201).json({ mensaje: 'Recurso subido correctamente', recurso: result.rows[0] });
  } catch (err) {
    console.error('Error al subir recurso:', err);
    res.status(500).json({ error: 'Error al subir recurso' });
  }
};

// Listar todos los recursos
const listarRecursos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recursos');
    res.json({ recursos: result.rows });
  } catch (err) {
    console.error('Error al listar recursos:', err);
    res.status(500).json({ error: 'Error al obtener recursos' });
  }
};

// Obtener recurso por ID
const obtenerRecursoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM recursos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recurso no encontrado' });
    }

    const recurso = result.rows[0];
    const filePath = recurso.ruta_archivo; // La ruta del archivo que se almacenó en la base de datos

    // Redirigir a la URL donde se encuentra el archivo
    res.redirect(`http://localhost:4000/${filePath}`); // Esto llevará al archivo directamente
  } catch (err) {
    console.error('Error al obtener recurso por ID:', err);
    res.status(500).json({ error: 'Error interno al obtener recurso' });
  }
};

// Eliminar recurso por ID
const eliminarRecurso = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM recursos WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recurso no encontrado' });
    }

    res.json({ message: 'Recurso eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar recurso:', err);
    res.status(500).json({ error: 'Error interno al eliminar recurso' });
  }
};

module.exports = {
  subirRecurso,
  listarRecursos,
  obtenerRecursoPorId,
  eliminarRecurso,
  upload
};
