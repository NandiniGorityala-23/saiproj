import Batch from '../models/Batch.model.js';
import Product from '../models/Product.model.js';
import QRCode from '../models/QRCode.model.js';
import { createQrPayload } from '../services/qr.service.js';

export const generateQRCodes = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const count = Math.min(Math.max(Number(quantity) || 1, 1), 500);

    const product = await Product.findOne({
      _id: productId,
      manufacturer: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const batch = await Batch.create({
      product: product._id,
      quantity: count,
      createdBy: req.user._id,
    });

    const qrCodes = [];
    for (let index = 0; index < count; index++) {
      const payload = await createQrPayload();
      qrCodes.push({
        uuid: payload.uuid,
        claimUrl: payload.claimUrl,
        imageDataUrl: payload.imageDataUrl,
        product: product._id,
        batch: batch._id,
      });
    }

    const savedCodes = await QRCode.insertMany(
      qrCodes.map(({ imageDataUrl, ...code }) => code)
    );

    res.status(201).json({
      batch,
      qrcodes: savedCodes.map((code, index) => ({
        id: code._id,
        uuid: code.uuid,
        claimUrl: code.claimUrl,
        imageDataUrl: qrCodes[index].imageDataUrl,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const listQRCodes = async (req, res, next) => {
  try {
    const products = await Product.find({ manufacturer: req.user._id }).select('_id');
    const productIds = products.map((product) => product._id);

    const qrcodes = await QRCode.find({ product: { $in: productIds } })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('product', 'name modelNumber');

    res.json({ qrcodes });
  } catch (err) {
    next(err);
  }
};

