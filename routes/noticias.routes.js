const express = require('express');
const router = express.Router();
const {
  crearNoticia,
  eliminarNoticia,
  listarNoticias
} = require('../controllers/noticias.controller');

router.get('/', listarNoticias);      
router.post('/', crearNoticia);
router.delete('/:id', eliminarNoticia);

module.exports = router;
