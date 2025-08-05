require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const usersRoutes = require('./routes/users.routes');
const inversionesRoutes = require('./routes/inversion.routes');
const recursosRoutes = require('./routes/recursos.routes');
const metodoPagoRoutes = require('./routes/metodoPago.routes');
const tiempoRetiroRoutes = require('./routes/tiempoRetiro.routes');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('✅ Bienvenido a la API de Enverwood Inversiones');
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api', require('./routes/users.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/comision-tipo', require('./routes/comisionTipo.routes'));
app.use('/api/inversiones', require('./routes/inversion.routes'));
app.use('/uploads', express.static('uploads'));
app.use('/soportes', express.static(path.join(__dirname, 'soportes')));
app.use('/api/recursos', recursosRoutes);
app.use('/api/paises',  require('./routes/paises.routes'));
app.use('/api/noticias', require('./routes/noticias.routes'));
app.use('/api/sponsor', require('./routes/sponsor.routes'));
app.use('/api/link', require('./routes/link.routes'));
app.use('/api/comisiones', require('./routes/comision.routes'));
app.use('/api/retiros', require('./routes/retiros.routes'));
app.use('/api', metodoPagoRoutes);
app.use('/api/tiempo-retiro', tiempoRetiroRoutes);

module.exports = app;
