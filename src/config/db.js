import mongoose from 'mongoose';
import { getEnv } from './env.js';

const connectDB = async () => {
  const conn = await mongoose.connect(getEnv('MONGODB_URI'));
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;

