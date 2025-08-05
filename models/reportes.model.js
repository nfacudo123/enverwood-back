const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function obtenerResumenFinanciero() {
  const consultas = {
    recargas:  `SELECT COALESCE(SUM(monto), 0) AS total FROM recargas WHERE estado = 'aprobada'`,
    retiros:   `SELECT COALESCE(SUM(monto), 0) AS total FROM retiros WHERE estado = 'pagado'`,
    bonos:     `SELECT COALESCE(SUM(monto), 0) AS total FROM bonos`,
    ganancias_pagadas:   `SELECT COALESCE(SUM(monto), 0) AS total FROM ganancias WHERE pagada = true`,
    ganancias_pendientes:`SELECT COALESCE(SUM(monto), 0) AS total FROM ganancias WHERE pagada = false`,
    inversiones: `SELECT COALESCE(SUM(monto), 0) AS total FROM inversiones`
  };

  const [recargas, retiros, bonos, ganPagadas, ganPendientes, inversiones] = await Promise.all(
    Object.values(consultas).map(q => pool.query(q))
  );

  const totalRecargas  = parseFloat(recargas.rows[0].total);
  const totalRetiros   = parseFloat(retiros.rows[0].total);
  const totalBonos     = parseFloat(bonos.rows[0].total);
  const totalGanPag    = parseFloat(ganPagadas.rows[0].total);
  const totalGanPend   = parseFloat(ganPendientes.rows[0].total);
  const totalInvertido = parseFloat(inversiones.rows[0].total);

  const saldoNeto = totalRecargas - (totalRetiros + totalBonos + totalGanPag);

  return {
    total_invertido: totalInvertido,
    total_recargas: totalRecargas,
    total_retiros: totalRetiros,
    total_bonos: totalBonos,
    total_ganancias_pagadas: totalGanPag,
    total_ganancias_pendientes: totalGanPend,
    saldo_neto_sistema: saldoNeto,
    estado_financiero: saldoNeto >= 0 ? 'ganancia' : 'déficit'
  };
}

module.exports = { obtenerResumenFinanciero };
