import express from 'express';
import { generateQRCodes, listQRCodes } from '../controllers/qrcode.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/', listQRCodes);
router.post('/generate', generateQRCodes);

export default router;

