import mongoose from 'mongoose';
import User from '../models/User';
import { seedDatabase } from './seed';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.log('⚠️ No MONGO_URI found in env. Running in MOCK_MODE (in-memory data simulation).');
    process.env.MOCK_MODE = 'true';
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    process.env.MOCK_MODE = 'false';

    // Seed database if empty
    const userCount = await User.countDocuments();
    const forceReseed = false;
    if (userCount === 0 || forceReseed) {
      await seedDatabase();
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${(error as Error).message}`);
    console.log('⚠️ Falling back to MOCK_MODE due to connection failure.');
    process.env.MOCK_MODE = 'true';
  }
};
