import { Request, Response } from 'express';
import Tip from '../models/Tip';
import { AuthRequest } from '../middlewares/authMiddleware';

// Reusable function to check if user has active premium subscription
export const hasActivePremium = (req: AuthRequest): boolean => {
  if (!req.user) return false;
  if (req.user.role === 'admin') return true;
  if (req.user.subscriptionExpiry && new Date(req.user.subscriptionExpiry) > new Date()) {
    return true;
  }
  return false;
};

// @desc    Get all tips with server-side VIP entitlement & 3 free tips/day enforcement
// @route   GET /api/tips
// @access  Public / Authenticated
export const getTips = async (req: AuthRequest, res: Response) => {
  try {
    const tips = await Tip.find({}).sort({ matchDate: -1 }).populate('planIds', 'name');
    const isPremiumUser = hasActivePremium(req);

    // Group free tips by date to enforce strict 3 per day server-side for non-premium users
    const freeTipsCountByDate: Record<string, number> = {};

    const formattedTips = tips.map((tip) => {
      const tipObj = tip.toObject();
      const dayKey = tipObj.matchDate ? new Date(tipObj.matchDate).toISOString().split('T')[0] : 'unknown';

      const isFreeTip = !tipObj.isPremium || tipObj.accessLevel === 'FREE';

      if (!isPremiumUser) {
        if (isFreeTip) {
          freeTipsCountByDate[dayKey] = (freeTipsCountByDate[dayKey] || 0) + 1;
          // Enforce strict 3 free tips per day server-side
          if (freeTipsCountByDate[dayKey] > 3) {
            tipObj.prediction = 'Daily free prediction limit reached. Upgrade to VIP to access.';
            tipObj.selection = 'Daily free prediction limit reached.';
          }
        } else if (tipObj.status === 'pending' || tipObj.status === 'UPCOMING' || tipObj.status === 'ACTIVE' || tipObj.status === 'LOCKED') {
          tipObj.prediction = 'Requires active VIP subscription';
          tipObj.selection = 'Requires active VIP subscription';
        }
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
