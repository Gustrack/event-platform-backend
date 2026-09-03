const RequestDAO = require("../dao/MaintenanceRequest.dao");

class MaintenanceRequestRepository {
  async create(data) {
    return await RequestDAO.create(data);
  }

  async findById(id) {
    return await RequestDAO.findById(id);
  }

  async findAll(filters = {}, page = 1, limit = 10) {
    return await RequestDAO.findAll(filters, page, limit);
  }

  async update(id, data) {
    return await RequestDAO.update(id, data);
  }

  async delete(id) {
    return await RequestDAO.delete(id);
  }

  async findByClient(clientId, page = 1, limit = 10) {
    return await RequestDAO.findByClient(clientId, page, limit);
  }

  async findByTechnician(technicianId, page = 1, limit = 10) {
    return await RequestDAO.findByTechnician(technicianId, page, limit);
  }

  async countByStatus(status) {
    return await RequestDAO.countByStatus(status);
  }

  async isTechnicianAvailable(technicianId, dateRequired, estimatedHours) {
    return await RequestDAO.isTechnicianAvailable(
      technicianId,
      dateRequired,
      estimatedHours,
    );
  }

  async findActiveByClientAndStatus(clientId, statuses) {
    return await RequestDAO.findAll({
      client: clientId,
      status: { $in: statuses },
    });
  }
}

module.exports = new MaintenanceRequestRepository();
