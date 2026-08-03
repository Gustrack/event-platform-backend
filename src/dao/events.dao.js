// DAO sin MongoDB - Almacenamiento en memoria para pruebas
class EventsDAO {
  constructor() {
    this.events = [];
    this.nextId = 1;
  }

  async getAll() {
    return this.events;
  }

  async getById(id) {
    return this.events.find((e) => e._id === id) || null;
  }

  async create(data) {
    const newEvent = {
      ...data,
      _id: `event_${this.nextId++}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.events.push(newEvent);
    return newEvent;
  }

  async update(id, data) {
    const index = this.events.findIndex((e) => e._id === id);
    if (index !== -1) {
      this.events[index] = {
        ...this.events[index],
        ...data,
        updatedAt: new Date(),
      };
      return this.events[index];
    }
    return null;
  }

  async delete(id) {
    const index = this.events.findIndex((e) => e._id === id);
    if (index !== -1) {
      this.events.splice(index, 1);
      return true;
    }
    return false;
  }
}

export default new EventsDAO();
