const User = require("../models/User");

class UserDAO {
  async create(userData) {
    return await User.create(userData);
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      User.find(filters).skip(skip).limit(limit),
      User.countDocuments(filters),
    ]);
    return { data, total };
  }

  async update(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  async findTechnicians() {
    return await User.find({ role: "technician" });
  }

  async findClients() {
    return await User.find({ role: "client" });
  }
}

module.exports = new UserDAO();
