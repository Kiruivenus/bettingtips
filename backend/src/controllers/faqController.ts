import { Request, Response } from 'express';
import FAQ from '../models/FAQ';
import { AuthRequest } from '../middlewares/authMiddleware';

// @desc    Get all active FAQs (public)
// @route   GET /api/faqs
export const getFAQs = async (req: Request, res: Response) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
};

// @desc    Get all FAQs including inactive (admin)
// @route   GET /api/faqs/all
export const getAllFAQs = async (req: AuthRequest, res: Response) => {
  try {
    const faqs = await FAQ.find({}).sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
};

// @desc    Create a FAQ
// @route   POST /api/faqs
export const createFAQ = async (req: AuthRequest, res: Response) => {
  try {
    const { question, answer, order, isActive } = req.body;
    const faq = await FAQ.create({ question, answer, order: order || 0, isActive: isActive !== false });
    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Error creating FAQ' });
  }
};

// @desc    Update a FAQ
// @route   PUT /api/faqs/:id
export const updateFAQ = async (req: AuthRequest, res: Response) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Error updating FAQ' });
  }
};

// @desc    Delete a FAQ
// @route   DELETE /api/faqs/:id
export const deleteFAQ = async (req: AuthRequest, res: Response) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting FAQ' });
  }
};
