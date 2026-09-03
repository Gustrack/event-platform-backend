class ServiceAssignmentDTO {
  static format(assignment) {
    return {
      id: assignment._id,
      request: assignment.request
        ? {
            id: assignment.request._id,
            title: assignment.request.title,
            status: assignment.request.status,
          }
        : null,
      technician: assignment.technician
        ? {
            id: assignment.technician._id,
            name: `${assignment.technician.first_name} ${assignment.technician.last_name}`,
            email: assignment.technician.email,
            specialty: assignment.technician.specialty,
          }
        : null,
      startDate: assignment.startDate,
      estimatedEndDate: assignment.estimatedEndDate,
      actualEndDate: assignment.actualEndDate || null,
      status: assignment.status,
      assignmentCode: assignment.assignmentCode,
      notes: assignment.notes || null,
      hoursWorked: assignment.hoursWorked || 0,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    };
  }

  static formatList(assignments) {
    return assignments.map((assignment) => this.format(assignment));
  }
}

module.exports = ServiceAssignmentDTO;
