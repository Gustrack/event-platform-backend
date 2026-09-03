const AssignmentService = require("../services/assignment.service");
const AssignmentDTO = require("../dto/ServiceAssignment.dto");

class AssignmentController {
  async getMyAssignments(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await AssignmentService.getMyAssignments(
        req.user.id,
        parseInt(page) || 1,
        parseInt(limit) || 10,
      );
      res.json({
        status: "success",
        data: result.data.map(AssignmentDTO.format),
        page: result.page || 1,
        limit: result.limit || 10,
        total: result.total,
        totalPages: Math.ceil(result.total / (result.limit || 10)),
      });
    } catch (error) {
      next(error);
    }
  }

  async getByRequest(req, res, next) {
    try {
      const assignments = await AssignmentService.getAssignmentsByRequest(
        req.params.requestId,
      );
      res.json({
        status: "success",
        data: assignments.map(AssignmentDTO.format),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          status: "error",
          message: "Estado es requerido",
        });
      }

      const assignment = await AssignmentService.updateAssignmentStatus(
        req.params.id,
        status,
        notes,
        req.user.id,
      );
      res.json({
        status: "success",
        payload: AssignmentDTO.format(assignment),
      });
    } catch (error) {
      next(error);
    }
  }

  async getTechnicianAvailability(req, res, next) {
    try {
      const { technicianId, date } = req.query;

      if (!technicianId || !date) {
        return res.status(400).json({
          status: "error",
          message: "Técnico y fecha son requeridos",
        });
      }

      const availability = await AssignmentService.getTechnicianAvailability(
        technicianId,
        date,
      );
      res.json({
        status: "success",
        payload: availability,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssignmentController();
