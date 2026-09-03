const ServiceAssignment = require("../models/ServiceAssignment.model");

class ServiceAssignmentDAO {
  async create(data) {
    return await ServiceAssignment.create(data);
  }

  async findById(id) {
    return await ServiceAssignment.findById(id)
      .populate("request")
      .populate("technician", "first_name last_name email specialty");
  }

  async findAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      ServiceAssignment.find(filters)
        .populate("request")
        .populate("technician", "first_name last_name email specialty")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      ServiceAssignment.countDocuments(filters),
    ]);
    return { data, total };
  }

  async update(id, data) {
    return await ServiceAssignment.findByIdAndUpdate(id, data, { new: true })
      .populate("request")
      .populate("technician", "first_name last_name email specialty");
  }

  async delete(id) {
    return await ServiceAssignment.findByIdAndDelete(id);
  }

  async findByTechnician(technicianId, page = 1, limit = 10) {
    return await this.findAll({ technician: technicianId }, page, limit);
  }

  async findByRequest(requestId) {
    return await ServiceAssignment.find({ request: requestId }).populate(
      "technician",
      "first_name last_name email specialty",
    );
  }

  async countActiveByTechnician(technicianId) {
    return await ServiceAssignment.countDocuments({
      technician: technicianId,
      status: { $in: ["assigned", "in_progress"] },
    });
  }
}

module.exports = new ServiceAssignmentDAO();
