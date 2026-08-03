# setup-project.ps1 - Versión Corregida
Write-Host "🚀 Iniciando configuración del proyecto de registro de usuarios" -ForegroundColor Cyan

# 1. Crear directorio del proyecto
Write-Host "📁 Creando estructura de carpetas..." -ForegroundColor Yellow
$folders = @(
    "src\config",
    "src\controllers",
    "src\dao",
    "src\models",
    "src\repositories",
    "src\routes",
    "src\services",
    "src\utils"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# 2. Crear archivos con contenido
Write-Host "📝 Creando archivos del proyecto..." -ForegroundColor Yellow

# package.json
$packageJson = @'
{
  "name": "event-platform-backend",
  "version": "1.0.0",
  "type": "module",
  "description": "Plataforma de Eventos e Inscripciones - Registro seguro de usuarios",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mongoose": "^8.5.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
'@
$packageJson | Out-File -FilePath "package.json" -Encoding UTF8

# .env.example
$envExample = @'
# Puerto del servidor
PORT=3000

# Conexión a MongoDB
MONGODB_URI=mongodb://localhost:27017/event-platform
'@
$envExample | Out-File -FilePath ".env.example" -Encoding UTF8

# .gitignore
$gitignore = @'
# Dependencias
node_modules/
package-lock.json

# Variables de entorno
.env

# Logs
*.log

# Sistema operativo
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/
'@
$gitignore | Out-File -FilePath ".gitignore" -Encoding UTF8

# src/config/database.js
$databaseJs = @'
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
'@
$databaseJs | Out-File -FilePath "src\config\database.js" -Encoding UTF8

# src/models/User.js
$userJs = @'
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  last_name: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres']
  },
  role: {
    type: String,
    enum: ['user', 'organizer', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  versionKey: false
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.password;
    return returnedObject;
  }
});

export default mongoose.model('User', userSchema);
'@
$userJs | Out-File -FilePath "src\models\User.js" -Encoding UTF8

# src/dao/users.dao.js
$usersDaoJs = @'
import User from '../models/User.js';

class UsersDAO {
  async create(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return user.toJSON();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('El email ya está registrado');
      }
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await User.findOne({ email }).lean();
    } catch (error) {
      throw new Error('Error al buscar usuario por email');
    }
  }

  async findById(id) {
    try {
      return await User.findById(id).lean();
    } catch (error) {
      throw new Error('Error al buscar usuario por ID');
    }
  }
}

export default new UsersDAO();
'@
$usersDaoJs | Out-File -FilePath "src\dao\users.dao.js" -Encoding UTF8

# src/repositories/users.repository.js
$usersRepositoryJs = @'
import usersDAO from '../dao/users.dao.js';

class UsersRepository {
  async create(userData) {
    return await usersDAO.create(userData);
  }

  async findByEmail(email) {
    return await usersDAO.findByEmail(email);
  }

  async findById(id) {
    return await usersDAO.findById(id);
  }

  async emailExists(email) {
    const user = await usersDAO.findByEmail(email);
    return user !== null;
  }
}

export default new UsersRepository();
'@
$usersRepositoryJs | Out-File -FilePath "src\repositories\users.repository.js" -Encoding UTF8

# src/utils/hash.js
$hashJs = @'
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Error al hashear la contraseña');
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};
'@
$hashJs | Out-File -FilePath "src\utils\hash.js" -Encoding UTF8

# src/services/sessions.service.js
$sessionsServiceJs = @'
import usersRepository from '../repositories/users.repository.js';
import { hashPassword } from '../utils/hash.js';

class SessionsService {
  async register(userData) {
    const { first_name, last_name, email, password } = userData;
    
    if (!first_name || !last_name || !email || !password) {
      throw new Error('Faltan campos obligatorios');
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }

    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailExists = await usersRepository.emailExists(normalizedEmail);
    if (emailExists) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await hashPassword(password);

    const userDataToCreate = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user'
    };

    const newUser = await usersRepository.create(userDataToCreate);
    return newUser;
  }

  async getUserByEmail(email) {
    return await usersRepository.findByEmail(email);
  }
}

export default new SessionsService();
'@
$sessionsServiceJs | Out-File -FilePath "src\services\sessions.service.js" -Encoding UTF8

# src/controllers/sessions.controller.js
$sessionsControllerJs = @'
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
'@
$sessionsControllerJs | Out-File -FilePath "src\controllers\sessions.controller.js" -Encoding UTF8

# src/routes/sessions.router.js
$sessionsRouterJs = @'
import { Router } from 'express';
import sessionsController from '../controllers/sessions.controller.js';

const router = Router();

router.post('/register', sessionsController.register);

export default router;
'@
$sessionsRouterJs | Out-File -FilePath "src\routes\sessions.router.js" -Encoding UTF8

# src/app.js
$appJs = @'
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import sessionsRouter from './routes/sessions.router.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api/sessions', sessionsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Algo salió mal en el servidor'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
'@
$appJs | Out-File -FilePath "src\app.js" -Encoding UTF8

# README.md
$readme = @'
# Event Platform - Registro seguro de usuarios

## Instalación

1. Instalar dependencias:
```bash
npm install