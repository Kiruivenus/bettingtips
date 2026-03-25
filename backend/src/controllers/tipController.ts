import { Request, Response } from 'express';
import Tip from '../models/Tip';
import { AuthRequest } from '../middlewares/authMiddleware';

// Reusable function to check if user has active premium
const hasActivePremium = (req: AuthRequest): boolean => {
  if (!req.user) return false;
  if (req.user.role === 'admin') return true;
  if (req.user.subscriptionExpiry && new Date(req.user.subscriptionExpiry) > new Date()) {
    return true;
  }
  return false;
};

// @desc    Get all tips
// @route   GET /api/tips
// @access  Public (Premium details hidden if not subscribed)
export const getTips = async (req: AuthRequest, res: Response) => {
  try {
    const tips = await Tip.find({}).sort({ matchDate: -1 }).populate('planId', 'name');
    const isPremiumUser = hasActivePremium(req);

    const formattedTips = tips.map((tip) => {
      const tipObj = tip.toObject();
      // Only hide prediction if it's premium, pending, and user is not premium
      if (tipObj.isPremium && tipObj.status === 'pending' && !isPremiumUser) {
        tipObj.prediction = 'Hidden for non-premium users';
      }
      return tipObj;
    });

    res.json(formattedTips);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving tips' });
  }
};

// @desc    Create a tip
// @route   POST /api/tips
// @access  Private/Admin
export const createTip = async (req: AuthRequest, res: Response) => {
  try {
    const tip = new Tip(req.body);
    const createdTip = await tip.save();
    res.status(201).json(createdTip);
  } catch (error) {
    res.status(400).json({ message: 'Invalid tip data' });
  }
};

// @desc    Update a tip
// @route   PUT /api/tips/:id
// @access  Private/Admin
export const updateTip = async (req: AuthRequest, res: Response) => {
  try {
    const tip = await Tip.findById(req.params.id);

    if (tip) {
      Object.assign(tip, req.body);
      const updatedTip = await tip.save();
      res.json(updatedTip);
    } else {
      res.status(404).json({ message: 'Tip not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating tip' });
  }
};

// @desc    Delete a tip
// @route   DELETE /api/tips/:id
// @access  Private/Admin
export const deleteTip = async (req: AuthRequest, res: Response) => {
  try {
    const tip = await Tip.findById(req.params.id);

    if (tip) {
      await Tip.deleteOne({ _id: tip._id });
      res.json({ message: 'Tip removed' });
    } else {
      res.status(404).json({ message: 'Tip not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tip' });
  }
};
