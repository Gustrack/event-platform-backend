const Joi = require("joi");

const createRequestValidation = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10),
  serviceType: Joi.string()
    .valid(
      "mecánico",
      "eléctrico",
      "hidráulico",
      "domótica",
      "industrial",
      "otros",
    )
    .required(),
  priority: Joi.string()
    .valid("baja", "media", "alta", "urgente")
    .default("media"),
  equipment: Joi.string().required(),
  company: Joi.string().required(),
  location: Joi.string().required(),
  dateRequired: Joi.date().min("now").required(),
  estimatedHours: Joi.number().min(0.5).max(72).required(),
});

const updateRequestValidation = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().min(10),
  serviceType: Joi.string().valid(
    "mecánico",
    "eléctrico",
    "hidráulico",
    "domótica",
    "industrial",
    "otros",
  ),
  priority: Joi.string().valid("baja", "media", "alta", "urgente"),
  equipment: Joi.string(),
  company: Joi.string(),
  location: Joi.string(),
  dateRequired: Joi.date().min("now"),
  estimatedHours: Joi.number().min(0.5).max(72),
  notes: Joi.string(),
});

const registerValidation = Joi.object({
  first_name: Joi.string().required().min(2).max(50),
  last_name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  role: Joi.string().valid("client", "technician"),
  company: Joi.string().when("role", {
    is: "client",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  specialty: Joi.string().when("role", {
    is: "technician",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const assignTechnicianValidation = Joi.object({
  technicianId: Joi.string().required(),
  startDate: Joi.date().required(),
});

const updateStatusValidation = Joi.object({
  status: Joi.string()
    .valid("pending", "in_progress", "completed", "cancelled")
    .required(),
  notes: Joi.string().optional().allow("", null), //  Agregar notes como opcional
});

module.exports = {
  createRequestValidation,
  updateRequestValidation,
  registerValidation,
  loginValidation,
  assignTechnicianValidation,
  updateStatusValidation,
};
