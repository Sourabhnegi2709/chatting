import { Router } from 'express';
import { getConversation, markConversationRead } from '../controllers/message.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:contactId', requireAuth, getConversation);
router.patch('/:contactId/read', requireAuth, markConversationRead);

export default router;
