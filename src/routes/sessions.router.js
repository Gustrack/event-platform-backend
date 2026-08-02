import { Router } from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/sessions.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/current', getCurrentUser);

export default router;
