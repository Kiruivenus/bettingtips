import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import tipRoutes from './routes/tipRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import paymentRoutes from './routes/paymentRoutes';
import userRoutes from './routes/userRoutes';
import faqRoutes from './routes/faqRoutes';
import contactRoutes from './routes/contactRoutes';
import settingsRoutes from './routes/settingsRoutes';
import liveScoreRoutes from './routes/liveScoreRoutes';


const app = express();

app.use(helmet());
app.use(cors());

// Stripe webhook must come BEFORE express.json() to maintain the raw body buffer
import { stripeWebhook } from './controllers/paymentController';
app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/plans', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/livescores', liveScoreRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/betting-tips-platform';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
