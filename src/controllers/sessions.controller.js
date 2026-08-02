import sessionsService from '../services/sessions.service.js';

export const register = async (req, res, next) => {
  try {
    const newUser = await sessionsService.register(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      payload: newUser
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await sessionsService.login(req.body.email, req.body.password);
    res.status(200).json({
      status: 'success',
      message: 'Login exitoso',
      payload: result
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await sessionsService.logout();
    res.status(200).json({
      status: 'success',
      message: 'Logout exitoso'
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await sessionsService.getCurrentUser();
    res.status(200).json({
      status: 'success',
      payload: user
    });
  } catch (error) {
    next(error);
  }
};
