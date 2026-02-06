import mongoose from 'mongoose';

const warrantyEventSchema = new mongoose.Schema(
  {
    qrcode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QRCode',
      required: true,
    },
    eventType: {
      type: String,
      enum: ['claim_previewed', 'claimed', 'certificate_viewed', 'expiry_reminder_sent'],
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

warrantyEventSchema.index({ qrcode: 1, createdAt: -1 });
warrantyEventSchema.index({ eventType: 1, createdAt: -1 });

export default mongoose.model('WarrantyEvent', warrantyEventSchema);

