"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTip = exports.updateTip = exports.createTip = exports.getTips = void 0;
const Tip_1 = __importDefault(require("../models/Tip"));
// Reusable function to check if user has active premium
const hasActivePremium = (req) => {
    if (!req.user)
        return false;
    if (req.user.role === 'admin')
        return true;
    if (req.user.subscriptionExpiry && new Date(req.user.subscriptionExpiry) > new Date()) {
        return true;
    }
    return false;
};
// @desc    Get all tips
// @route   GET /api/tips
// @access  Public (Premium details hidden if not subscribed)
const getTips = async (req, res) => {
    try {
        const tips = await Tip_1.default.find({}).sort({ matchDate: -1 });
        const isPremiumUser = hasActivePremium(req);
        const formattedTips = tips.map((tip) => {
            const tipObj = tip.toObject();
            if (tipObj.isPremium && !isPremiumUser) {
                tipObj.prediction = 'Hidden for non-premium users';
            }
            return tipObj;
        });
        res.json(formattedTips);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error retrieving tips' });
    }
};
exports.getTips = getTips;
// @desc    Create a tip
// @route   POST /api/tips
// @access  Private/Admin
const createTip = async (req, res) => {
    try {
        const tip = new Tip_1.default(req.body);
        const createdTip = await tip.save();
        res.status(201).json(createdTip);
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid tip data' });
    }
};
exports.createTip = createTip;
// @desc    Update a tip
// @route   PUT /api/tips/:id
// @access  Private/Admin
const updateTip = async (req, res) => {
    try {
        const tip = await Tip_1.default.findById(req.params.id);
        if (tip) {
            Object.assign(tip, req.body);
            const updatedTip = await tip.save();
            res.json(updatedTip);
        }
        else {
            res.status(404).json({ message: 'Tip not found' });
        }
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating tip' });
    }
};
exports.updateTip = updateTip;
// @desc    Delete a tip
// @route   DELETE /api/tips/:id
// @access  Private/Admin
const deleteTip = async (req, res) => {
    try {
        const tip = await Tip_1.default.findById(req.params.id);
        if (tip) {
            await Tip_1.default.deleteOne({ _id: tip._id });
            res.json({ message: 'Tip removed' });
        }
        else {
            res.status(404).json({ message: 'Tip not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting tip' });
    }
};
exports.deleteTip = deleteTip;
