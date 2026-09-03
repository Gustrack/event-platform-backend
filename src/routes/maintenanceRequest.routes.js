const router = require("express").Router();
const RequestController = require("../controllers/maintenanceRequest.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validation.middleware");
const {
  createRequestValidation,
  updateRequestValidation,
  assignTechnicianValidation,
  updateStatusValidation,
} = require("../validations/request.validation");

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas generales
router.get("/", RequestController.getAll);
router.get("/my", RequestController.getMyRequests);
router.get(
  "/statistics",
  roleMiddleware(["admin"]),
  RequestController.getStatistics,
);

// Rutas específicas
router.post(
  "/",
  roleMiddleware(["client"]),
  validate(createRequestValidation),
  RequestController.create,
);
router.get("/:id", RequestController.getById);
router.put(
  "/:id",
  roleMiddleware(["client", "admin"]),
  validate(updateRequestValidation),
  RequestController.update,
);

// Asignación de técnico (solo admin)
router.post(
  "/:id/assign",
  roleMiddleware(["admin"]),
  validate(assignTechnicianValidation),
  RequestController.assignTechnician,
);

// Cambio de estado
router.patch(
  "/:id/status",
  validate(updateStatusValidation),
  RequestController.updateStatus,
);

// Cancelación
router.patch("/:id/cancel", RequestController.cancel);

module.exports = router;
