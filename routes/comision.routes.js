const express = require('express');
const router = express.Router();
const { obtenerSumatoriasComisiones, listarComisionesPorUsuario } = require('../controllers/comision.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/sumatorias/:iduser', authMiddleware, obtenerSumatoriasComisiones);
router.get('/comisiones/:iduser', listarComisionesPorUsuario);

module.exports = router;
