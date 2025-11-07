import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db.collections();
    
    console.log('\nClearing all collections...\n');
    
    for (let collection of collections) {
      const count = await collection.countDocuments();
      await collection.deleteMany({});
      console.log(`✓ Cleared ${collection.collectionName}: ${count} documents deleted`);
    }

    console.log('\n✅ Database cleared successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
