import usersDAO from '../dao/users.dao.js';

class UsersRepository {
  async create(userData) {
    return await usersDAO.create(userData);
  }

  async findByEmail(email) {
    return await usersDAO.findByEmail(email);
  }

  async findById(id) {
    return await usersDAO.findById(id);
  }

  async emailExists(email) {
    const user = await usersDAO.findByEmail(email);
    return user !== null;
  }
}

export default new UsersRepository();
