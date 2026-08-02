import eventsDao from '../dao/events.dao.js';

class EventsRepository {
  async getAll() {
    return await eventsDao.getAll();
  }
  
  async getById(id) {
    return await eventsDao.getById(id);
  }
  
  async create(data) {
    return await eventsDao.create(data);
  }
  
  async update(id, data) {
    return await eventsDao.update(id, data);
  }
  
  async delete(id) {
    return await eventsDao.delete(id);
  }
}

export default new EventsRepository();
