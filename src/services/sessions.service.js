import sessionsRepository from '../repositories/sessions.repository.js';
import { hashPassword, comparePasswords, generateToken } from '../utils/index.js';

class SessionsService {
  async register(userData) {
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error('Faltan campos requeridos');
    }
    
    const existingUser = await sessionsRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El email ya esta registrado');
    }
    
    userData.password = await hashPassword(userData.password);
    return await sessionsRepository.create(userData);
  }
  
  async login(email, password) {
    const user = await sessionsRepository.findByEmail(email);
    if (!user) throw new Error('Credenciales invalidas');
    
    const isValidPassword = await comparePasswords(password, user.password);
    if (!isValidPassword) throw new Error('Credenciales invalidas');
    
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const userWithoutPassword = user.toObject ? user.toObject() : user;
    delete userWithoutPassword.password;
    
    return { user: userWithoutPassword, token };
  }
  
  async logout() {
    return true;
  }
  
  async getCurrentUser() {
    return { id: '1', name: 'Usuario Ejemplo', email: 'usuario@ejemplo.com' };
  }
}

export default new SessionsService();
