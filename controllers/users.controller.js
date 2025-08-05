const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const bcrypt = require('bcrypt');

// GET /api/users/u/:username
const getUserByUsernameBasic = async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, email, username FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al buscar usuario por username:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const listarUsuarios = async (req, res) => {
  try {
    // Obtiene todos los usuarios con sus detalles importantes
    const result = await pool.query(`
      SELECT id, name, email, username, apellidos, pais_id, telefono, wallet_usdt, direccion, ciudad, estado, created_at
      FROM users
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios' });
    }

    res.json({ usuarios: result.rows });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};


const actualizarUsuarioPorId = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }

  const {
    name,
    email,
    username,
    apellidos,
    pais_id,
    telefono,
    wallet_usdt,
    direccion,
    ciudad,
    estado,
    password
  } = req.body;

  try {
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const result = await pool.query(
      `
      UPDATE users SET
        name = COALESCE($1, name),
        apellidos = COALESCE($2, apellidos),
        username = COALESCE($3, username),
        email = COALESCE($4, email),
        pais_id = COALESCE($5, pais_id),
        telefono = COALESCE($6, telefono),
        wallet_usdt = COALESCE($7, wallet_usdt),
        direccion = COALESCE($8, direccion),
        ciudad = COALESCE($9, ciudad),
        estado = COALESCE($10, estado),
        password = COALESCE($11, password)
      WHERE id = $12
      RETURNING *
      `,
      [
        name,
        apellidos,
        username,
        email,
        pais_id,
        telefono,
        wallet_usdt,
        direccion,
        ciudad,
        estado,
        hashedPassword, // Se usa la contraseña encriptada
        userId
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado correctamente', usuario: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};


module.exports = { actualizarUsuarioPorId, getUserByUsernameBasic, listarUsuarios };
