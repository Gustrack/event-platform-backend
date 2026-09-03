const dotenv = require("dotenv");
const path = require("path");

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, "../.env") });

const EmailService = require("../src/services/email.service");

async function testEmail() {
  console.log("📧 Probando configuración de email...");
  console.log("----------------------------------------");

  // Verificar variables de entorno
  console.log("📋 Variables de entorno:");
  console.log(`  MAIL_HOST: ${process.env.MAIL_HOST || "❌ No configurado"}`);
  console.log(`  MAIL_PORT: ${process.env.MAIL_PORT || "❌ No configurado"}`);
  console.log(`  MAIL_USER: ${process.env.MAIL_USER || "❌ No configurado"}`);
  console.log(`  MAIL_FROM: ${process.env.MAIL_FROM || "❌ No configurado"}`);
  console.log(
    `  MAIL_PASS: ${process.env.MAIL_PASS ? "✅ Configurado" : "❌ No configurado"}`,
  );

  console.log("\n🔍 Verificando conexión SMTP...");

  const isConfigured = await EmailService.testEmailConfiguration();

  if (!isConfigured) {
    console.log("\n❌ La configuración de email no es válida.");
    console.log("Verifica:");
    console.log(
      "  1. Que MAIL_PASS sea la contraseña de aplicación (16 dígitos)",
    );
    console.log("  2. Que la verificación en 2 pasos esté activada en Gmail");
    console.log("  3. Que la cuenta de Gmail existe");
    return;
  }

  console.log("\n📧 Enviando email de prueba...");

  try {
    const testEmail = process.env.MAIL_USER || "test@example.com";
    const result = await EmailService.sendEmail(
      testEmail,
      "🧪 Innser - Prueba de Configuración",
      `
      <h1>🧪 Prueba de Email</h1>
      <p>Este es un email de prueba para verificar que la configuración de Nodemailer funciona correctamente.</p>
      <p><strong>Servidor:</strong> ${process.env.MAIL_HOST}</p>
      <p><strong>Usuario:</strong> ${process.env.MAIL_USER}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p><small>Innser Management System - Prueba automática</small></p>
      `,
    );
    console.log(`✅ Email de prueba enviado a: ${testEmail}`);
    console.log(`📨 ID del mensaje: ${result.messageId}`);
  } catch (error) {
    console.error("❌ Error al enviar email de prueba:", error.message);
  }
}

testEmail()
  .then(() => {
    console.log("\n✅ Prueba completada");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error en la prueba:", error);
    process.exit(1);
  });
