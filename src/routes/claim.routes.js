import express from 'express';
import {
  claimWarranty,
  getClaimPreview,
  listMyWarranties,
} from '../controllers/claim.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/warranties', protect, restrictTo('customer'), listMyWarranties);
router.get('/:uuid', getClaimPreview);
router.post('/:uuid', protect, restrictTo('customer'), claimWarranty);

export default router;

