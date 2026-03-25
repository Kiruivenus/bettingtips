import { Request, Response } from 'express';
import SubscriptionPlan from '../models/SubscriptionPlan';

// @desc    Get all active subscription plans
// @route   GET /api/plans
// @access  Public
export const getPlans = async (req: any, res: Response) => {
  try {
    const plans = await SubscriptionPlan.find(req.user?.role === 'admin' ? {} : { isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans' });
  }
};

// @desc    Create a plan
// @route   POST /api/plans
// @access  Private/Admin
export const createPlan = async (req: Request, res: Response) => {
  try {
    const plan = new SubscriptionPlan(req.body);
    const createdPlan = await plan.save();
    res.status(201).json(createdPlan);
  } catch (error) {
    res.status(400).json({ message: 'Invalid plan data' });
  }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (plan) {
      Object.assign(plan, req.body);
      const updatedPlan = await plan.save();
      res.json(updatedPlan);
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating plan' });
  }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
export const deletePlan = async (req: Request, res: Response) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (plan) {
      await SubscriptionPlan.deleteOne({ _id: plan._id });
      res.json({ message: 'Plan removed' });
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plan' });
  }
};
