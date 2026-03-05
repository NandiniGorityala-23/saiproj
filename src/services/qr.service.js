import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { getEnv } from '../config/env.js';

export const buildClaimUrl = (uuid) => {
  const customerUrl = getEnv('CUSTOMER_APP_URL', 'http://localhost:5173');
  return `${customerUrl}/claim/${uuid}`;
};

export const createQrPayload = async () => {
  const uuid = uuidv4();
  const claimUrl = buildClaimUrl(uuid);
  const imageDataUrl = await QRCode.toDataURL(claimUrl, {
    margin: 1,
    width: 320,
  });

  return { uuid, claimUrl, imageDataUrl };
};

