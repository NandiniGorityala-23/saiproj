import cron from 'node-cron';
import QRCode from '../models/QRCode.model.js';
import { sendExpiryReminder } from '../services/email.service.js';

export const sendPendingExpiryReminders = async () => {
  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(now.getDate() + 30);

  const expiring = await QRCode.find({
    status: 'claimed',
    expiresAt: { $gte: now, $lte: in30Days },
    notifiedAt: null,
  })
    .populate('product', 'name modelNumber')
    .populate('claimedBy', 'name email');

  const results = [];

  for (const code of expiring) {
    if (!code.claimedBy?.email) continue;

    try {
      await sendExpiryReminder({
        to: code.claimedBy.email,
        customerName: code.claimedBy.name,
        productName: code.product.name,
        modelNumber: code.product.modelNumber,
        expiresAt: code.expiresAt,
      });

      code.notifiedAt = new Date();
      await code.save();
      results.push({ uuid: code.uuid, status: 'sent' });
    } catch (err) {
      results.push({ uuid: code.uuid, status: 'failed', error: err.message });
    }
  }

  return results;
};

export const startExpiryNotifier = () => {
  cron.schedule('0 9 * * *', () => {
    sendPendingExpiryReminders().catch((err) => {
      console.error('Expiry notifier failed:', err.message);
    });
  });
};

