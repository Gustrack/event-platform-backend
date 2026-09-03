const router = require("express").Router();
const AssignmentController = require("../controllers/assignment.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validation.middleware");
const { updateStatusValidation } = require("../validations/request.validation");

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Mis asignaciones (técnico)
router.get(
  "/my",
  roleMiddleware(["technician"]),
  AssignmentController.getMyAssignments,
);

// Asignaciones por solicitud
router.get("/request/:requestId", AssignmentController.getByRequest);

// Actualizar estado de asignación
router.patch(
  "/:id/status",
  validate(updateStatusValidation),
  AssignmentController.updateStatus,
);

// Ver disponibilidad de técnico
router.get(
  "/technician-availability",
  roleMiddleware(["admin"]),
  AssignmentController.getTechnicianAvailability,
);

module.exports = router;
