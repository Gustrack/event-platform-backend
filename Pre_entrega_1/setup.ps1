# Script de configuracion para la Pre-entrega 1
Write-Host "Iniciando configuracion del proyecto..." -ForegroundColor Green

# Crear estructura de carpetas
Write-Host "Creando estructura de carpetas..." -ForegroundColor Yellow
$folders = @(
    "src/config",
    "src/routes",
    "src/controllers",
    "src/services",
    "src/repositories",
    "src/dao",
    "src/models",
    "src/middlewares",
    "src/utils"
)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "  Creada: $folder" -ForegroundColor Green
    }
}

Write-Host "Creando archivos..." -ForegroundColor Yellow

# src/app.js
@'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor activo',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Event Platform API',
    version: '1.0.0',
    status: 'active'
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Error interno del servidor'
  });
});

export default app;
'@ | Out-File -FilePath src/app.js -Encoding UTF8
Write-Host "  Creado: src/app.js" -ForegroundColor Green

# src/server.js
@'
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Entorno: ${NODE_ENV}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya esta en uso`);
  } else {
    console.error('Error del servidor:', error);
  }
});

export default server;
'@ | Out-File -FilePath src/server.js -Encoding UTF8
Write-Host "  Creado: src/server.js" -ForegroundColor Green

# src/config/config.js
@'
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/event-platform',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me'
};

export default config;
'@ | Out-File -FilePath src/config/config.js -Encoding UTF8
Write-Host "  Creado: src/config/config.js" -ForegroundColor Green

# src/models/User.js
@'
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'organizer'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
'@ | Out-File -FilePath src/models/User.js -Encoding UTF8
Write-Host "  Creado: src/models/User.js" -ForegroundColor Green

# src/models/Event.js
@'
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['conferencia', 'taller', 'seminario', 'networking', 'social', 'deportivo', 'cultural', 'educativo']
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentRegistrations: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isVirtual: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
'@ | Out-File -FilePath src/models/Event.js -Encoding UTF8
Write-Host "  Creado: src/models/Event.js" -ForegroundColor Green

# src/routes/events.router.js
@'
import { Router } from 'express';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/events.controller.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
'@ | Out-File -FilePath src/routes/events.router.js -Encoding UTF8
Write-Host "  Creado: src/routes/events.router.js" -ForegroundColor Green

# src/routes/sessions.router.js
@'
import { Router } from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/sessions.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/current', getCurrentUser);

export default router;
'@ | Out-File -FilePath src/routes/sessions.router.js -Encoding UTF8
Write-Host "  Creado: src/routes/sessions.router.js" -ForegroundColor Green

# src/controllers/events.controller.js
@'
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
'@ | Out-File -FilePath src/controllers/events.controller.js -Encoding UTF8
Write-Host "  Creado: src/controllers/events.controller.js" -ForegroundColor Green

# src/controllers/sessions.controller.js
@'
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
'@ | Out-File -FilePath src/controllers/sessions.controller.js -Encoding UTF8
Write-Host "  Creado: src/controllers/sessions.controller.js" -ForegroundColor Green

# src/services/events.service.js
@'
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
'@ | Out-File -FilePath src/services/events.service.js -Encoding UTF8
Write-Host "  Creado: src/services/events.service.js" -ForegroundColor Green

# src/services/sessions.service.js
@'
import sessionsRepository from '../repositories/sessions.repository.js';
import { hashPassword, comparePasswords, generateToken } from '../utils/index.js';

class SessionsService {
  async register(userData) {
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error('Faltan campos requeridos');
    }
    
    const existingUser = await sessionsRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El email ya esta registrado');
    }
    
    userData.password = await hashPassword(userData.password);
    return await sessionsRepository.create(userData);
  }
  
  async login(email, password) {
    const user = await sessionsRepository.findByEmail(email);
    if (!user) throw new Error('Credenciales invalidas');
    
    const isValidPassword = await comparePasswords(password, user.password);
    if (!isValidPassword) throw new Error('Credenciales invalidas');
    
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const userWithoutPassword = user.toObject ? user.toObject() : user;
    delete userWithoutPassword.password;
    
    return { user: userWithoutPassword, token };
  }
  
  async logout() {
    return true;
  }
  
  async getCurrentUser() {
    return { id: '1', name: 'Usuario Ejemplo', email: 'usuario@ejemplo.com' };
  }
}

export default new SessionsService();
'@ | Out-File -FilePath src/services/sessions.service.js -Encoding UTF8
Write-Host "  Creado: src/services/sessions.service.js" -ForegroundColor Green

# src/repositories/events.repository.js
@'
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
'@ | Out-File -FilePath src/repositories/events.repository.js -Encoding UTF8
Write-Host "  Creado: src/repositories/events.repository.js" -ForegroundColor Green

# src/repositories/sessions.repository.js
@'
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
'@ | Out-File -FilePath src/repositories/sessions.repository.js -Encoding UTF8
Write-Host "  Creado: src/repositories/sessions.repository.js" -ForegroundColor Green

# src/dao/events.dao.js
@'
import Event from '../models/Event.js';

class EventsDAO {
  async getAll() {
    return await Event.find().sort({ date: 1 });
  }
  
  async getById(id) {
    return await Event.findById(id);
  }
  
  async create(data) {
    return await Event.create(data);
  }
  
  async update(id, data) {
    return await Event.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
  
  async delete(id) {
    return await Event.findByIdAndDelete(id);
  }
}

export default new EventsDAO();
'@ | Out-File -FilePath src/dao/events.dao.js -Encoding UTF8
Write-Host "  Creado: src/dao/events.dao.js" -ForegroundColor Green

# src/dao/sessions.dao.js
@'
import User from '../models/User.js';

class SessionsDAO {
  async create(data) {
    return await User.create(data);
  }
  
  async findByEmail(email) {
    return await User.findOne({ email });
  }
  
  async findById(id) {
    return await User.findById(id);
  }
}

export default new SessionsDAO();
'@ | Out-File -FilePath src/dao/sessions.dao.js -Encoding UTF8
Write-Host "  Creado: src/dao/sessions.dao.js" -ForegroundColor Green

# src/utils/index.js
@'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

export default {
  hashPassword,
  comparePasswords,
  generateToken,
  verifyToken
};
'@ | Out-File -FilePath src/utils/index.js -Encoding UTF8
Write-Host "  Creado: src/utils/index.js" -ForegroundColor Green

# src/middlewares/index.js
@'
export default {};
'@ | Out-File -FilePath src/middlewares/index.js -Encoding UTF8
Write-Host "  Creado: src/middlewares/index.js" -ForegroundColor Green

# Crear archivos de configuracion
Write-Host "Creando archivos de configuracion..." -ForegroundColor Yellow

if (!(Test-Path .env.example)) {
    @'
PORT=3000
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/event-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
'@ | Out-File -FilePath .env.example -Encoding UTF8
    Write-Host "  Creado: .env.example" -ForegroundColor Green
}

if (!(Test-Path .env)) {
    @'
PORT=3000
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/event-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
'@ | Out-File -FilePath .env -Encoding UTF8
    Write-Host "  Creado: .env" -ForegroundColor Green
}

if (!(Test-Path README.md)) {
    @'
# Event Platform Backend API

## Descripcion
API RESTful para gestion de eventos e inscripciones.

## Tecnologias
- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticacion
- ESLint

## Instalacion
npm install
npm run dev

## Endpoints
- GET /api/health - Health check
- GET /api/events - Listar eventos
- POST /api/sessions/register - Registrar usuario
- POST /api/sessions/login - Login
'@ | Out-File -FilePath README.md -Encoding UTF8
    Write-Host "  Creado: README.md" -ForegroundColor Green
}

Write-Host ""
Write-Host "Estructura del proyecto creada exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "1. Ejecutar: npm run dev" -ForegroundColor White
Write-Host "2. Probar: http://localhost:3000/api/health" -ForegroundColor White
Write-Host "3. Probar: http://localhost:3000/api/events" -ForegroundColor White
Write-Host ""
Write-Host "Para verificar el codigo:" -ForegroundColor Yellow
Write-Host "npm run lint" -ForegroundColor White