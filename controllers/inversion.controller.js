const {
  registrarInversionDB,
  listarInversionesUsuarioDB,
  validarInversionDB,
  caducarCicloDB
} = require('../services/inversion.service');
const { eliminarInversionDB } = require('../services/inversion.service');
const { actualizarComprobante } = require('../services/inversion.service');
const { Pool } = require('pg');
const path = require('path');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const registrarInversion = async (req, res) => {
  try {
    const { usuario_id, monto } = req.body; 

    if (!usuario_id || !monto) {
      return res.status(400).json({ error: 'usuario_id y monto son obligatorios' });
    }

    const nueva = await registrarInversionDB(usuario_id, monto);
    res.status(201).json(nueva);
  } catch (error) {
    console.error('Error al registrar inversión:', error);
    res.status(500).json({ error: 'Error al registrar inversión' });
  }
};

const caducarCiclo = async (req, res) => {
  try {
    const result = await caducarCicloDB(req.params.id);
    res.json({ message: 'Ciclo caducado correctamente', inversion: result });
  } catch (error) {
    console.error('Error al caducar ciclo:', error);
    res.status(500).json({ error: error.message });
  }
};

const subirComprobante = async (req, res) => {
  const inversionId = req.params.id;
  const archivo = req.files?.[0]; // toma el primer archivo sin importar el nombre

  if (!archivo) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }

  const nombreArchivo = archivo.filename;
  const rutaRelativa = path.join('soportes', nombreArchivo);

  try {
    await pool.query(
      'UPDATE inversiones SET comprobante = $1 WHERE id = $2',
      [rutaRelativa, inversionId]
    );
    res.json({ message: 'Comprobante subido correctamente', archivo: rutaRelativa });
  } catch (error) {
    console.error('Error al guardar comprobante en DB:', error);
    res.status(500).json({ error: 'Error al actualizar la base de datos' });
  }
};

const listarInversionesUsuario = async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT 
       inv.id, inv.usuario_id, inv.monto, inv.fecha_inicio,inv.fecha_termino,
	   inv.tasa_diaria, inv.activo, inv.comprobante, u.name,
	   u.email, u.password, u.sponsor_id, u.apellidos, u.username, u.pais_id,
	   u.telefono, u.wallet_usdt, u.direccion, u.ciudad, u.estado, inv.creado_en
      FROM inversiones inv
      LEFT JOIN users u ON u.id = inv.usuario_id
      ORDER BY inv.creado_en DESC
    `);

    res.json({ inversiones: result.rows });
  } catch (err) {
    console.error('Error al obtener inversiones:', err);
    res.status(500).json({ error: 'Error al obtener inversiones' });
  }
};

const validarInversion = async (req, res) => {
  try {
    const { utilidad } = req.body;

    if (!utilidad || isNaN(utilidad)) {
      return res.status(400).json({ error: 'Debe proporcionar un valor numérico válido para la utilidad' });
    }

    const resultado = await validarInversionDB(req.params.id, parseFloat(utilidad));
    res.json(resultado);
  } catch (err) {
    console.error('Error al validar inversión:', err);
    res.status(500).json({ error: 'Error interno al validar inversión' });
  }
};

const listarUtilidades = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, us.id as usid, u.val_utilidad, u.fecha, us.name, us.email
      FROM utilidades u
      LEFT JOIN users us ON us.id = u.iduser
      ORDER BY u.fecha DESC
    `);
    res.json({ utilidades: result.rows });
  } catch (err) {
    console.error('Error al listar utilidades:', err);
    res.status(500).json({ error: 'Error al listar utilidades' });
  }
};


// Controlador para eliminar inversión
const eliminarInversion = async (req, res) => {
  try {
    const inversion = await eliminarInversionDB(req.params.id);
    res.json({ message: 'Inversión eliminada con éxito', inversion });
  } catch (err) {
    console.error('Error al eliminar inversión:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registrarInversion,
  listarInversionesUsuario,
  validarInversion,
  eliminarInversion,
  subirComprobante,
  actualizarComprobante,
  listarUtilidades,
  caducarCiclo
};
