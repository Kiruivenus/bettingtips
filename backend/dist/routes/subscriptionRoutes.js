"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscriptionController_1 = require("../controllers/subscriptionController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.route('/')
    .get(authMiddleware_1.optionalAuth, subscriptionController_1.getPlans)
    .post(authMiddleware_1.protect, authMiddleware_1.admin, subscriptionController_1.createPlan);
router.route('/:id')
    .put(authMiddleware_1.protect, authMiddleware_1.admin, subscriptionController_1.updatePlan)
    .delete(authMiddleware_1.protect, authMiddleware_1.admin, subscriptionController_1.deletePlan);
exports.default = router;
