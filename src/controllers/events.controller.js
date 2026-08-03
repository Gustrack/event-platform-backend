import eventsService from '../services/events.service.js';

export const getEvents = async (req, res, next) => {
  try {
    const events = await eventsService.getAllEvents();
    res.status(200).json({ status: 'success', payload: events });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventsService.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Evento no encontrado' });
    }
    res.status(200).json({ status: 'success', payload: event });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const newEvent = await eventsService.createEvent(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Evento creado exitosamente',
      payload: newEvent
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const updatedEvent = await eventsService.updateEvent(req.params.id, req.body);
    if (!updatedEvent) {
      return res.status(404).json({ status: 'error', message: 'Evento no encontrado' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Evento actualizado exitosamente',
      payload: updatedEvent
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const deleted = await eventsService.deleteEvent(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Evento no encontrado' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Evento eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};
