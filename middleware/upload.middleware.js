const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Asegurarse de que la carpeta 'soportes' exista
const carpeta = path.join(__dirname, '..', 'soportes');
if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta);

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, carpeta);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const nombre = `inversion_${req.params.id}_${Date.now()}${ext}`;
    cb(null, nombre);
  }
});

const upload = multer({ storage });

module.exports = upload;
