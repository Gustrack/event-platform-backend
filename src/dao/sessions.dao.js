// DAO sin MongoDB - Almacenamiento en memoria para pruebas
class SessionsDAO {
  constructor() {
    this.users = [];
    this.nextId = 1;
  }

  async create(data) {
    const newUser = {
      ...data,
      _id: `user_${this.nextId++}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async findByEmail(email) {
    return this.users.find((u) => u.email === email) || null;
  }

  async findById(id) {
    return this.users.find((u) => u._id === id) || null;
  }

  async update(id, data) {
    const index = this.users.findIndex((u) => u._id === id);
    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        ...data,
        updatedAt: new Date(),
      };
      return this.users[index];
    }
    return null;
  }

  async delete(id) {
    const index = this.users.findIndex((u) => u._id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}

export default new SessionsDAO();
