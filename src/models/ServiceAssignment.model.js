const mongoose = require("mongoose");

const serviceAssignmentSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MaintenanceRequest",
    required: true,
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: { type: Date, required: true },
  estimatedEndDate: { type: Date, required: true },
  actualEndDate: { type: Date },
  status: {
    type: String,
    enum: ["assigned", "in_progress", "completed", "cancelled"],
    default: "assigned",
  },
  assignmentCode: { type: String, unique: true, required: true },
  notes: { type: String, trim: true },
  hoursWorked: { type: Number, min: 0, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Índices para búsquedas rápidas
serviceAssignmentSchema.index({ technician: 1, status: 1 });
serviceAssignmentSchema.index({ request: 1 });

module.exports = mongoose.model("ServiceAssignment", serviceAssignmentSchema);
