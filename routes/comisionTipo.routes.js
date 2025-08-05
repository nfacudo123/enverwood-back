const express = require('express');
const router = express.Router();

const {
  crearComisionTipo,
  editarComisionTipo,
  listarComisionTipos
} = require('../controllers/comisionTipo.controller');

// ✅ Importar ambos desde el mismo archivo
const { authMiddleware } = require('../middleware/auth.middleware');

// Solo administrador puede gestionar esto
router.post('/', authMiddleware, crearComisionTipo);
router.put('/:id', authMiddleware, editarComisionTipo);
router.get('/', authMiddleware, listarComisionTipos);

module.exports = router;
