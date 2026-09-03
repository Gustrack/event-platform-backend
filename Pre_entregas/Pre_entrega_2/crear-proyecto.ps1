# ============================================
# SCRIPT PARA CREAR PROYECTO AUTOMÁTICAMENTE
# ============================================

Write-Host "🚀 Creando proyecto..." -ForegroundColor Cyan

# 1. CREAR CARPETAS
Write-Host "📁 Creando carpetas..." -ForegroundColor Yellow
$carpetas = @(
    "src",
    "src\config",
    "src\controllers",
    "src\dao",
    "src\models",
    "src\repositories",
    "src\routes",
    "src\services",
    "src\utils"
)

foreach ($carpeta in $carpetas) {
    if (!(Test-Path $carpeta)) {
        New-Item -ItemType Directory -Path $carpeta -Force | Out-Null
        Write-Host "  ✓ Creada: $carpeta" -ForegroundColor Green
    }
}

# 2. CREAR ARCHIVOS
Write-Host "`n📝 Creando archivos..." -ForegroundColor Yellow

# Función para crear archivos
function Crear-Archivo {
    param($ruta, $contenido)
    $contenido | Out-File -FilePath $ruta -Encoding UTF8
    Write-Host "  ✓ Creado: $ruta" -ForegroundColor Green
}

# package.json
$contenido = @'
{
  "name": "event-platform-backend",
  "version": "1.0.0",
  "type": "module",
  "description": "Plataforma de Eventos - Registro seguro",
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
Crear-Archivo "package.json" $contenido

# .env.example
$contenido = @'
PORT=3000
MONGODB_URI=mongodb://localhost:27017/event-platform
'@
Crear-Archivo ".env.example" $contenido

# .gitignore
$contenido = @'
node_modules/
.env
*.log
.DS_Store
Thumbs.db
.vscode/
.idea/
package-lock.json
'@
Crear-Archivo ".gitignore" $contenido

# src/config/database.js
$contenido = @'
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
Crear-Archivo "src\config\database.js" $contenido

# src/models/User.js
$contenido = @'
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
Crear-Archivo "src\models\User.js" $contenido

# src/dao/users.dao.js
$contenido = @'
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
Crear-Archivo "src\dao\users.dao.js" $contenido

# src/repositories/users.repository.js
$contenido = @'
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
Crear-Archivo "src\repositories\users.repository.js" $contenido

# src/utils/hash.js
$contenido = @'
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
Crear-Archivo "src\utils\hash.js" $contenido

# src/services/sessions.service.js
$contenido = @'
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
Crear-Archivo "src\services\sessions.service.js" $contenido

# src/controllers/sessions.controller.js
$contenido = @'
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
Crear-Archivo "src\controllers\sessions.controller.js" $contenido

# src/routes/sessions.router.js
$contenido = @'
import { Router } from 'express';
import sessionsController from '../controllers/sessions.controller.js';

const router = Router();

router.post('/register', sessionsController.register);

export default router;
'@
Crear-Archivo "src\routes\sessions.router.js" $contenido

# src/app.js
$contenido = @'
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
Crear-Archivo "src\app.js" $contenido

# README.md
$contenido = @'
# Event Platform - Registro seguro de usuarios

## Instalación rápida

```bash
npm install
copy .env.example .env
npm run dev