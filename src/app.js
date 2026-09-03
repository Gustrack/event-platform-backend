const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const dotenv = require("dotenv");

// Cargar variables de entorno
dotenv.config();

// Importar configuración de base de datos
const connectDB = require("./config/db");

// Importar rutas
const authRoutes = require("./routes/auth.routes");
const requestRoutes = require("./routes/maintenanceRequest.routes");
const assignmentRoutes = require("./routes/assignment.routes");

// Importar middlewares
const { errorHandler } = require("./middlewares/error.middleware");

// Crear aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Conexión a MongoDB usando el archivo de configuración
connectDB();

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/assignments", assignmentRoutes);

// Ruta de salud
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    name: "Innser Management System API",
    version: "1.0.0",
    status: "running",
    documentation: "https://github.com/Gustrack/event-platform-backend",
  });
});

// Middleware de errores (debe ir al final)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación disponible en http://localhost:${PORT}/`);
});
