class MaintenanceRequestDTO {
  static format(request) {
    // Verificar que request existe
    if (!request) return null;

    // Asegurar que el estado se toma del objeto actualizado
    const status = request.status || "pending";

    return {
      id: request._id || request.id,
      title: request.title || "",
      description: request.description || "",
      serviceType: request.serviceType || "",
      priority: request.priority || "media",
      equipment: request.equipment || "",
      company: request.company || "",
      location: request.location || "",
      dateRequired: request.dateRequired || null,
      estimatedHours: request.estimatedHours || 0,
      status: status, // ✅ Asegurar que toma el estado actual
      client: request.client
        ? {
            id: request.client._id || request.client.id,
            name: `${request.client.first_name || ""} ${request.client.last_name || ""}`.trim(),
            email: request.client.email || "",
            company: request.client.company || "",
          }
        : null,
      assignedTechnician: request.assignedTechnician
        ? {
            id: request.assignedTechnician._id || request.assignedTechnician.id,
            name: `${request.assignedTechnician.first_name || ""} ${request.assignedTechnician.last_name || ""}`.trim(),
            email: request.assignedTechnician.email || "",
            specialty: request.assignedTechnician.specialty || "",
          }
        : null,
      notes: request.notes || null,
      requestCode: request.requestCode || null,
      createdAt: request.createdAt || null,
      updatedAt: request.updatedAt || null,
    };
  }

  static formatList(requests) {
    if (!Array.isArray(requests)) return [];
    return requests.map((request) => this.format(request));
  }
}

module.exports = MaintenanceRequestDTO;
