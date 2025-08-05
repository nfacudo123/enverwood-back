const { getReferralDetails } = require('../models/referral.model');

const verMiArbolReferidos = async (req, res) => {
  const usuarioId = req.user.userId;

  const referidos = await getReferralDetails(usuarioId);
  const resultado = referidos.map((r) => ({
    nivel: String.fromCharCode(65 + r.level), // 0 → A, 1 → B...
    usuario_id: r.usuario_id,
    name: r.name,
    apellidos: r.apellidos,
    username: r.username,
    correo: r.email,
    sponsor_id: r.sponsor_id,
    created_at: r.created_at,
    numero_directos: parseInt(r.numero_directos),
    numero_subordinados: parseInt(r.numero_subordinados)
  }));

  res.json(resultado);
};

module.exports = { verMiArbolReferidos };
