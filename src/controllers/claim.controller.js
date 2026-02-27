import QRCode from '../models/QRCode.model.js';
import { buildWarrantyCertificate } from '../services/certificate.service.js';
import { recordWarrantyEvent } from '../services/warrantyEvent.service.js';

const calculateExpiryDate = (claimedAt, months) => {
  const expiresAt = new Date(claimedAt);
  expiresAt.setMonth(expiresAt.getMonth() + months);
  return expiresAt;
};

export const getClaimPreview = async (req, res, next) => {
  try {
    const qrcode = await QRCode.findOne({ uuid: req.params.uuid })
      .populate('product', 'name modelNumber category warrantyDurationMonths');

    if (!qrcode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    res.json({
      status: qrcode.status,
      product: qrcode.product,
      claimedAt: qrcode.claimedAt,
      expiresAt: qrcode.expiresAt,
    });

    recordWarrantyEvent({
      qrcode: qrcode._id,
      eventType: 'claim_previewed',
      metadata: { uuid: qrcode.uuid, status: qrcode.status },
    }).catch((err) => console.error('Failed to record claim preview event:', err.message));
  } catch (err) {
    next(err);
  }
};

export const claimWarranty = async (req, res, next) => {
  try {
    const qrcode = await QRCode.findOne({ uuid: req.params.uuid })
      .populate('product', 'name modelNumber category warrantyDurationMonths');

    if (!qrcode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    if (qrcode.status === 'claimed') {
      return res.status(409).json({ message: 'Warranty already claimed' });
    }

    const claimedAt = new Date();
    qrcode.status = 'claimed';
    qrcode.claimedBy = req.user._id;
    qrcode.claimedAt = claimedAt;
    qrcode.expiresAt = calculateExpiryDate(claimedAt, qrcode.product.warrantyDurationMonths);

    await qrcode.save();

    recordWarrantyEvent({
      qrcode: qrcode._id,
      eventType: 'claimed',
      actor: req.user._id,
      metadata: {
        uuid: qrcode.uuid,
        product: qrcode.product._id,
        expiresAt: qrcode.expiresAt,
      },
    }).catch((err) => console.error('Failed to record claim event:', err.message));

    res.status(201).json({
      warranty: {
        uuid: qrcode.uuid,
        product: qrcode.product,
        claimedAt: qrcode.claimedAt,
        expiresAt: qrcode.expiresAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const listMyWarranties = async (req, res, next) => {
  try {
    const warranties = await QRCode.find({
      claimedBy: req.user._id,
      status: 'claimed',
    })
      .sort({ claimedAt: -1 })
      .populate('product', 'name modelNumber category warrantyDurationMonths');

    res.json({ warranties });
  } catch (err) {
    next(err);
  }
};

export const getWarrantyCertificate = async (req, res, next) => {
  try {
    const qrcode = await QRCode.findOne({
      uuid: req.params.uuid,
      claimedBy: req.user._id,
      status: 'claimed',
    })
      .populate('product', 'name modelNumber category')
      .populate('claimedBy', 'name email');

    if (!qrcode) {
      return res.status(404).json({ message: 'Warranty not found' });
    }

    recordWarrantyEvent({
      qrcode: qrcode._id,
      eventType: 'certificate_viewed',
      actor: req.user._id,
      metadata: { uuid: qrcode.uuid },
    }).catch((err) => console.error('Failed to record certificate event:', err.message));

    res.json({ certificate: buildWarrantyCertificate(qrcode) });
  } catch (err) {
    next(err);
  }
};
