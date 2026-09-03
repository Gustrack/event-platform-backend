const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, "../.env") });

// Importar modelos
const User = require("../src/models/User");
const MaintenanceRequest = require("../src/models/MaintenanceRequest.model");
const ServiceAssignment = require("../src/models/ServiceAssignment.model");

// Datos de prueba
const seedData = {
  users: [
    {
      first_name: "Diego",
      last_name: "Ropolo",
      email: "diego.ropolo@sitmobili.com",
      password: "Diego123!",
      role: "client",
      company: "Sit Mobili",
    },
    {
      first_name: "Jose",
      last_name: "Almiron",
      email: "jose.almiron@constructora.com",
      password: "Jose123!",
      role: "client",
      company: "Constructora del Valle",
    },
    {
      first_name: "Gabriel",
      last_name: "Boeris",
      email: "gabriel.boeris@tbh.com",
      password: "Gabriel123!",
      role: "client",
      company: "TBH",
    },
    {
      first_name: "Pablo",
      last_name: "Boano",
      email: "pablo.boano@tecnico.com",
      password: "Pablo123!",
      role: "technician",
      specialty: "Mecánico",
    },
    {
      first_name: "Martin",
      last_name: "Sosa",
      email: "martin.sosa@tecnico.com",
      password: "Martin123!",
      role: "technician",
      specialty: "Domótica",
    },
    {
      first_name: "Admin",
      last_name: "Innser",
      email: "admin@innser.com",
      password: "Admin123!",
      role: "admin",
    },
  ],
};

async function seed() {
  try {
    console.log("🔌 Conectando a MongoDB...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Conectado a MongoDB");

    console.log("🗑️  Limpiando colecciones...");
    await User.deleteMany({});
    await MaintenanceRequest.deleteMany({});
    await ServiceAssignment.deleteMany({});
    console.log("✅ Colecciones limpiadas");

    console.log("👤 Creando usuarios...");
    const users = await Promise.all(
      seedData.users.map(async (userData) => {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          ...userData,
          password: hashedPassword,
        });
        return await user.save();
      }),
    );
    console.log(`✅ ${users.length} usuarios creados`);

    console.log("\n🔑 Credenciales de prueba:");
    console.log("\n--- Clientes ---");
    users
      .filter((u) => u.role === "client")
      .forEach((c) => {
        console.log(`  📧 ${c.email} | 🔑 ${c.first_name}123!`);
      });
    console.log("\n--- Técnicos ---");
    users
      .filter((u) => u.role === "technician")
      .forEach((t) => {
        console.log(`  📧 ${t.email} | 🔑 ${t.first_name}123!`);
      });
    console.log("\n--- Admin ---");
    console.log("  📧 admin@innser.com | 🔑 Admin123!");

    console.log("\n✅ Seed completado exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    console.error("Detalle:", error.message);
    process.exit(1);
  }
}

seed();
