const express = require('express');
const router = express.Router();
const { register, login, current, logout } = require('../controllers/sessions.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/current', auth, current);
router.post('/logout', logout);

module.exports = router;
