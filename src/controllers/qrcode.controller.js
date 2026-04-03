import Batch from '../models/Batch.model.js';
import Product from '../models/Product.model.js';
import QRCode from '../models/QRCode.model.js';
import { createQrPayload } from '../services/qr.service.js';
import { paginationMeta, parsePagination } from '../utils/pagination.js';

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
    const { page, limit, skip } = parsePagination(req.query, {
      defaultLimit: 50,
      maxLimit: 200,
    });
    const products = await Product.find({ manufacturer: req.user._id }).select('_id');
    const productIds = products.map((product) => product._id);
    const filter = { product: { $in: productIds } };

    const [qrcodes, total] = await Promise.all([
      QRCode.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('product', 'name modelNumber'),
      QRCode.countDocuments(filter),
    ]);

    res.json({
      qrcodes,
      ...paginationMeta({ total, page, limit }),
    });
  } catch (err) {
    next(err);
  }
};
