const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const { solicitarRecarga } = require('../controllers/recarga.controller');
const { solicitarRetiro } = require('../controllers/retiro.controller');
const { verSaldo } = require('../controllers/saldo.controller');
const { registrarInversion, listarInversionesUsuario } = require('../controllers/inversion.controller');
const { verMiArbolReferidos } = require('../controllers/referral.controller');
const { getUserByUsernameBasic, listarUsuarios, actualizarUsuarioPorId } = require('../controllers/users.controller');
const { verPerfil, actualizarPerfil } = require('../controllers/perfil.controller');
const { subirRecurso, upload } = require('../controllers/recursos.controller');
const { subirFotoPerfil } = require('../controllers/perfil.controller');
const uploads = require('../middleware/uploads');
const perfilUpload = require('../middleware/uploads');

const router = express.Router();

router.get('/dashboard', verifyToken, (req, res) => {
  res.json({ message: `Bienvenido, usuario ${req.user.userId}` });
});

router.post('/inversiones', verifyToken, registrarInversion);
router.get('/inversiones', verifyToken, listarInversionesUsuario);
router.get('/mis-referidos', verifyToken, verMiArbolReferidos);
router.post('/recargas', verifyToken, solicitarRecarga);
//router.post('/retiros', verifyToken, solicitarRetiro);
router.get('/saldo', verifyToken, verSaldo);
router.get('/perfil', verifyToken, verPerfil);
router.put('/perfil/update', verifyToken, perfilUpload.single('foto'), actualizarPerfil);
router.get('/u/:username', getUserByUsernameBasic);
router.get('/users', verifyToken, listarUsuarios);
router.post('/recursos/subir', upload.single('archivo'), subirRecurso);
router.put('/usuarios/:id', actualizarUsuarioPorId);
router.post('/perfil/foto/:id', verifyToken, uploads.single('foto'), subirFotoPerfil);

module.exports = router;
