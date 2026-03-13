import express from 'express';
import {
  exportClaimsCsv,
  getBatchSummary,
  getAnalytics,
  triggerExpiryNotifications,
} from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));
router.get('/analytics', getAnalytics);
router.get('/batches/summary', getBatchSummary);
router.get('/claims/export', exportClaimsCsv);
router.post('/trigger-expiry', triggerExpiryNotifications);

export default router;
