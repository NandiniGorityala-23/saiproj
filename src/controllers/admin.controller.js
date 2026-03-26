import Batch from '../models/Batch.model.js';
import Product from '../models/Product.model.js';
import QRCode from '../models/QRCode.model.js';
import { sendPendingExpiryReminders } from '../jobs/expiryNotifier.job.js';

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
    const results = await sendPendingExpiryReminders();
    res.json({
      sent: results.filter((result) => result.status === 'sent').length,
      total: results.length,
      results,
    });
  } catch (err) {
    next(err);
  }
};
