import express from 'express';
import { getFAQs, getAllFAQs, createFAQ, updateFAQ, deleteFAQ } from '../controllers/faqController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getFAQs);
router.get('/all', protect, admin, getAllFAQs);
router.post('/', protect, admin, createFAQ);
router.put('/:id', protect, admin, updateFAQ);
router.delete('/:id', protect, admin, deleteFAQ);

export default router;
