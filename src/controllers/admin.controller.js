import Batch from '../models/Batch.model.js';
import Product from '../models/Product.model.js';
import QRCode from '../models/QRCode.model.js';
import { sendPendingExpiryReminders } from '../jobs/expiryNotifier.job.js';

const csvValue = (value) => {
  const text = value === undefined || value === null ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
};

export const getAnalytics = async (req, res, next) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 7), 365);
    const products = await Product.find({ manufacturer: req.user._id })
      .select('_id name category warrantyDurationMonths');
    const productIds = products.map((product) => product._id);

    const [totalCodes, totalClaimed, totalBatches] = await Promise.all([
      QRCode.countDocuments({ product: { $in: productIds } }),
      QRCode.countDocuments({ product: { $in: productIds }, status: 'claimed' }),
      Batch.countDocuments({ product: { $in: productIds } }),
    ]);

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - (days - 1));
    periodStart.setHours(0, 0, 0, 0);

    const claimsByDay = await QRCode.aggregate([
      {
        $match: {
          product: { $in: productIds },
          status: 'claimed',
          claimedAt: { $gte: periodStart },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$claimedAt' } },
          claims: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const claimsByCategory = await QRCode.aggregate([
      { $match: { product: { $in: productIds }, status: 'claimed' } },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: { _id: '$product.category', claimed: { $sum: 1 } } },
      { $sort: { claimed: -1 } },
    ]);

    res.json({
      summary: {
        totalProducts: products.length,
        totalCodes,
        totalClaimed,
        totalUnclaimed: totalCodes - totalClaimed,
        totalBatches,
        claimRate: totalCodes > 0 ? Math.round((totalClaimed / totalCodes) * 100) : 0,
      },
      claimsByDay,
      claimsByCategory,
    });
  } catch (err) {
    next(err);
  }
};

export const triggerExpiryNotifications = async (req, res, next) => {
  try {
    const products = await Product.find({ manufacturer: req.user._id }).select('_id');
    const productIds = products.map((product) => product._id);
    const results = await sendPendingExpiryReminders({ productIds });

    res.json({
      sent: results.filter((result) => result.status === 'sent').length,
      total: results.length,
      results,
    });
  } catch (err) {
    next(err);
  }
};

export const exportClaimsCsv = async (req, res, next) => {
  try {
    const products = await Product.find({ manufacturer: req.user._id }).select('_id');
    const productIds = products.map((product) => product._id);
    const claims = await QRCode.find({
      product: { $in: productIds },
      status: 'claimed',
    })
      .sort({ claimedAt: -1 })
      .populate('product', 'name modelNumber category')
      .populate('claimedBy', 'name email');

    const rows = [
      ['Product', 'Model Number', 'Category', 'Customer', 'Email', 'Claimed At', 'Expires At'],
      ...claims.map((claim) => [
        claim.product?.name,
        claim.product?.modelNumber,
        claim.product?.category,
        claim.claimedBy?.name,
        claim.claimedBy?.email,
        claim.claimedAt?.toISOString(),
        claim.expiresAt?.toISOString(),
      ]),
    ];

    const csv = rows.map((row) => row.map(csvValue).join(',')).join('\n');

    res
      .status(200)
      .type('text/csv')
      .set('Content-Disposition', 'attachment; filename="claims-export.csv"')
      .send(csv);
  } catch (err) {
    next(err);
  }
};
