import express from 'express';
import { getAnalytics } from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));
router.get('/analytics', getAnalytics);

export default router;

