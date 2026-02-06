import WarrantyEvent from '../models/WarrantyEvent.model.js';

export const recordWarrantyEvent = async ({ qrcode, eventType, actor = null, metadata = {} }) =>
  WarrantyEvent.create({
    qrcode,
    eventType,
    actor,
    metadata,
  });

