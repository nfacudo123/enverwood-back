const pool = require('../db');

// ✅ Validar inversión y distribuir comisiones
const validarInversion = async (req, res) => {
  const inversionId = req.params.id;

  try {
    const { rows: inversionRows } = await pool.query('SELECT * FROM inversiones WHERE id = $1', [inversionId]);
    if (inversionRows.length === 0) return res.status(404).json({ error: 'Inversión no encontrada' });

    const { usuario_id, monto, activo } = inversionRows[0];
    if (activo === true) return res.status(400).json({ error: 'Inversión ya validada' });

    // Activar inversión
    await pool.query('UPDATE inversiones SET activo = true WHERE id = $1', [inversionId]);

    const valor = parseFloat(monto);

    // Obtener todos los tipos de comisión
    const { rows: tiposComision } = await pool.query('SELECT * FROM comision_tipo');

    // Extraer porcentajes
    const porcentajeInversor = tiposComision.find(t => t.descripcion === 'Inversor')?.porcentaje || 0.60;
    const porcentajeEmpresa = tiposComision.find(t => t.descripcion === 'Empresa')?.porcentaje || 0.20;

    // 1. Comisión al Inversor
    const valorInversor = valor * porcentajeInversor;
    await pool.query(`
      INSERT INTO comisiones (inversion_id, beneficiario_id, tipo_comision_id, valor)
      VALUES ($1, $2, 7, $3)
    `, [inversionId, usuario_id, valorInversor]);

    // 2. Comisión a la Empresa (usuario con id = 1)
    const valorEmpresa = valor * porcentajeEmpresa;
    await pool.query(`
      INSERT INTO comisiones (inversion_id, beneficiario_id, tipo_comision_id, valor)
      VALUES ($1, 1, 6, $2)
    `, [inversionId, valorEmpresa]);

    // 3. Comisión multinivel: del sponsor hacia arriba
    let referidoId = usuario_id;

    for (let nivel = 1; nivel <= 5; nivel++) {
      const parent = await pool.query('SELECT sponsor_id FROM users WHERE id = $1', [referidoId]);
      if (parent.rows.length === 0 || !parent.rows[0].sponsor_id) break;

      referidoId = parent.rows[0].sponsor_id;

      const tipo = tiposComision.find(t => t.descripcion === `Nivel ${nivel}`);
      if (!tipo) continue;

      const valorComision = valor * tipo.porcentaje;

      await pool.query(`
        INSERT INTO comisiones (inversion_id, beneficiario_id, tipo_comision_id, valor)
        VALUES ($1, $2, $3, $4)
      `, [inversionId, referidoId, tipo.id, valorComision]);
    }

    res.json({ message: 'Inversión validadasss y comisiones generadas correctamente' });

  } catch (err) {
    console.error('Error al validar inversión:', err);
    res.status(500).json({ error: 'Error interno al validar inversión' });
  }
};



// ✅ Consultar comisiones por inversión
const obtenerComisionesPorInversion = async (req, res) => {
  const { idInversion } = req.params;

  try {
    const consulta = `
      SELECT 
        c.id, 
        c.inversion_id, 
        c.valor,
        c.tipo_comision_id,
        u.name AS nombre_beneficiario,
        u.apellidos AS apellido_beneficiario,
        u.username AS usuario_beneficiario,
        ct.descripcion AS tipo_comision
      FROM comisiones c
      LEFT JOIN users u ON c.beneficiario_id = u.id
      JOIN comision_tipo ct ON c.tipo_comision_id = ct.id
      WHERE c.inversion_id = $1
      ORDER BY c.tipo_comision_id;
    `;

    const resultado = await pool.query(consulta, [idInversion]);
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error al obtener comisiones:', err);
    res.status(500).json({ error: 'Error interno al obtener comisiones' });
  }
};

// ✅ Listar inversiones con resumen de comisiones
const listarInversionesConResumen = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        i.id AS inversion_id,
        i.monto,
        i.creado_en,
        u.name,
        u.apellidos,
        u.username,
        u.email,
        SUM(CASE WHEN c.tipo_comision_id = 7 THEN c.valor ELSE 0 END) AS comision_inversor,
        SUM(CASE WHEN c.tipo_comision_id = 6 THEN c.valor ELSE 0 END) AS comision_empresa,
        SUM(CASE WHEN c.tipo_comision_id IN (1, 2, 3, 4, 5) THEN c.valor ELSE 0 END) AS comision_referidos,
        SUM(c.valor) AS total_comisiones
      FROM inversiones i
      JOIN users u ON i.usuario_id = u.id
      LEFT JOIN comisiones c ON c.inversion_id = i.id
      WHERE i.activo = true
      GROUP BY i.id, u.name, u.apellidos, u.username, u.email
      ORDER BY i.creado_en DESC;
    `);

    res.json(resultado.rows);
  } catch (err) {
    console.error('Error al listar inversiones:', err);
    res.status(500).json({ error: 'Error interno al listar inversiones' });
  }
};

// ✅ Listar todas las inversiones
const listarInversiones = async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT 
        inv.id AS inversion_id,
        inv.monto,
        inv.activo,
        inv.creado_en,
        u.id AS usuario_id,
        u.name,
        u.apellidos,
        u.username,
        u.email
      FROM inversiones inv
      LEFT JOIN users u ON u.id = inv.usuario_id
      ORDER BY inv.creado_en DESC
    `);

    res.json({ inversiones: result.rows });
  } catch (error) {
    console.error('Error al listar inversiones:', error);
    res.status(500).json({ error: 'Error al obtener inversiones' });
  }
};

// ✅ Actualizar usuario
const actualizarUsuario = async (req, res) => {
  const userId = req.params.id;
  const {
    name, apellido, username, email, pais_id, telefono,
    wallet_usdt, direccion, ciudad, estado
  } = req.body;

  try {
    const result = await pool.query(`
      UPDATE users SET
        name = COALESCE($1, name),
        apellido = COALESCE($2, apellido),
        username = COALESCE($3, username),
        email = COALESCE($4, email),
        pais_id = COALESCE($5, pais_id),
        telefono = COALESCE($6, telefono),
        wallet_usdt = COALESCE($7, wallet_usdt),
        direccion = COALESCE($8, direccion),
        ciudad = COALESCE($9, ciudad),
        estado = COALESCE($10, estado)
      WHERE id = $11
      RETURNING *
    `, [
      name, apellido, username, email, pais_id, telefono,
      wallet_usdt, direccion, ciudad, estado, userId
    ]);

    if (result.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ message: 'Usuario actualizado correctamente', usuario: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

module.exports = {
  validarInversion,
  obtenerComisionesPorInversion,
  listarInversionesConResumen,
  listarInversiones,
  actualizarUsuario,
};
