const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function calcularSaldoDisponible(usuarioId) {
  const queries = {
    recargas: `SELECT COALESCE(SUM(monto), 0) AS total FROM recargas WHERE usuario_id = $1 AND estado = 'aprobada'`,
    retiros: `SELECT COALESCE(SUM(monto), 0) AS total FROM retiros WHERE usuario_id = $1 AND estado = 'pagado'`,
    bonos:    `SELECT COALESCE(SUM(monto), 0) AS total FROM bonos WHERE usuario_id = $1`,
    ganancias:`SELECT COALESCE(SUM(monto), 0) AS total FROM ganancias WHERE usuario_id = $1 AND pagada = true`
  };

  const [r1, r2, r3, r4] = await Promise.all([
    pool.query(queries.recargas, [usuarioId]),
    pool.query(queries.retiros, [usuarioId]),
    pool.query(queries.bonos, [usuarioId]),
    pool.query(queries.ganancias, [usuarioId]),
  ]);

  return {
    saldo: parseFloat(r1.rows[0].total) + parseFloat(r3.rows[0].total) + parseFloat(r4.rows[0].total) - parseFloat(r2.rows[0].total)
  };
}

module.exports = { calcularSaldoDisponible };
