import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import eventsRouter from "./routes/events.router.js";
import sessionsRouter from "./routes/sessions.router.js";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Rutas
app.use("/api/events", eventsRouter);
app.use("/api/sessions", sessionsRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Servidor activo",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Root
app.get("/", (req, res) => {
  res.json({
    name: "Event Platform API",
    version: "1.0.0",
    status: "active",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Error interno del servidor",
  });
});

export default app;
