const AssignmentDAO = require("../dao/ServiceAssignment.dao");

class ServiceAssignmentRepository {
  async create(data) {
    return await AssignmentDAO.create(data);
  }

  async findById(id) {
    return await AssignmentDAO.findById(id);
  }

  async findAll(filters = {}, page = 1, limit = 10) {
    return await AssignmentDAO.findAll(filters, page, limit);
  }

  async update(id, data) {
    return await AssignmentDAO.update(id, data);
  }

  async delete(id) {
    return await AssignmentDAO.delete(id);
  }

  async findByTechnician(technicianId, page = 1, limit = 10) {
    return await AssignmentDAO.findByTechnician(technicianId, page, limit);
  }

  async findByRequest(requestId) {
    return await AssignmentDAO.findByRequest(requestId);
  }

  async countActiveByTechnician(technicianId) {
    return await AssignmentDAO.countActiveByTechnician(technicianId);
  }

  async findActiveByRequest(requestId) {
    return await AssignmentDAO.findAll({
      request: requestId,
      status: { $in: ["assigned", "in_progress"] },
    });
  }
}

module.exports = new ServiceAssignmentRepository();
