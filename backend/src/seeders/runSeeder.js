import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedDatabase from './largeDummyData.js';

dotenv.config();

const runSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB');
    
    await seedDatabase();
    
    await mongoose.disconnect();
    console.log('✅ Seeding completed and disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

runSeeder();
