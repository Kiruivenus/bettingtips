import express from 'express';
import { getUsers, updateUser } from '../controllers/userController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .put(protect, admin, updateUser);

export default router;
