const router = require("express").Router();
const AuthController = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validation.middleware");
const {
  registerValidation,
  loginValidation,
} = require("../validations/request.validation");

// Rutas públicas
router.post("/register", validate(registerValidation), AuthController.register);
router.post("/login", validate(loginValidation), AuthController.login);

// Rutas protegidas
router.get("/current", authMiddleware, AuthController.current);
router.post("/logout", authMiddleware, AuthController.logout);
router.post("/change-password", authMiddleware, AuthController.changePassword);

module.exports = router;
