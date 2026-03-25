"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlan = exports.updatePlan = exports.createPlan = exports.getPlans = void 0;
const SubscriptionPlan_1 = __importDefault(require("../models/SubscriptionPlan"));
// @desc    Get all active subscription plans
// @route   GET /api/plans
// @access  Public
const getPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan_1.default.find(req.user?.role === 'admin' ? {} : { isActive: true });
        res.json(plans);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching plans' });
    }
};
exports.getPlans = getPlans;
// @desc    Create a plan
// @route   POST /api/plans
// @access  Private/Admin
const createPlan = async (req, res) => {
    try {
        const plan = new SubscriptionPlan_1.default(req.body);
        const createdPlan = await plan.save();
        res.status(201).json(createdPlan);
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid plan data' });
    }
};
exports.createPlan = createPlan;
// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
const updatePlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan_1.default.findById(req.params.id);
        if (plan) {
            Object.assign(plan, req.body);
            const updatedPlan = await plan.save();
            res.json(updatedPlan);
        }
        else {
            res.status(404).json({ message: 'Plan not found' });
        }
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating plan' });
    }
};
exports.updatePlan = updatePlan;
// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
const deletePlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan_1.default.findById(req.params.id);
        if (plan) {
            await SubscriptionPlan_1.default.deleteOne({ _id: plan._id });
            res.json({ message: 'Plan removed' });
        }
        else {
            res.status(404).json({ message: 'Plan not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting plan' });
    }
};
exports.deletePlan = deletePlan;
