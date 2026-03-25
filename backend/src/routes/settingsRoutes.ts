import express from 'express';
import { getPaymentSettings, updatePaymentSettings, getEnabledPaymentMethods } from '../controllers/settingsController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

// Public: returns only which methods are enabled (no secrets)
router.get('/payments/enabled', getEnabledPaymentMethods);

// Admin: full settings with masked keys
router.get('/payments', protect, admin, getPaymentSettings);
router.put('/payments/:method', protect, admin, updatePaymentSettings);

export default router;
