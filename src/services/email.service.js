const nodemailer = require("nodemailer");
const UserRepository = require("../repositories/User.repository");

class EmailService {
  constructor() {
    // Verificar que las variables existen
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.warn("⚠️ Credenciales de email no configuradas");
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.MAIL_PORT) || 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail(to, subject, html) {
    try {
      // Verificar que el destinatario existe
      if (!to) {
        throw new Error("Destinatario no especificado");
      }

      const info = await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to,
        subject,
        html,
      });
      console.log(`📧 Email enviado a ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error("❌ Error al enviar email:", error.message);
      throw new Error(`Error al enviar el email: ${error.message}`);
    }
  }

  async sendAssignmentConfirmation(
    technicianEmail,
    request,
    assignment,
    technician,
  ) {
    const subject = `🛠️ Nueva Asignación de Servicio - ${request.requestCode || "REQ"}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .card { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          .label { font-weight: bold; width: 40%; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛠️ Innser Management System</h1>
          <h2>Nueva Asignación de Servicio</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${technician.first_name} ${technician.last_name}</strong>,</p>
          <p>Se te ha asignado una nueva solicitud de mantenimiento.</p>
          
          <div class="card">
            <h3>📋 Detalles de la Solicitud</h3>
            <table>
              <tr><td class="label">Código:</td><td>${request.requestCode || "N/A"}</td></tr>
              <tr><td class="label">Título:</td><td>${request.title}</td></tr>
              <tr><td class="label">Descripción:</td><td>${request.description}</td></tr>
              <tr><td class="label">Tipo de Servicio:</td><td>${request.serviceType}</td></tr>
              <tr><td class="label">Prioridad:</td><td>${request.priority}</td></tr>
              <tr><td class="label">Equipo:</td><td>${request.equipment}</td></tr>
              <tr><td class="label">Empresa:</td><td>${request.company}</td></tr>
              <tr><td class="label">Ubicación:</td><td>${request.location}</td></tr>
              <tr><td class="label">Fecha Requerida:</td><td>${new Date(request.dateRequired).toLocaleDateString("es-AR")}</td></tr>
              <tr><td class="label">Horas Estimadas:</td><td>${request.estimatedHours}h</td></tr>
            </table>
          </div>

          <div class="card">
            <h3>📅 Detalles de la Asignación</h3>
            <table>
              <tr><td class="label">Código de Asignación:</td><td>${assignment.assignmentCode}</td></tr>
              <tr><td class="label">Fecha de Inicio:</td><td>${new Date(assignment.startDate).toLocaleString("es-AR")}</td></tr>
              <tr><td class="label">Finalización Estimada:</td><td>${new Date(assignment.estimatedEndDate).toLocaleString("es-AR")}</td></tr>
            </table>
          </div>

          <p><strong>📌 Próximos pasos:</strong></p>
          <ol>
            <li>Confirma tu disponibilidad</li>
            <li>Contacta al cliente para coordinar</li>
            <li>Actualiza el estado en la plataforma</li>
          </ol>
          <p>Puedes ver el detalle completo en la plataforma.</p>
        </div>
        <div class="footer">
          <p>Este es un mensaje automático de <strong>Innser Management System</strong></p>
          <p>Por favor, no respondas a este correo.</p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(technicianEmail, subject, html);
  }

  async sendStatusUpdateEmail(clientEmail, request, newStatus) {
    const statusMap = {
      pending: "⏳ Pendiente",
      in_progress: "🔄 En Progreso",
      completed: "✅ Completado",
      cancelled: "❌ Cancelado",
    };

    const subject = `📊 Actualización de Estado - Solicitud ${request.requestCode || "REQ"}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .card { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .status-badge { 
            background: #27ae60; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 20px;
            display: inline-block;
          }
          .footer { background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛠️ Innser Management System</h1>
          <h2>Actualización de Solicitud</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${request.client?.first_name || "Cliente"}</strong>,</p>
          <p>Tu solicitud de mantenimiento ha sido actualizada.</p>
          
          <div class="card">
            <h3>📋 Detalles de la Solicitud</h3>
            <table>
              <tr><td class="label">Código:</td><td>${request.requestCode || "N/A"}</td></tr>
              <tr><td class="label">Título:</td><td>${request.title}</td></tr>
              <tr><td class="label">Nuevo Estado:</td><td><span class="status-badge">${statusMap[newStatus] || newStatus}</span></td></tr>
            </table>
          </div>

          <p>Puedes ver el estado completo de tu solicitud en la plataforma.</p>
        </div>
        <div class="footer">
          <p>Este es un mensaje automático de <strong>Innser Management System</strong></p>
          <p>Por favor, no respondas a este correo.</p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(clientEmail, subject, html);
  }

  // 🆕 MÉTODO PARA PROBAR LA CONFIGURACIÓN DE EMAIL
  async testEmailConfiguration() {
    try {
      // Verificar la conexión con el servidor SMTP
      await this.transporter.verify();
      console.log("✅ Configuración de email verificada correctamente");
      return true;
    } catch (error) {
      console.error("❌ Error en configuración de email:", error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
