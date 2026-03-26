import nodemailer from 'nodemailer';
import { getEnv } from '../config/env.js';

const createTransport = () =>
  nodemailer.createTransport({
    host: getEnv('SMTP_HOST', 'localhost'),
    port: Number(getEnv('SMTP_PORT', 1025)),
    secure: false,
    auth: getEnv('SMTP_USER')
      ? {
          user: getEnv('SMTP_USER'),
          pass: getEnv('SMTP_PASS'),
        }
      : undefined,
  });

export const sendExpiryReminder = async ({ to, customerName, productName, modelNumber, expiresAt }) => {
  const transport = createTransport();

  return transport.sendMail({
    from: getEnv('EMAIL_FROM', 'warranty@omniwarranty.local'),
    to,
    subject: `Warranty expiring soon: ${productName}`,
    text: [
      `Hi ${customerName || 'there'},`,
      '',
      `Your warranty for ${productName} (${modelNumber}) expires on ${expiresAt.toDateString()}.`,
      'Please contact support if you need renewal help.',
    ].join('\n'),
  });
};

