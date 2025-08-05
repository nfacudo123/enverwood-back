const express = require('express');
const router = express.Router();
const { cambiarSponsor } = require('../controllers/sponsor.controller');

router.post('/cambiar', cambiarSponsor);

module.exports = router;
