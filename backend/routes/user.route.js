import { Router } from 'express';
import { getUsers, login, logout, me, register, updateProfile } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

// Public
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);

// Logout just clears the cookie — intentionally NOT behind requireAuth, so an
// already-expired/invalid session can still log itself out cleanly (a 401 here
// would strand the user on the client with a cookie they can't clear).
router.post('/logout', logout);

// Private
router.get('/', requireAuth, getUsers);
router.get('/me', requireAuth, me);
router.put('/profile', requireAuth, updateProfile);

export default router;
