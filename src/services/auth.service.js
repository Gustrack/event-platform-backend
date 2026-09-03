const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/User.repository");

class AuthService {
  async register(userData) {
    // Verificar si el email ya existe
    const exists = await UserRepository.existsByEmail(userData.email);
    if (exists) {
      throw new Error("El email ya está registrado");
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Crear usuario
    const user = await UserRepository.create({
      ...userData,
      password: hashedPassword,
    });

    // No devolver la contraseña
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async login(email, password) {
    // Buscar usuario
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Credenciales inválidas");
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    return { token, user };
  }

  async getCurrentUser(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    return user;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new Error("Contraseña actual incorrecta");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserRepository.update(userId, { password: hashedPassword });

    return true;
  }
}

module.exports = new AuthService();
