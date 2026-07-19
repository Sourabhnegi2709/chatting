import { Router } from 'express';
import { getCallHistory } from '../controllers/meeting.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/history', requireAuth, getCallHistory);

export default router;
