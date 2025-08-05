const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const listarRetiros = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM retiros ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar retiros:', error);
    res.status(500).json({ error: 'Error al listar retiros' });
  }
};

// 2. Listar retiros por usuario
const listarRetirosPorUsuario = async (req, res) => {
  const id = parseInt(req.params.id, 10); // Asegurarse de que el parámetro id es un número entero

  // Validación de que id es un número entero válido
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de usuario inválido' });  // Retornar error si no es un número válido
  }

  try {
    const result = await pool.query('SELECT * FROM retiros WHERE usuario_id = $1 ORDER BY fecha DESC', [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar retiros por usuario:', error);
    res.status(500).json({ error: 'Error al listar retiros por usuario' });
  }
};

// 3. Agregar retiro
const agregarRetiro = async (req, res) => {
  const { usuario_id, monto, wallet_usdt, metodo_pago } = req.body;

  try {
    // 1. Insertar el retiro
    const result = await pool.query(
      `INSERT INTO retiros (usuario_id, monto, wallet_usdt, metodo_pago)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [usuario_id, monto, wallet_usdt, metodo_pago]
    );

    const retiro = result.rows[0];
    console.log("💾 Retiro insertado:", retiro);

    // 2. Obtener fecha actual en Colombia
    const nowColombia = new Date().toLocaleString('en-US', {
      timeZone: 'America/Bogota',
      hour12: false
    });
    const fechaActual = new Date(nowColombia);
    console.log("🕓 Fecha/hora Colombia:", fechaActual.toISOString());

    // 3. Consultar todos los horarios
    const horarios = await pool.query('SELECT * FROM tiempo_retiro');

    const coincidencia = horarios.rows.find(row => {
      const inicio = new Date(row.horario);
      const fin = new Date(inicio.getTime() + 30 * 60 * 1000); // +30 minutos
      return fechaActual >= inicio && fechaActual <= fin;
    });

    if (coincidencia) {
      const porcentaje = parseFloat(coincidencia.fee);
      const valorFee = monto * (porcentaje / 100);

      console.log("✅ Coincidencia dentro de rango:", coincidencia);
      console.log(`💸 Fee del ${porcentaje}% aplicado:`, valorFee.toFixed(2));

      // 4. Insertar comisión para usuario ID 1, tipo 6, sin inversión
      await pool.query(`
        INSERT INTO comisiones (inversion_id, beneficiario_id, tipo_comision_id, valor)
        VALUES (NULL, 1, 6, $1)
      `, [valorFee]);

      console.log("💰 Comisión registrada correctamente.");
    } else {
      console.log("ℹ️ No coincide ningún horario de fee en tiempo_retiro");
    }

    res.status(201).json({ retiro, message: 'Retiro registrado correctamente' });

  } catch (error) {
    console.error('❌ Error al agregar retiro:', error);
    res.status(500).json({ error: 'Error al agregar retiro' });
  }
};


// 4. Eliminar retiro
const eliminarRetiro = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('DELETE FROM retiros WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Retiro no encontrado' });
    res.json({ message: 'Retiro eliminado', retiro: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar retiro:', error);
    res.status(500).json({ error: 'Error al eliminar retiro' });
  }
};

// 5. Aprobar retiro
const aprobarRetiro = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('UPDATE retiros SET estado = 1 WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Retiro no encontrado' });
    res.json({ message: 'Retiro aprobado', retiro: result.rows[0] });
  } catch (error) {
    console.error('Error al aprobar retiro:', error);
    res.status(500).json({ error: 'Error al aprobar retiro' });
  }
};

const sumatoriasRetiros = async (req, res) => {
  try {
    // Consultar la sumatoria de los retiros pendientes (estado = '0') y aprobados ('1')
    const [pendientes, aprobados] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(monto), 0) as total FROM retiros WHERE estado = '0'"),
      pool.query("SELECT COALESCE(SUM(monto), 0) as total FROM retiros WHERE estado = '1'")
    ]);

    res.json({
      pendiente: parseFloat(pendientes.rows[0].total),
      aprobado: parseFloat(aprobados.rows[0].total)
    });
  } catch (error) {
    console.error('❌ Error al calcular sumatorias de retiros:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};

module.exports = {
  listarRetiros,
  listarRetirosPorUsuario,
  agregarRetiro,
  eliminarRetiro,
  aprobarRetiro,
  sumatoriasRetiros
};