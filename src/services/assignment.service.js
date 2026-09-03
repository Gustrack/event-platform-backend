const AssignmentRepository = require("../repositories/ServiceAssignment.repository");
const RequestRepository = require("../repositories/MaintenanceRequest.repository");
const UserRepository = require("../repositories/User.repository");

class AssignmentService {
  async createAssignment(data) {
    return await AssignmentRepository.create(data);
  }

  async getAssignmentById(id) {
    const assignment = await AssignmentRepository.findById(id);
    if (!assignment) {
      throw new Error("Asignación no encontrada");
    }
    return assignment;
  }

  async getMyAssignments(technicianId, page, limit) {
    const technician = await UserRepository.findById(technicianId);
    if (!technician || technician.role !== "technician") {
      throw new Error("Usuario no autorizado");
    }
    return await AssignmentRepository.findByTechnician(
      technicianId,
      page,
      limit,
    );
  }

  async getAssignmentsByRequest(requestId) {
    return await AssignmentRepository.findByRequest(requestId);
  }

  async updateAssignmentStatus(assignmentId, status, notes, userId) {
    const assignment = await AssignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new Error("Asignación no encontrada");
    }

    // Verificar autorización
    const user = await UserRepository.findById(userId);
    const isAuthorized =
      user.role === "admin" || assignment.technician._id.toString() === userId;

    if (!isAuthorized) {
      throw new Error("No autorizado para actualizar esta asignación");
    }

    // Validar transición de estado
    const validTransitions = {
      assigned: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[assignment.status].includes(status)) {
      throw new Error(
        `Transición de estado inválida: ${assignment.status} -> ${status}`,
      );
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;
    if (status === "completed") {
      updateData.actualEndDate = new Date();
    }

    const updatedAssignment = await AssignmentRepository.update(
      assignmentId,
      updateData,
    );

    // Si se completa, actualizar la solicitud
    if (status === "completed") {
      await RequestRepository.update(assignment.request._id, {
        status: "completed",
      });
    }

    return updatedAssignment;
  }

  async getTechnicianAvailability(technicianId, date) {
    const technician = await UserRepository.findById(technicianId);
    if (!technician || technician.role !== "technician") {
      throw new Error("Técnico no encontrado");
    }

    const assignments = await AssignmentRepository.findAll({
      technician: technicianId,
      startDate: { $gte: new Date(date) },
      status: { $in: ["assigned", "in_progress"] },
    });

    return {
      technician: {
        id: technician._id,
        name: `${technician.first_name} ${technician.last_name}`,
        specialty: technician.specialty,
      },
      available: assignments.data.length === 0,
      activeAssignments: assignments.data.length,
    };
  }
}

module.exports = new AssignmentService();
