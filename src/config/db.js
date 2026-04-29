import mongoose from 'mongoose';
import { config } from './config.js';

export const connectDB = async () => {
  if (!config.mongoUri) {
    throw new Error('MONGO_URI is not defined');
  }

  await mongoose.connect(config.mongoUri);
  console.log('MongoDB connected');
};
