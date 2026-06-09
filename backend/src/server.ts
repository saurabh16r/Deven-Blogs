import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

// Route Imports
import authRoutes from './routes/auth';
import blogRoutes from './routes/blogs';
import userRoutes from './routes/users';
import paymentRoutes from './routes/payments';
import commentRoutes from './routes/comments';
import adminRoutes from './routes/admin';
import analyticsRoutes from './routes/analytics';
import aiRoutes from './routes/ai';
import mediaRoutes from './routes/media';

// Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (auto-toggles mock modes if empty/failed)
// Trigger database reload and env variables re-evaluation
connectDB();

// Middlewares
app.use(cors({ origin: '*' })); // Allow cross-origin for local developers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: process.env.MOCK_MODE === 'true' ? 'MOCK_DATABASE' : 'MONGODB',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/media', mediaRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Deven Blogs Backend API is active at http://localhost:${PORT}`);
  console.log(`💡 Mode: ${process.env.MOCK_MODE === 'true' ? 'MOCKED (In-memory database)' : 'MAPPED (Mongoose MongoDB)'}`);
});
