const express = require('express');
const { verifyToken, isAdmin, authMiddleware } = require('../middleware/auth.middleware');
const { aprobarRecarga } = require('../controllers/recarga.controller');
const { aprobarRetiro } = require('../controllers/retiros.controller');
const { listarInversiones } = require('../controllers/admin.controller');
const { actualizarUsuario } = require('../controllers/admin.controller');
const {
  validarInversion,
  obtenerComisionesPorInversion,
  listarInversionesConResumen,
} = require('../controllers/admin.controller');
const {
  verResumenGeneral,
  exportarResumenCSV,
  exportarResumenExcel,
  exportarResumenPDF
} = require('../controllers/reportes.controller');
const router = express.Router();

router.get('/users', verifyToken, isAdmin, (req, res) => {
  res.json({ message: 'Vista de admin' });
});

// Ruta para que el admin apruebe una recarga
router.post('/recargas/:recargaId/aprobar', verifyToken, isAdmin, aprobarRecarga);
router.post('/retiros/:retiroId/aprobar', verifyToken, isAdmin, aprobarRetiro);
router.get('/reportes/resumen', verifyToken, isAdmin, verResumenGeneral);
router.get('/reportes/resumen/csv', verifyToken, isAdmin, exportarResumenCSV);
router.get('/reportes/resumen/excel', verifyToken, isAdmin, exportarResumenExcel);
router.get('/reportes/resumen/pdf', verifyToken, isAdmin, exportarResumenPDF);
router.put('/validar-inversion/:id', authMiddleware, validarInversion);
router.get('/comisiones/:idInversion', authMiddleware, isAdmin, obtenerComisionesPorInversion);
router.get('/inversiones-resumen', authMiddleware, isAdmin, listarInversionesConResumen);
//router.get('/inversiones', authMiddleware, isAdmin, listarInversiones);
//router.get('/usuarios', listarUsuarios);
router.put('/usuarios/:id', authMiddleware, isAdmin, actualizarUsuario);

module.exports = router;
