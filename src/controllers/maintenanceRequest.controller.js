const RequestService = require("../services/maintenanceRequest.service");
const RequestDTO = require("../dto/MaintenanceRequest.dto");

class MaintenanceRequestController {
  async create(req, res, next) {
    try {
      const request = await RequestService.createRequest(req.body, req.user.id);
      res.status(201).json({
        status: "success",
        payload: RequestDTO.format(request),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page, limit, status, priority, serviceType, company } = req.query;
      const result = await RequestService.getRequests(
        {
          status,
          priority,
          serviceType,
          company,
        },
        { page: parseInt(page) || 1, limit: parseInt(limit) || 10 },
      );

      res.json({
        status: "success",
        data: result.data.map(RequestDTO.format),
        page: result.page || 1,
        limit: result.limit || 10,
        total: result.total,
        totalPages: Math.ceil(result.total / (result.limit || 10)),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const request = await RequestService.getRequestById(req.params.id);
      res.json({
        status: "success",
        payload: RequestDTO.format(request),
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyRequests(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await RequestService.getRequestsByClient(
        req.user.id,
        parseInt(page) || 1,
        parseInt(limit) || 10,
      );
      res.json({
        status: "success",
        data: result.data.map(RequestDTO.format),
        page: result.page || 1,
        limit: result.limit || 10,
        total: result.total,
        totalPages: Math.ceil(result.total / (result.limit || 10)),
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const request = await RequestService.updateRequest(
        req.params.id,
        req.body,
        req.user.id,
      );
      res.json({
        status: "success",
        payload: RequestDTO.format(request),
      });
    } catch (error) {
      next(error);
    }
  }

  async assignTechnician(req, res, next) {
    try {
      const { technicianId, startDate } = req.body;

      if (!technicianId || !startDate) {
        return res.status(400).json({
          status: "error",
          message: "Técnico y fecha de inicio son requeridos",
        });
      }

      const assignment = await RequestService.assignTechnician(
        req.params.id,
        technicianId,
        startDate,
        req.user.id,
      );
      res.status(201).json({
        status: "success",
        payload: assignment,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          status: "error",
          message: "Estado es requerido",
        });
      }

      const request = await RequestService.updateStatus(
        req.params.id,
        status,
        req.user.id,
      );
      res.json({
        status: "success",
        payload: RequestDTO.format(request),
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const request = await RequestService.cancelRequest(
        req.params.id,
        req.user.id,
      );
      res.json({
        status: "success",
        payload: RequestDTO.format(request),
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const stats = await RequestService.getStatistics();
      res.json({
        status: "success",
        payload: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MaintenanceRequestController();
