import express from 'express';
import {
  claimWarranty,
  getWarrantyCertificate,
  getClaimPreview,
  listMyWarranties,
} from '../controllers/claim.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/warranties', protect, restrictTo('customer'), listMyWarranties);
router.get('/warranties/:uuid/certificate', protect, restrictTo('customer'), getWarrantyCertificate);
router.get('/:uuid', getClaimPreview);
router.post('/:uuid', protect, restrictTo('customer'), claimWarranty);

export default router;
