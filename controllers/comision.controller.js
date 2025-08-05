const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const jwt = require('jsonwebtoken');

const obtenerSumatoriasComisiones = async (req, res) => {
  const userId = parseInt(req.params.iduser, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }

  try {
    // 1. Sumatoria por tipo de comisión (retirado = 0)
    const tipos = await pool.query(`
      SELECT
        ct.id AS tipo_comision_id,
        ct.descripcion,
        COALESCE(SUM(CASE
          WHEN c.beneficiario_id = $1 AND c.retirado = 0 THEN c.valor
          ELSE 0
        END), 0)::numeric(12,2) AS total
      FROM comision_tipo ct
      LEFT JOIN comisiones c ON ct.id = c.tipo_comision_id
      GROUP BY ct.id, ct.descripcion
      ORDER BY ct.id;
    `, [userId]);

    // 2. Total retirado (retirado = 1)
    const retiro = await pool.query(`
      SELECT COALESCE(SUM(valor), 0)::numeric(12,2) AS total_retirado
      FROM comisiones
      WHERE beneficiario_id = $1 AND retirado = 1;
    `, [userId]);

    // 3. Total disponible (sumatoria general - total retirado)
    const totalDisponible = tipos.rows.reduce((acc, row) => acc + parseFloat(row.total), 0) - parseFloat(retiro.rows[0].total_retirado);

    res.json({
      sumatorias: tipos.rows,
      total_retirado: retiro.rows[0].total_retirado,
      total_disponible: totalDisponible.toFixed(2)
    });

  } catch (error) {
    console.error('Error al obtener sumatorias:', error);
    res.status(500).json({ error: 'Error al obtener sumatorias de comisiones' });
  }
};


const listarComisionesPorUsuario = async (req, res) => {
  const { iduser } = req.params;
  try {
    const result = await pool.query(`
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
      WHERE c.beneficiario_id = $1
      ORDER BY c.tipo_comision_id;
    `, [iduser]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar comisiones por usuario:', err);
    res.status(500).json({ error: 'Error al obtener comisiones por usuario' });
  }
};


module.exports = { obtenerSumatoriasComisiones, listarComisionesPorUsuario };
