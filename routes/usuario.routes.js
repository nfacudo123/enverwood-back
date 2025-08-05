const express = require('express');
const router = express.Router();
const { listarUsuarios } = require('../controllers/admin.controller'); // si se mueve, actualizar path

// Middleware de autenticación si es necesario
const { authMiddleware } = require('../middleware/auth.middleware');

// Ruta para listar usuarios (acceso para usuarios normales si aplica)
//router.get('/usuarios', authMiddleware, listarUsuarios);  // No más /usuarios/usuarios

module.exports = router;
