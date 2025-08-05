const { calcularSaldoDisponible } = require('../models/saldo.model');

const verSaldo = async (req, res) => {
  const usuarioId = req.user.userId;
  const resultado = await calcularSaldoDisponible(usuarioId);
  res.json(resultado);
};

module.exports = { verSaldo };
