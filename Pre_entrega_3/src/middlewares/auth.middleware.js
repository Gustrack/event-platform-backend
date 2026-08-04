const { verifyToken } = require('../utils/jwt');

const auth = (req, res, next) => {
  const token = req.cookies.currentUser;
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No autenticado' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;  // { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'No autenticado' });
  }
};

module.exports = auth;
