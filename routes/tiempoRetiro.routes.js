const express = require('express');
const router = express.Router();
const controller = require('../controllers/tiempoRetiro.controller');

// Rutas: /api/tiempo-retiro
router.post('/', controller.crear);
router.get('/', controller.listar);
router.put('/:id', controller.editar);
router.delete('/:id', controller.eliminar);

module.exports = router;
