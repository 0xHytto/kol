import mongoose from 'mongoose';
import { logger } from '../utils/logger';

let isConnected = false;

export async function initDatabase(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  try {
    const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/kol_generator';

    await mongoose.connect(mongoUri);

    isConnected = true;
    logger.info('MongoDB connected successfully');

    return mongoose;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw new Error(`Failed to connect to database: ${error}`);
  }
}

export function getDatabase() {
  if (!isConnected) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return mongoose;
}

export default getDatabase;
