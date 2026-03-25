import express from 'express';
import { getPlans, createPlan, updatePlan, deletePlan } from '../controllers/subscriptionController';
import { protect, admin, optionalAuth } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(optionalAuth, getPlans)
  .post(protect, admin, createPlan);

router.route('/:id')
  .put(protect, admin, updatePlan)
  .delete(protect, admin, deletePlan);

export default router;
