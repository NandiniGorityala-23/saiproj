import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import connectDB from './config/db.js';
import { getEnv, validateEnv } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import errorHandler from './middleware/error.middleware.js';

const app = express();
const startedAt = new Date().toISOString();

app.use(helmet());
app.use(
  cors({
    origin: [
      getEnv('ADMIN_APP_URL', 'http://localhost:5174'),
      getEnv('CUSTOMER_APP_URL', 'http://localhost:5173'),
    ],
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'omniwarranty-backend',
    startedAt,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use(errorHandler);

const PORT = getEnv('PORT', 5000);

validateEnv();

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`OmniWarranty backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });
