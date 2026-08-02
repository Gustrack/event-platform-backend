import eventsRepository from '../repositories/events.repository.js';

class EventsService {
  async getAllEvents() {
    return await eventsRepository.getAll();
  }
  
  async getEventById(id) {
    return await eventsRepository.getById(id);
  }
  
  async createEvent(eventData) {
    if (!eventData.title || !eventData.date || !eventData.location) {
      throw new Error('Faltan campos requeridos');
    }
    return await eventsRepository.create(eventData);
  }
  
  async updateEvent(id, updateData) {
    const existingEvent = await eventsRepository.getById(id);
    if (!existingEvent) return null;
    return await eventsRepository.update(id, updateData);
  }
  
  async deleteEvent(id) {
    const existingEvent = await eventsRepository.getById(id);
    if (!existingEvent) return false;
    return await eventsRepository.delete(id);
  }
}

export default new EventsService();
