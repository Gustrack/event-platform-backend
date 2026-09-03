import User from '../models/User.js';

class UsersDAO {
  async create(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return user.toJSON();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('El email ya está registrado');
      }
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await User.findOne({ email }).lean();
    } catch (error) {
      throw new Error('Error al buscar usuario por email');
    }
  }

  async findById(id) {
    try {
      return await User.findById(id).lean();
    } catch (error) {
      throw new Error('Error al buscar usuario por ID');
    }
  }
}

export default new UsersDAO();
