import express from 'express';
import { getTips, createTip, updateTip, deleteTip } from '../controllers/tipController';
import { protect, admin, optionalAuth } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(optionalAuth, getTips)
  .post(protect, admin, createTip);

router.route('/:id')
  .put(protect, admin, updateTip)
  .delete(protect, admin, deleteTip);

export default router;
