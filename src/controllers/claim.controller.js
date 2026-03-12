import QRCode from '../models/QRCode.model.js';

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

