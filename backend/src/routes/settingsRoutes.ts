import express from 'express';
import { getPaymentSettings, updatePaymentSettings, getEnabledPaymentMethods, getPlatformSettings, updatePlatformSettings } from '../controllers/settingsController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

// Platform Settings (Support Links)
router.get('/platform', getPlatformSettings);
router.put('/platform', protect, admin, updatePlatformSettings);

// Public: returns only which methods are enabled (no secrets)
router.get('/payments/enabled', getEnabledPaymentMethods);

// Admin: full settings with masked keys
router.get('/payments', protect, admin, getPaymentSettings);
router.put('/payments/:method', protect, admin, updatePaymentSettings);

export default router;
