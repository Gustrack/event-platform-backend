const mongoose = require("mongoose");

const maintenanceRequestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  serviceType: {
    type: String,
    enum: [
      "mecánico",
      "eléctrico",
      "hidráulico",
      "domótica",
      "industrial",
      "otros",
    ],
    required: true,
  },
  priority: {
    type: String,
    enum: ["baja", "media", "alta", "urgente"],
    default: "media",
  },
  equipment: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  dateRequired: {
    type: Date,
    required: true,
    validate: {
      validator: function (v) {
        return v >= new Date();
      },
      message: "La fecha requerida no puede ser pasada",
    },
  },
  estimatedHours: {
    type: Number,
    required: true,
    min: 0.5,
    default: 4,
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "cancelled"],
    default: "pending",
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  notes: { type: String, trim: true },
  requestCode: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

maintenanceRequestSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
