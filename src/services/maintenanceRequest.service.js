const RequestRepository = require("../repositories/MaintenanceRequest.repository");
const UserRepository = require("../repositories/User.repository");
const AssignmentService = require("./assignment.service");
const EmailService = require("./email.service");

class MaintenanceRequestService {
  async createRequest(data, clientId) {
    // Validar que el cliente existe
    const client = await UserRepository.findById(clientId);
    if (!client || client.role !== "client") {
      throw new Error("Usuario no autorizado para crear solicitudes");
    }

    // Validar fecha
    if (new Date(data.dateRequired) < new Date()) {
      throw new Error("La fecha requerida no puede ser pasada");
    }

    // Generar código único
    const requestCode = `REQ-${Date.now().toString(36).toUpperCase()}`;

    // Crear solicitud
    const request = await RequestRepository.create({
      ...data,
      client: clientId,
      requestCode,
      status: "pending",
    });

    return request;
  }

  async getRequests(filters, pagination) {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      serviceType,
      company,
    } = filters;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (serviceType) query.serviceType = serviceType;
    if (company) query.company = { $regex: company, $options: "i" };

    const result = await RequestRepository.findAll(
      query,
      parseInt(page),
      parseInt(limit),
    );
    return result;
  }

  async getRequestById(requestId) {
    const request = await RequestRepository.findById(requestId);
    if (!request) {
      throw new Error("Solicitud no encontrada");
    }
    return request;
  }

  async getRequestsByClient(clientId, page, limit) {
    const client = await UserRepository.findById(clientId);
    if (!client) {
      throw new Error("Cliente no encontrado");
    }
    return await RequestRepository.findByClient(clientId, page, limit);
  }

  async updateRequest(requestId, data, userId) {
    const request = await RequestRepository.findById(requestId);
    if (!request) {
      throw new Error("Solicitud no encontrada");
    }

    // Verificar autorización
    if (request.client._id.toString() !== userId) {
      throw new Error("No autorizado para modificar esta solicitud");
    }

    // No permitir modificar si está en progreso o completada
    if (["in_progress", "completed"].includes(request.status)) {
      throw new Error(
        "No se puede modificar una solicitud en progreso o completada",
      );
    }

    // Validar fecha si se actualiza
    if (data.dateRequired && new Date(data.dateRequired) < new Date()) {
      throw new Error("La fecha requerida no puede ser pasada");
    }

    const updatedRequest = await RequestRepository.update(requestId, data);
    return updatedRequest;
  }

  async assignTechnician(requestId, technicianId, startDate, userId) {
    // Verificar que el usuario es admin
    const user = await UserRepository.findById(userId);
    if (user.role !== "admin") {
      throw new Error("Solo un administrador puede asignar técnicos");
    }

    const request = await RequestRepository.findById(requestId);
    if (!request) {
      throw new Error("Solicitud no encontrada");
    }

    // Verificar que la solicitud está pendiente
    if (request.status !== "pending") {
      throw new Error("La solicitud debe estar en estado pendiente");
    }

    // Verificar que el técnico existe y tiene rol technician
    const technician = await UserRepository.findById(technicianId);
    if (!technician || technician.role !== "technician") {
      throw new Error("Técnico no encontrado o no válido");
    }

    // Verificar disponibilidad del técnico
    const isAvailable = await RequestRepository.isTechnicianAvailable(
      technicianId,
      startDate,
      request.estimatedHours,
    );

    if (!isAvailable) {
      throw new Error("El técnico no está disponible en esa fecha");
    }

    // Generar código de asignación
    const assignmentCode = `ASG-${Date.now().toString(36).toUpperCase()}`;

    // Crear asignación
    const assignment = await AssignmentService.createAssignment({
      request: requestId,
      technician: technicianId,
      startDate: startDate,
      estimatedEndDate: new Date(
        new Date(startDate).getTime() + request.estimatedHours * 3600000,
      ),
      assignmentCode,
    });

    // Actualizar solicitud
    const updatedRequest = await RequestRepository.update(requestId, {
      assignedTechnician: technicianId,
      status: "in_progress",
    });

    // 📧 Enviar email al técnico
    await EmailService.sendAssignmentConfirmation(
      technician.email,
      updatedRequest,
      assignment,
      technician,
    );

    // 📧 Enviar email al cliente
    await EmailService.sendStatusUpdateEmail(
      request.client.email,
      updatedRequest,
      "in_progress",
    );

    return assignment;
  }

  async updateStatus(requestId, status, userId) {
    const request = await RequestRepository.findById(requestId);
    if (!request) {
      throw new Error("Solicitud no encontrada");
    }

    // Verificar autorización
    const user = await UserRepository.findById(userId);
    const isAuthorized =
      user.role === "admin" ||
      request.client._id.toString() === userId ||
      (request.assignedTechnician &&
        request.assignedTechnician._id.toString() === userId);

    if (!isAuthorized) {
      throw new Error("No autorizado para cambiar el estado");
    }

    // Validar transición de estado
    const validTransitions = {
      pending: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[request.status].includes(status)) {
      throw new Error(
        `Transición de estado inválida: ${request.status} -> ${status}`,
      );
    }

    const updatedRequest = await RequestRepository.update(requestId, {
      status,
    });
    return updatedRequest;
  }

  async cancelRequest(requestId, userId) {
    const request = await RequestRepository.findById(requestId);
    if (!request) {
      throw new Error("Solicitud no encontrada");
    }

    // Verificar autorización
    const user = await UserRepository.findById(userId);
    const isAuthorized =
      user.role === "admin" || request.client._id.toString() === userId;

    if (!isAuthorized) {
      throw new Error("No autorizado para cancelar esta solicitud");
    }

    // Solo se puede cancelar si está pendiente o en progreso
    if (!["pending", "in_progress"].includes(request.status)) {
      throw new Error(
        "Solo se pueden cancelar solicitudes pendientes o en progreso",
      );
    }

    const updatedRequest = await RequestRepository.update(requestId, {
      status: "cancelled",
    });

    return updatedRequest;
  }

  async getStatistics() {
    const stats = {
      total: await RequestRepository.countByStatus(null),
      pending: await RequestRepository.countByStatus("pending"),
      in_progress: await RequestRepository.countByStatus("in_progress"),
      completed: await RequestRepository.countByStatus("completed"),
      cancelled: await RequestRepository.countByStatus("cancelled"),
    };
    return stats;
  }
}

module.exports = new MaintenanceRequestService();
