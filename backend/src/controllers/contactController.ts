import { Request, Response } from 'express';
import ContactMessage from '../models/ContactMessage';
import { AuthRequest } from '../middlewares/authMiddleware';

// @desc    Submit a contact message (public)
// @route   POST /api/contact
export const submitMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }
    const msg = await ContactMessage.create({ name, email, message });
    res.status(201).json({ message: 'Message sent successfully', id: msg._id });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting message' });
  }
};

// @desc    Get all contact messages (admin)
// @route   GET /api/contact
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

// @desc    Mark a message as read (admin)
// @route   PUT /api/contact/:id/read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    res.json(msg);
  } catch (error) {
    res.status(500).json({ message: 'Error marking message as read' });
  }
};

// @desc    Delete a message (admin)
// @route   DELETE /api/contact/:id
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message' });
  }
};
