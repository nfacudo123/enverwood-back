const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GET /api/perfil
const verPerfil = async (req, res) => {
  const id = req.user.id || req.user.userId;
  const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);

  if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(rows[0]);
};


const subirFotoPerfil = async (req, res) => {
  const id = req.params.id;
  const archivo = req.file;

  console.log('📂 req.file:', archivo);

  if (!archivo) {
    console.warn('⚠️ No se subió ninguna imagen');
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }

  const ruta = path.join('uploads/perfil', archivo.filename);

  try {
    await pool.query(
      'UPDATE users SET foto = $1 WHERE id = $2',
      [ruta, id]
    );

    res.json({
      message: 'Foto de perfil actualizada correctamente',
      ruta
    });
  } catch (err) {
    console.error('❌ Error al actualizar foto de perfil:', err);
    res.status(500).json({ error: 'Error al actualizar en base de datos' });
  }
};

// PUT /api/perfil/update
const actualizarPerfil = async (req, res) => {
  const id = req.user.id || req.user.userId;
  if (!id) return res.status(400).json({ error: 'ID de usuario no válido o no autenticado' });

  console.log('📨 req.body:', req.body);
  console.log('📁 req.file:', req.file);

  const {
    name,
    apellidos,
    username,
    email,
    pais_id,
    telefono,
    wallet_usdt,
    met_pago,
    direccion,
    ciudad,
    estado,
    password,
    confirmarContrasena
  } = req.body;

  try {
    if (password || confirmarContrasena) {
      if (password !== confirmarContrasena) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
      }
      const hashed = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, id]);
      console.log('🔐 Contraseña actualizada');
    }

    let foto = null;
    if (req.file) {
      foto = path.join('uploads/perfil', req.file.filename);
      console.log('✅ Imagen recibida y guardada:', foto);
    } else {
      console.log('⚠️ No se subió ninguna imagen');
    }

    const values = [
      name ?? null,
      apellidos ?? null,
      username ?? null,
      email ?? null,
      pais_id ?? null,
      telefono ?? null,
      wallet_usdt ?? null,
      direccion ?? null,
      ciudad ?? null,
      estado ?? null,      
      met_pago ?? null,
      id
    ];

    const result = await pool.query(`
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
        met_pago = COALESCE($11, met_pago)
      WHERE id = $12
      RETURNING *;
    `, values);

    console.log('✅ Perfil actualizado en base de datos');

    res.json({
      message: 'Perfil actualizado correctamente',
      usuario: result.rows[0],
    });

  } catch (err) {
    console.error('❌ Error al actualizar perfil:', err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

module.exports = { verPerfil, actualizarPerfil, subirFotoPerfil };
