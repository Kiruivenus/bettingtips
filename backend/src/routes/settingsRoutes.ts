import express from 'express';
import { getPaymentSettings, updatePaymentSettings } from '../controllers/settingsController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/payments', protect, admin, getPaymentSettings);
router.put('/payments/:method', protect, admin, updatePaymentSettings);

export default router;
