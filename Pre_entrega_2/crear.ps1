# Script simple para crear el proyecto
Write-Host "Creando proyecto..." -ForegroundColor Green

# Crear carpetas
New-Item -ItemType Directory -Force -Path "src\config" | Out-Null
New-Item -ItemType Directory -Force -Path "src\controllers" | Out-Null
New-Item -ItemType Directory -Force -Path "src\dao" | Out-Null
New-Item -ItemType Directory -Force -Path "src\models" | Out-Null
New-Item -ItemType Directory -Force -Path "src\repositories" | Out-Null
New-Item -ItemType Directory -Force -Path "src\routes" | Out-Null
New-Item -ItemType Directory -Force -Path "src\services" | Out-Null
New-Item -ItemType Directory -Force -Path "src\utils" | Out-Null

Write-Host "Carpetas creadas" -ForegroundColor Green

# Crear package.json
Set-Content -Path "package.json" -Value '{
  "name": "event-platform-backend",
  "version": "1.0.0",
  "type": "module",
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
}' -Encoding UTF8

# Crear .env.example
Set-Content -Path ".env.example" -Value 'PORT=3000
MONGODB_URI=mongodb://localhost:27017/event-platform' -Encoding UTF8

# Crear .gitignore
Set-Content -Path ".gitignore" -Value 'node_modules/
.env
*.log
.DS_Store
Thumbs.db
.vscode/
.idea/
package-lock.json' -Encoding UTF8

# Crear database.js
Set-Content -Path "src\config\database.js" -Value "import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;" -Encoding UTF8

# Crear User.js
Set-Content -Path "src\models\User.js" -Value "import mongoose from 'mongoose';

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

export default mongoose.model('User', userSchema);" -Encoding UTF8

# Crear users.dao.js
Set-Content -Path "src\dao\users.dao.js" -Value "import User from '../models/User.js';

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

export default new UsersDAO();" -Encoding UTF8

# Crear users.repository.js
Set-Content -Path "src\repositories\users.repository.js" -Value "import usersDAO from '../dao/users.dao.js';

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

export default new UsersRepository();" -Encoding UTF8

# Crear hash.js
Set-Content -Path "src\utils\hash.js" -Value "import bcrypt from 'bcrypt';

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
};" -Encoding UTF8

# Crear sessions.service.js
Set-Content -Path "src\services\sessions.service.js" -Value "import usersRepository from '../repositories/users.repository.js';
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

export default new SessionsService();" -Encoding UTF8

# Crear sessions.controller.js
Set-Content -Path "src\controllers\sessions.controller.js" -Value "import sessionsService from '../services/sessions.service.js';

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

export default new SessionsController();" -Encoding UTF8

# Crear sessions.router.js
Set-Content -Path "src\routes\sessions.router.js" -Value "import { Router } from 'express';
import sessionsController from '../controllers/sessions.controller.js';

const router = Router();

router.post('/register', sessionsController.register);

export default router;" -Encoding UTF8

# Crear app.js
Set-Content -Path "src\app.js" -Value "import express from 'express';
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
});" -Encoding UTF8

# Crear README.md simple
Set-Content -Path "README.md" -Value "# Event Platform - Registro seguro de usuarios

## Instalacion
npm install
copy .env.example .env
npm run dev

## Endpoint
POST /api/sessions/register

## Body ejemplo
{
  first_name: Ana,
  last_name: Perez,
  email: ana@mail.com,
  password: Secreta123
}" -Encoding UTF8

Write-Host "✅ PROYECTO CREADO EXITOSAMENTE!" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. npm install"
Write-Host "2. copy .env.example .env"
Write-Host "3. npm run dev"