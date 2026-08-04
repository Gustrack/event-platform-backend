const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

// ----- REGISTRO -----
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    // Validar campos obligatorios
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
    }

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar duplicado
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'El email ya está registrado' });
    }

    // Hashear password
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const newUser = await User.create({
      first_name,
      last_name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'user'
    });

    // Respuesta sin password
    res.status(201).json({ status: 'success', payload: newUser });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ----- LOGIN -----
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Faltan credenciales' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Comparar contraseña (si no existe usuario, también falla)
    let isValid = false;
    if (user) {
      isValid = await comparePassword(password, user.password);
    }

    if (!user || !isValid) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
    }

    // Generar JWT
    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const token = generateToken(tokenPayload);

    // Configurar cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('currentUser', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 3600000, // 1 hora
      secure: isProduction
    });

    res.status(200).json({ status: 'success', message: 'Login correcto' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ----- CURRENT (protegida) -----
const current = async (req, res) => {
  // req.user ya fue asignado por auth middleware
  res.status(200).json({ status: 'success', payload: req.user });
};

// ----- LOGOUT -----
const logout = (req, res) => {
  res.clearCookie('currentUser');
  res.status(200).json({ status: 'success', message: 'Sesión cerrada' });
};

module.exports = { register, login, current, logout };
