const express = require('express');
const router = express.Router();
const { obtenerLink, actualizarLink } = require('../controllers/link.controller');

// Obtener el link (GET /api/link)
router.get('/', obtenerLink);

// Actualizar el link (PUT /api/link/1)
router.put('/:id', actualizarLink);

module.exports = router;
