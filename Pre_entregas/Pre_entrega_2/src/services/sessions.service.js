import usersRepository from '../repositories/users.repository.js';
import { hashPassword } from '../utils/hash.js';

class SessionsService {
  async register(userData) {
    const { first_name, last_name, email, password } = userData;
    
    if (!first_name || !last_name || !email || !password) {
      throw new Error('Faltan campos obligatorios');
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }

    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailExists = await usersRepository.emailExists(normalizedEmail);
    if (emailExists) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await hashPassword(password);

    const userDataToCreate = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user'
    };

    const newUser = await usersRepository.create(userDataToCreate);
    return newUser;
  }

  async getUserByEmail(email) {
    return await usersRepository.findByEmail(email);
  }
}

export default new SessionsService();
