import sessionsDao from '../dao/sessions.dao.js';

class SessionsRepository {
  async create(data) {
    return await sessionsDao.create(data);
  }
  
  async findByEmail(email) {
    return await sessionsDao.findByEmail(email);
  }
  
  async findById(id) {
    return await sessionsDao.findById(id);
  }
}

export default new SessionsRepository();
