import sessionsService from '../services/sessions.service.js';

class SessionsController {
  async register(req, res) {
    try {
      const userData = req.body;
      const newUser = await sessionsService.register(userData);
      
      res.status(201).json({
        status: 'success',
        payload: newUser
      });
    } catch (error) {
      if (error.message === 'Faltan campos obligatorios' || 
          error.message === 'Email inválido' ||
          error.message === 'La contraseña debe tener al menos 8 caracteres') {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      
      if (error.message === 'El email ya está registrado') {
        return res.status(409).json({
          status: 'error',
          message: error.message
        });
      }
      
      console.error('Error en registro:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }
}

export default new SessionsController();
