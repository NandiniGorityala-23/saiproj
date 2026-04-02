import 'dotenv/config';
import mongoose from 'mongoose';
import { getEnv } from '../src/config/env.js';
import QRCode from '../src/models/QRCode.model.js';

await mongoose.connect(getEnv('MONGODB_URI'));
console.log('Connected to MongoDB');

const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 20);

const result = await QRCode.updateMany(
  { status: 'claimed' },
  { $set: { expiresAt, notifiedAt: null } }
);

console.log(`Updated ${result.modifiedCount} claimed warranties -> expiresAt: ${expiresAt.toDateString()}`);

await mongoose.disconnect();

