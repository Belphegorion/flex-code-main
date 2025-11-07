import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Event from '../models/Event.js';
import GroupChat from '../models/GroupChat.js';
import Notification from '../models/Notification.js';
import Profile from '../models/Profile.js';
import WorkSession from '../models/WorkSession.js';

export const createDatabaseIndexes = async () => {
  try {
    console.log('Creating database indexes...');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isActive: 1 });
    await User.collection.createIndex({ kycStatus: 1 });
    await User.collection.createIndex({ ratingAvg: -1 });
    await User.collection.createIndex({ lastActiveDate: -1 });
    await User.collection.createIndex({ createdAt: -1 });

    // Job indexes for performance
    await Job.collection.createIndex({ status: 1 });
    await Job.collection.createIndex({ organizerId: 1 });
    await Job.collection.createIndex({ eventId: 1 });
    await Job.collection.createIndex({ dateStart: 1 });
    await Job.collection.createIndex({ dateEnd: 1 });
    await Job.collection.createIndex({ payPerPerson: -1 });
    await Job.collection.createIndex({ requiredSkills: 1 });
    await Job.collection.createIndex({ 'location.city': 1 });
    await Job.collection.createIndex({ createdAt: -1 });
    
    // Compound indexes for common queries
    await Job.collection.createIndex({ status: 1, dateStart: 1 });
    await Job.collection.createIndex({ organizerId: 1, status: 1 });
    await Job.collection.createIndex({ eventId: 1, status: 1 });
    await Job.collection.createIndex({ status: 1, payPerPerson: -1 });
    
    // Geospatial index for location-based queries
    await Job.collection.createIndex({ 'location.coordinates': '2dsphere' });

    // Application indexes
    await Application.collection.createIndex({ jobId: 1 });
    await Application.collection.createIndex({ proId: 1 });
    await Application.collection.createIndex({ status: 1 });
    await Application.collection.createIndex({ createdAt: -1 });
    
    // Compound indexes for applications
    await Application.collection.createIndex({ jobId: 1, proId: 1 }, { unique: true });
    await Application.collection.createIndex({ proId: 1, status: 1 });
    await Application.collection.createIndex({ jobId: 1, status: 1 });

    // Event indexes
    await Event.collection.createIndex({ organizerId: 1 });
    await Event.collection.createIndex({ status: 1 });
    await Event.collection.createIndex({ dateStart: 1 });
    await Event.collection.createIndex({ dateEnd: 1 });
    await Event.collection.createIndex({ 'location.city': 1 });
    await Event.collection.createIndex({ createdAt: -1 });
    
    // Compound indexes for events
    await Event.collection.createIndex({ organizerId: 1, status: 1 });
    await Event.collection.createIndex({ status: 1, dateStart: 1 });

    // GroupChat indexes
    await GroupChat.collection.createIndex({ eventId: 1 });
    await GroupChat.collection.createIndex({ participants: 1 });
    await GroupChat.collection.createIndex({ createdBy: 1 });
    await GroupChat.collection.createIndex({ lastMessageAt: -1 });
    await GroupChat.collection.createIndex({ createdAt: -1 });

    // Notification indexes
    await Notification.collection.createIndex({ userId: 1 });
    await Notification.collection.createIndex({ read: 1 });
    await Notification.collection.createIndex({ type: 1 });
    await Notification.collection.createIndex({ createdAt: -1 });
    
    // Compound indexes for notifications
    await Notification.collection.createIndex({ userId: 1, read: 1 });
    await Notification.collection.createIndex({ userId: 1, createdAt: -1 });

    // Profile indexes
    await Profile.collection.createIndex({ userId: 1 }, { unique: true });
    await Profile.collection.createIndex({ skills: 1 });
    await Profile.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await Profile.collection.createIndex({ reliabilityScore: -1 });
    await Profile.collection.createIndex({ updatedAt: -1 });

    // WorkSession indexes
    await WorkSession.collection.createIndex({ eventId: 1 });
    await WorkSession.collection.createIndex({ workerId: 1 });
    await WorkSession.collection.createIndex({ jobId: 1 });
    await WorkSession.collection.createIndex({ status: 1 });
    await WorkSession.collection.createIndex({ date: 1 });
    await WorkSession.collection.createIndex({ createdAt: -1 });
    
    // Compound indexes for work sessions
    await WorkSession.collection.createIndex({ workerId: 1, status: 1 });
    await WorkSession.collection.createIndex({ eventId: 1, date: 1 });
    await WorkSession.collection.createIndex({ workerId: 1, date: 1 });

    // Text indexes for search functionality
    await Job.collection.createIndex({ 
      title: 'text', 
      description: 'text', 
      requiredSkills: 'text' 
    });
    
    await Event.collection.createIndex({ 
      title: 'text', 
      description: 'text' 
    });
    
    await User.collection.createIndex({ 
      name: 'text', 
      email: 'text' 
    });

    // TTL indexes for cleanup
    await Notification.collection.createIndex(
      { createdAt: 1 }, 
      { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 days
    );

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating database indexes:', error);
    throw error;
  }
};

// Function to analyze query performance
export const analyzeQueryPerformance = async () => {
  try {
    console.log('Analyzing query performance...');
    
    // Get index usage statistics
    const collections = ['users', 'jobs', 'applications', 'events', 'groupchats', 'notifications'];
    
    for (const collectionName of collections) {
      const stats = await mongoose.connection.db.collection(collectionName).indexStats();
      console.log(`\n${collectionName.toUpperCase()} Index Usage:`);
      
      stats.forEach(stat => {
        console.log(`- ${stat.name}: ${stat.accesses.ops} operations`);
      });
    }
  } catch (error) {
    console.error('Error analyzing query performance:', error);
  }
};

// Function to drop unused indexes
export const dropUnusedIndexes = async () => {
  try {
    console.log('Checking for unused indexes...');
    
    const collections = ['users', 'jobs', 'applications', 'events', 'groupchats', 'notifications'];
    
    for (const collectionName of collections) {
      const stats = await mongoose.connection.db.collection(collectionName).indexStats();
      
      for (const stat of stats) {
        // If index hasn't been used and it's not _id index
        if (stat.accesses.ops === 0 && stat.name !== '_id_') {
          console.log(`Unused index found: ${collectionName}.${stat.name}`);
          // Uncomment to actually drop unused indexes
          // await mongoose.connection.db.collection(collectionName).dropIndex(stat.name);
          // console.log(`Dropped unused index: ${stat.name}`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking unused indexes:', error);
  }
};