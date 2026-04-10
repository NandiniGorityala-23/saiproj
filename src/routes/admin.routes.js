import express from 'express';
import {
  exportClaimsCsv,
  getBatchSummary,
  getAnalytics,
  listWarrantyEvents,
  triggerExpiryNotifications,
} from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));
router.get('/analytics', getAnalytics);
router.get('/batches/summary', getBatchSummary);
router.get('/claims/export', exportClaimsCsv);
router.get('/warranty-events', listWarrantyEvents);
router.post('/trigger-expiry', triggerExpiryNotifications);

export default router;
