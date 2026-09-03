const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Conectado a MongoDB");
    console.log(`📊 Base de datos: ${mongoose.connection.db.databaseName}`);

    // Manejar eventos de conexión
    mongoose.connection.on("error", (err) => {
      console.error("❌ Error en conexión MongoDB:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB desconectado, intentando reconectar...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconectado");
    });
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
