import express from 'express';
import dotenv from 'dotenv';
import postRoutes from './routes/posts';
import variantRoutes from './routes/variants';
import historyRoutes from './routes/history';
import { startScheduler } from './scheduler/durable-scheduler';

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/history', historyRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Start the background durable scheduler
  startScheduler();
});
