const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const qrUpload = require('../middleware/qrUpload');
const {
  listarMetodoPago,
  agregarMetodoPago,
  editarMetodoPago,
  eliminarMetodoPago
} = require('../controllers/metodoPago.controller');

router.get('/metodo_pago', verifyToken, listarMetodoPago);
router.post('/metodo_pago', verifyToken, qrUpload.single('img_qr'), agregarMetodoPago);
router.put('/metodo_pago/:id', verifyToken, qrUpload.single('img_qr'), editarMetodoPago);
router.delete('/metodo_pago/:id', verifyToken, eliminarMetodoPago);

module.exports = router;
