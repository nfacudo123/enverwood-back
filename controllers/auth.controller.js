const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getUserByEmail, getUserByUsername, createUser } = require('../models/user.model');

const register = async (req, res) => {
  const { name, apellidos, username, email, password, pais_id, telefono, sponsorId } = req.body;

  const existingEmail = await getUserByEmail(email);
  if (existingEmail) return res.status(400).json({ message: 'Correo ya registrado' });

  const existingUsername = await getUserByUsername(username);
  if (existingUsername) return res.status(400).json({ message: 'Nombre de usuario ya está en uso' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser(name, apellidos, username, email, hashed, pais_id, telefono, sponsorId || null);

  const token = jwt.sign({ userId: user.id, role: user.role || 'usuario' }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.status(201).json({ token });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({ token, userId: user.id });
};

module.exports = { register, login };
