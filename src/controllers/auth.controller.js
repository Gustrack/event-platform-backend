const AuthService = require("../services/auth.service");
const UserDTO = require("../dto/User.dto");

class AuthController {
  async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({
        status: "success",
        payload: UserDTO.format(user),
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Email y contraseña son requeridos",
        });
      }

      const { token, user } = await AuthService.login(email, password);

      // Establecer cookie
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        sameSite: "lax",
      });

      res.json({
        status: "success",
        message: "Login exitoso",
        user: UserDTO.format(user),
      });
    } catch (error) {
      next(error);
    }
  }

  async current(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);
      res.json({
        status: "success",
        payload: UserDTO.format(user),
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie("token");
      res.json({
        status: "success",
        message: "Sesión cerrada exitosamente",
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          status: "error",
          message: "Contraseña actual y nueva son requeridas",
        });
      }

      await AuthService.changePassword(req.user.id, oldPassword, newPassword);

      res.json({
        status: "success",
        message: "Contraseña actualizada exitosamente",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
