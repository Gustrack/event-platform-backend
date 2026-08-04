const fs = require("fs");
const path = require("path");

// Ruta base: asumimos que el script se ejecuta desde la raíz del proyecto
// y que la carpeta Pre_entrega_3 ya existe.
const BASE_DIR = path.join(__dirname, "Pre_entrega_3");

// Función para crear directorios recursivamente
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Creado: ${dirPath}`);
  }
}

// Función para escribir un archivo con su contenido
function writeFile(filePath, content) {
  const fullPath = path.join(BASE_DIR, filePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, "utf8");
  console.log(`📄 Creado: ${filePath}`);
}

// ------------------------------------------------------------
// 1. .env.example
// ------------------------------------------------------------
writeFile(
  ".env.example",
  `PORT=3000
MONGO_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1h
NODE_ENV=development
`,
);

// ------------------------------------------------------------
// 2. package.json
// ------------------------------------------------------------
writeFile(
  "package.json",
  `{
  "name": "event-platform-backend-pre3",
  "version": "1.0.0",
  "description": "Pre-entrega 3 - Autenticación JWT con cookies",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
`,
);

// ------------------------------------------------------------
// 3. README.md
// ------------------------------------------------------------
writeFile(
  "README.md",
  `# Pre-entrega 3 — Autenticación con JWT y cookies

## Rutas

| Método | Ruta                       | Descripción                                    | Ejemplo Request / Response |
|--------|----------------------------|------------------------------------------------|----------------------------|
| POST   | \`/api/sessions/register\`   | Registrar un nuevo usuario                     | **Request:** \`{ "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "password": "Secreta123" }\` <br> **Response 201:** \`{ "status": "success", "payload": { "_id": "...", "first_name": "Ana", ... } }\` |
| POST   | \`/api/sessions/login\`      | Iniciar sesión y obtener cookie \`currentUser\`  | **Request:** \`{ "email": "ana@mail.com", "password": "Secreta123" }\` <br> **Response 200:** \`{ "status": "success", "message": "Login correcto" }\` <br> **Response 401:** \`{ "status": "error", "message": "Credenciales inválidas" }\` |
| GET    | \`/api/sessions/current\`    | Obtener usuario autenticado (requiere cookie)  | **Response 200:** \`{ "status": "success", "payload": { "id": "665f2a...", "email": "ana@mail.com", "role": "user" } }\` <br> **Response 401:** \`{ "status": "error", "message": "No autenticado" }\` |
| POST   | \`/api/sessions/logout\`     | Cerrar sesión (elimina cookie)                | **Response 200:** \`{ "status": "success", "message": "Sesión cerrada" }\` |

## Variables de entorno

Crear un archivo \`.env\` basado en \`.env.example\` con los siguientes valores:

- \`PORT\` (ej: 3000)
- \`MONGO_URL\` (cadena de conexión a MongoDB Atlas)
- \`JWT_SECRET\` (clave secreta para firmar JWT)
- \`JWT_EXPIRES_IN\` (ej: \`1h\`, \`7d\`)
- \`NODE_ENV\` (\`development\` o \`production\`)

## Instalación y ejecución

\`\`\`bash
cd Pre_entrega_3
npm install
npm run dev   # o npm start
\`\`\`

## Pruebas recomendadas

1. Registrar usuario → login → GET /current → logout → GET /current (debe dar 401)
2. Login con email inexistente
3. Login con contraseña incorrecta
4. GET /current sin cookie
5. GET /current con token manipulado o expirado

## Capturas de ejemplo

*(Incluye aquí tus capturas de Postman/Thunder Client)*
`,
);

// ------------------------------------------------------------
// 4. src/config/db.js
// ------------------------------------------------------------
writeFile(
  "src/config/db.js",
  `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
`,
);

// ------------------------------------------------------------
// 5. src/models/User.js
// ------------------------------------------------------------
writeFile(
  "src/models/User.js",
  `const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }
}, { timestamps: true });

// No devolver password en consultas
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
`,
);

// ------------------------------------------------------------
// 6. src/utils/hash.js
// ------------------------------------------------------------
writeFile(
  "src/utils/hash.js",
  `const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };
`,
);

// ------------------------------------------------------------
// 7. src/utils/jwt.js
// ------------------------------------------------------------
writeFile(
  "src/utils/jwt.js",
  `const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
`,
);

// ------------------------------------------------------------
// 8. src/middlewares/auth.middleware.js
// ------------------------------------------------------------
writeFile(
  "src/middlewares/auth.middleware.js",
  `const { verifyToken } = require('../utils/jwt');

const auth = (req, res, next) => {
  const token = req.cookies.currentUser;
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No autenticado' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;  // { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'No autenticado' });
  }
};

module.exports = auth;
`,
);

// ------------------------------------------------------------
// 9. src/controllers/sessions.controller.js
// ------------------------------------------------------------
writeFile(
  "src/controllers/sessions.controller.js",
  `const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

// ----- REGISTRO -----
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    // Validar campos obligatorios
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
    }

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar duplicado
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'El email ya está registrado' });
    }

    // Hashear password
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const newUser = await User.create({
      first_name,
      last_name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'user'
    });

    // Respuesta sin password
    res.status(201).json({ status: 'success', payload: newUser });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ----- LOGIN -----
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Faltan credenciales' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Comparar contraseña (si no existe usuario, también falla)
    let isValid = false;
    if (user) {
      isValid = await comparePassword(password, user.password);
    }

    if (!user || !isValid) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
    }

    // Generar JWT
    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const token = generateToken(tokenPayload);

    // Configurar cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('currentUser', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 3600000, // 1 hora
      secure: isProduction
    });

    res.status(200).json({ status: 'success', message: 'Login correcto' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ----- CURRENT (protegida) -----
const current = async (req, res) => {
  // req.user ya fue asignado por auth middleware
  res.status(200).json({ status: 'success', payload: req.user });
};

// ----- LOGOUT -----
const logout = (req, res) => {
  res.clearCookie('currentUser');
  res.status(200).json({ status: 'success', message: 'Sesión cerrada' });
};

module.exports = { register, login, current, logout };
`,
);

// ------------------------------------------------------------
// 10. src/routes/sessions.router.js
// ------------------------------------------------------------
writeFile(
  "src/routes/sessions.router.js",
  `const express = require('express');
const router = express.Router();
const { register, login, current, logout } = require('../controllers/sessions.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/current', auth, current);
router.post('/logout', logout);

module.exports = router;
`,
);

// ------------------------------------------------------------
// 11. src/app.js
// ------------------------------------------------------------
writeFile(
  "src/app.js",
  `require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const sessionsRouter = require('./routes/sessions.router');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rutas
app.use('/api/sessions', sessionsRouter);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Pre-entrega 3 funcionando');
});

app.listen(PORT, () => {
  console.log(\`🚀 Servidor corriendo en http://localhost:\${PORT}\`);
});
`,
);

console.log(
  "\n✅ ¡Estructura y archivos de Pre_entrega_3 generados con éxito!",
);
console.log("📌 Ahora ejecuta:");
console.log("  cd Pre_entrega_3");
console.log("  npm install");
console.log("  npm run dev");
console.log("🔑 No olvides configurar tu archivo .env basado en .env.example");
