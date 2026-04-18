// Fix MongoDB Index Conflicts
// Run this script to fix text index conflicts in the Job collection

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventflex');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get existing indexes on jobs collection
    console.log('\nChecking jobs collection indexes...');
    const indexes = await db.collection('jobs').indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop the old conflicting text index
    const oldTextIndex = 'title_text_description_text_roles_text';
    try {
      await db.collection('jobs').dropIndex(oldTextIndex);
      console.log(`✅ Dropped old index: ${oldTextIndex}`);
    } catch (error) {
      if (error.code === 27) {
        console.log(`ℹ️  Index ${oldTextIndex} doesn't exist, skipping...`);
      } else {
        throw error;
      }
    }

    // Create the new correct text index
    console.log('\nCreating new text index...');
    await db.collection('jobs').createIndex(
      { 
        title: 'text', 
        description: 'text', 
        requiredSkills: 'text' 
      },
      { name: 'title_text_description_text_requiredSkills_text' }
    );
    console.log('✅ Created new text index');

    // Verify indexes
    const newIndexes = await db.collection('jobs').indexes();
    console.log('\nFinal indexes:', newIndexes.map(i => i.name));

    console.log('\n✅ Index fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();
