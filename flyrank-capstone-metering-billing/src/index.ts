import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import billingRoutes from './routes/billing';
import webhookRoutes from './routes/webhooks';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Middleware for JSON (except for webhooks where raw body is needed for Stripe)
app.use((req, res, next) => {
  if (req.originalUrl === '/webhooks/stripe') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Pass prisma to routes
app.use((req, res, next) => {
  (req as any).prisma = prisma;
  next();
});

// Routes
app.use('/api', billingRoutes);
app.use('/webhooks', webhookRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Usage Metering & Billing Service running on port ${port}`);
});
