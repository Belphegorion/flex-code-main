import mongoose from 'mongoose';
import seedDatabase from './src/seeders/largeDummyData.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/eventflex';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Connected to MongoDB');
    await seedDatabase();
    await mongoose.disconnect();
    console.log('✅ Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

run();
