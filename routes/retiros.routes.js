const express = require('express');
const router = express.Router();
const {
  listarRetiros,
  listarRetirosPorUsuario,
  agregarRetiro,
  eliminarRetiro,
  aprobarRetiro,
  sumatoriasRetiros
} = require('../controllers/retiros.controller');

router.get('/', listarRetiros);
router.get('/:id', listarRetirosPorUsuario);
router.post('/', agregarRetiro);
router.delete('/:id', eliminarRetiro);
router.put('/aprobar/:id', aprobarRetiro);
router.get('/sumatorias/totales', sumatoriasRetiros);

module.exports = router;
