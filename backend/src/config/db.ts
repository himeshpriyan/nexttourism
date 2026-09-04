import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ContactModel } from '../models/ContactModel.js';
import { CategoryModel } from '../models/CategoryModel.js';
import { DEFAULT_CATEGORIES, SAMPLE_CONTACTS } from '../models/dataStore.js';

dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI;

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function connectDB(): Promise<boolean> {
  if (!MONGODB_URI) {
    console.warn('⚠️ No MONGODB_URI found in environment variables. Operating with Local JSON storage.');
    return false;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully.');

    // Seed default categories if database collection is empty
    const categoryCount = await CategoryModel.countDocuments();
    if (categoryCount === 0) {
      console.log('🌱 Seeding default categories to MongoDB Atlas...');
      await CategoryModel.insertMany(DEFAULT_CATEGORIES);
    }

    // Seed sample contacts if database collection is empty
    const contactCount = await ContactModel.countDocuments();
    if (contactCount === 0) {
      console.log('🌱 Seeding sample contacts to MongoDB Atlas...');
      await ContactModel.insertMany(SAMPLE_CONTACTS);
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', (error as Error).message);
    console.warn('⚠️ Falling back to Local File Database.');
    return false;
  }
}
