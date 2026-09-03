const UserDAO = require("../dao/User.dao");

class UserRepository {
  async create(userData) {
    return await UserDAO.create(userData);
  }

  async findById(id) {
    return await UserDAO.findById(id);
  }

  async findByEmail(email) {
    return await UserDAO.findByEmail(email);
  }

  async findAll(filters = {}, page = 1, limit = 10) {
    return await UserDAO.findAll(filters, page, limit);
  }

  async update(id, data) {
    return await UserDAO.update(id, data);
  }

  async delete(id) {
    return await UserDAO.delete(id);
  }

  async findTechnicians() {
    return await UserDAO.findTechnicians();
  }

  async findClients() {
    return await UserDAO.findClients();
  }

  async existsByEmail(email) {
    const user = await UserDAO.findByEmail(email);
    return !!user;
  }
}

module.exports = new UserRepository();
