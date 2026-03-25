import express from 'express';
import { 
  createManualPayment, 
  approveManualPayment, 
  rejectManualPayment,
  getMyPayments, 
  getAllPayments,
  createStripeSession,
  createPayPalPayment,
  executePayPalPayment,
  createMpesaPayment,
  mpesaCallback
} from '../controllers/paymentController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/manual', protect, createManualPayment);
router.put('/approve/:id', protect, admin, approveManualPayment);
router.put('/reject/:id', protect, admin, rejectManualPayment);
router.get('/my-payments', protect, getMyPayments);
router.get('/', protect, admin, getAllPayments);

router.post('/stripe/create-session', protect, createStripeSession);
router.post('/paypal/create-payment', protect, createPayPalPayment);
router.post('/paypal/execute-payment', protect, executePayPalPayment);
router.post('/mpesa/stk-push', protect, createMpesaPayment);
router.post('/mpesa/callback', mpesaCallback);

export default router;
