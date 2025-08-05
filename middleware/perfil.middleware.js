// middlewares/perfil.middleware.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const carpeta = path.join(__dirname, '..', 'uploads/perfil');
if (!fs.existsSync(carpeta)) {
  console.log('📁 Creando carpeta uploads/perfil...');
  fs.mkdirSync(carpeta, { recursive: true });
} else {
  console.log('📁 Carpeta uploads/perfil ya existe');
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('📥 Guardando archivo en:', carpeta);
    cb(null, carpeta);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const nombre = `perfil_${req.user?.id || 'user'}_${Date.now()}${ext}`;
    console.log('📝 Nombre generado del archivo:', nombre);
    cb(null, nombre);
  }
});

const perfilUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log('🧪 Validando tipo de archivo:', file.mimetype);
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('❌ Formato no permitido: solo JPG y PNG'));
    }
  }
});

module.exports = perfilUpload;
