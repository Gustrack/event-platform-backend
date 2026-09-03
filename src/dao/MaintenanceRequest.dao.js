const MaintenanceRequest = require("../models/MaintenanceRequest.model");

class MaintenanceRequestDAO {
  async create(data) {
    return await MaintenanceRequest.create(data);
  }

  async findById(id) {
    return await MaintenanceRequest.findById(id)
      .populate("client", "first_name last_name email company")
      .populate("assignedTechnician", "first_name last_name email specialty");
  }

  async findAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      MaintenanceRequest.find(filters)
        .populate("client", "first_name last_name email company")
        .populate("assignedTechnician", "first_name last_name email specialty")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      MaintenanceRequest.countDocuments(filters),
    ]);
    return { data, total };
  }

  async update(id, data) {
    return await MaintenanceRequest.findByIdAndUpdate(id, data, { new: true }) // ✅ IMPORTANTE: Esto devuelve el documento actualizado
      .populate("client", "first_name last_name email company")
      .populate("assignedTechnician", "first_name last_name email specialty");
  }

  async delete(id) {
    return await MaintenanceRequest.findByIdAndDelete(id);
  }

  async findByClient(clientId, page = 1, limit = 10) {
    return await this.findAll({ client: clientId }, page, limit);
  }

  async findByTechnician(technicianId, page = 1, limit = 10) {
    return await this.findAll(
      { assignedTechnician: technicianId },
      page,
      limit,
    );
  }

  async countByStatus(status) {
    return await MaintenanceRequest.countDocuments({ status });
  }

  async isTechnicianAvailable(technicianId, dateRequired, estimatedHours) {
    const startDate = new Date(dateRequired);
    const endDate = new Date(startDate.getTime() + estimatedHours * 3600000);

    const existing = await MaintenanceRequest.countDocuments({
      assignedTechnician: technicianId,
      status: { $in: ["pending", "in_progress"] },
      dateRequired: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    return existing === 0;
  }
}

module.exports = new MaintenanceRequestDAO();
