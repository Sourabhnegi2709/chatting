import { Router } from 'express';
import { getUsers, login, logout, me, register, updateProfile } from '../controllers/user.controller.js';

const router = Router();

router.get('/', getUsers);
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', me);
router.put('/profile', updateProfile);

export default router;

