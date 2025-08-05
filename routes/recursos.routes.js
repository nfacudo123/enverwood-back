const express = require('express');
const { subirRecurso, listarRecursos, obtenerRecursoPorId, eliminarRecurso } = require('../controllers/recursos.controller');
const { upload } = require('../controllers/recursos.controller');
const router = express.Router();

// Ruta para subir un recurso (archivo)
router.post('/subir', upload.single('archivo'), subirRecurso);

// Ruta para listar todos los recursos
router.get('/', listarRecursos);

// Ruta para obtener un recurso por ID
router.get('/:id', obtenerRecursoPorId);

// Ruta para eliminar un recurso por ID
router.delete('/:id', eliminarRecurso);

module.exports = router;
