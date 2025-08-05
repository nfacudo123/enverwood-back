// routes/paises.routes.js

const express = require('express');
const router = express.Router();
const { listarPaises } = require('../controllers/paises.controller');  // Asegúrate de que la función esté importada correctamente

// Ruta para listar todos los países
router.get('/', listarPaises);  // Esto corresponde a '/api/paises'

module.exports = router;
