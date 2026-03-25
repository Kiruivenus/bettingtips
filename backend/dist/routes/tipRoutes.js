"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tipController_1 = require("../controllers/tipController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.route('/')
    .get(authMiddleware_1.optionalAuth, tipController_1.getTips)
    .post(authMiddleware_1.protect, authMiddleware_1.admin, tipController_1.createTip);
router.route('/:id')
    .put(authMiddleware_1.protect, authMiddleware_1.admin, tipController_1.updateTip)
    .delete(authMiddleware_1.protect, authMiddleware_1.admin, tipController_1.deleteTip);
exports.default = router;
