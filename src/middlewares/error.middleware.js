const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);

  // Errores de validación de Mongoose
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Error de validación",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Errores de duplicación
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      status: "error",
      message: `Ya existe un registro con ese ${field}`,
      field,
    });
  }

  // Errores personalizados
  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";

  res.status(status).json({
    status: "error",
    message,
  });
};

module.exports = { errorHandler };
