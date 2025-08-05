const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const registrarInversionDB = async (usuarioId, monto) => {
  const result = await pool.query(
    `INSERT INTO inversiones 
      (usuario_id, monto, fecha_inicio, fecha_termino, tasa_diaria, activo, creado_en) 
     VALUES 
      ($1, $2, NOW(), NULL, NULL, false, NOW()) 
     RETURNING *`,
    [usuarioId, monto]
  );
  return result.rows[0];
};

const listarInversionesUsuarioDB = async (usuarioId) => {
  const result = await pool.query(
    'SELECT * FROM inversiones WHERE usuario_id = $1 ORDER BY creado_en DESC',
    [usuarioId]
  );
  return result.rows;
};

const eliminarInversionDB = async (id) => {
  const result = await pool.query('DELETE FROM inversiones WHERE id = $1 RETURNING *', [id]);
  if (result.rowCount === 0) {
    throw new Error('Inversión no encontrada');
  }
  return result.rows[0];
};

const actualizarComprobante = async (id, ruta) => {
  const result = await pool.query(
    'UPDATE inversiones SET comprobante = $1 WHERE id = $2 RETURNING *',
    [ruta, id]
  );
  return result.rows[0];
};

const caducarCicloDB = async (inversionId) => {
  const result = await pool.query(`
    UPDATE inversiones
    SET activo = true
    WHERE id = $1
    RETURNING *;
  `, [inversionId]);

  if (result.rowCount === 0) {
    throw new Error('Inversión no encontrada para caducar');
  }

  return result.rows[0];
};

const validarInversionDB = async (inversionId, utilidad) => {
  if (!utilidad || isNaN(utilidad)) {
    throw new Error('Debe proporcionar un valor numérico válido para la utilidad');
  }

  const inversion = await pool.query('SELECT * FROM inversiones WHERE id = $1', [inversionId]);
  if (inversion.rows.length === 0) throw new Error('Inversión no encontrada');

  const { usuario_id, monto, activo } = inversion.rows[0];
  if (activo === true) throw new Error('Inversión ya validada');

  // Guardar utilidad en la tabla 'utilidades'
  await pool.query(`
    INSERT INTO utilidades (val_utilidad, iduser)
    VALUES ($1, $2)
  `, [utilidad, usuario_id]);

  await pool.query(`
    UPDATE users
    SET estado = '1'
    WHERE id = $1
      AND NOT EXISTS (
        SELECT 1 FROM utilidades WHERE iduser = $1 AND fecha < CURRENT_DATE
      )
  `, [usuario_id]);

  // Establecer fechas sin activar aún
  await pool.query(`
    UPDATE inversiones
    SET fecha_inicio = NOW(),
        fecha_termino = NOW() + INTERVAL '1 year'
    WHERE id = $1
  `, [inversionId]);

  const valor = parseFloat(utilidad);

  // Obtener tipos de comisión
  const { rows: tiposComision } = await pool.query('SELECT * FROM comision_tipo');

  const tipoEmpresa = tiposComision.find(t => t.descripcion === 'Empresa');
  const tipoInversor = tiposComision.find(t => t.descripcion === 'Inversor');

  const porcentajeEmpresa = parseFloat(tipoEmpresa?.porcentaje || 0.20);
  const porcentajeInversor = parseFloat(tipoInversor?.porcentaje || 0.60);

  // Comisión al inversor
  const valorInversor = valor * porcentajeInversor;
  await pool.query(`
    INSERT INTO comisiones (inversion_id, beneficiario_id, tipo_comision_id, valor)
    VALUES ($1, $2, $3, $4)
  `, [inversionId, usuario_id, tipoInversor.id, valorInversor]);

  // Comisión a la empresa (id 1)
  const valorEmpresa = valor * porcentajeEmpresa;
  await pool.query(`
    INSERT INTO comisiones (inversion_id, beneficiario_id, tipo_comision_id, valor)
    VALUES ($1, $2, $3, $4)
  `, [inversionId, 1, tipoEmpresa.id, valorEmpresa]);

  // Comisión multinivel
  const valorMultinivel = valorEmpresa;
  let referidoId = usuario_id;

  for (let nivel = 1; nivel <= 5; nivel++) {
    const tipoNivel = tiposComision.find(t => t.descripcion === `Nivel ${nivel}`);
    if (!tipoNivel) continue;

    const parent = await pool.query('SELECT sponsor_id FROM users WHERE id = $1', [referidoId]);
    if (parent.rows.length === 0 || !parent.rows[0].sponsor_id) break;

    referidoId = parent.rows[0].sponsor_id;

    const porcentajeNivel = parseFloat(tipoNivel.porcentaje);
    const valorComision = valorMultinivel * porcentajeNivel;

    await pool.query(`
      INSERT INTO comisiones (inversion_id, beneficiario_id, tipo_comision_id, valor)
      VALUES ($1, $2, $3, $4)
    `, [inversionId, referidoId, tipoNivel.id, valorComision]);
  }

  return {
    message: 'Inversión validada. Utilidad registrada y comisiones distribuidas',
    utilidad: valor
  };
};


module.exports = {
  registrarInversionDB,
  listarInversionesUsuarioDB,
  validarInversionDB,
  caducarCicloDB,
  eliminarInversionDB,
  actualizarComprobante
};
