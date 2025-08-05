const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { validarInversion, eliminarInversion, listarUtilidades, caducarCiclo } = require('../controllers/inversion.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { subirComprobante } = require('../controllers/inversion.controller');

// Validar inversión (solo admin)
router.post('/validar/:id', verifyToken, validarInversion);
router.delete('/:id', verifyToken, eliminarInversion);
router.post('/comprobante/:id', verifyToken, upload.any(), subirComprobante);
router.get('/utilidades', listarUtilidades);
router.put('/caducar/:id', verifyToken, caducarCiclo);

module.exports = router;
