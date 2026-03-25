import express from 'express';
import { submitMessage, getMessages, markAsRead, deleteMessage } from '../controllers/contactController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', submitMessage);
router.get('/', protect, admin, getMessages);
router.put('/:id/read', protect, admin, markAsRead);
router.delete('/:id', protect, admin, deleteMessage);

export default router;
