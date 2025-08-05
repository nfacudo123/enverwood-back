const { getReferralChain } = require('../models/referral.model');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const porcentajes = [0.10, 0.07, 0.05, 0.03, 0.01]; // A–E

async function repartirBonosPorRecarga(userId, montoRecarga) {
  const referidos = await getReferralChain(userId, 5);

  for (let i = 0; i < referidos.length && i < 5; i++) {
    const bono = montoRecarga * porcentajes[i];
    await pool.query(
      'INSERT INTO bonos (usuario_id, nivel, monto, fuente_usuario_id) VALUES ($1, $2, $3, $4)',
      [referidos[i].id, i + 1, bono, userId]
    );
  }
}

module.exports = { repartirBonosPorRecarga };
