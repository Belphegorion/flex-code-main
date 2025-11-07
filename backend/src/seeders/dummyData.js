import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

const seedDatabase = async () => {
  try {
    await User.deleteMany({});
    await Event.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    const organizer = await User.create({
      name: 'Sarah Johnson',
      email: 'organizer@eventflex.com',
      phone: '+1-555-0101',
      password: hashedPassword,
      role: 'organizer',
      profileCompleted: true,
      bio: 'Professional event organizer with 10+ years experience',
      location: { city: 'New York', state: 'NY', country: 'USA' },
      badges: ['Verified', 'Elite'],
      ratingAvg: 4.8,
      totalRatings: 45
    });

    const workers = await User.insertMany([
      {
        name: 'John Smith',
        email: 'worker1@eventflex.com',
        phone: '+1-555-0201',
        password: hashedPassword,
        role: 'worker',
        profileCompleted: true,
        bio: 'Experienced event staff with excellent customer service skills',
        location: { city: 'New York', state: 'NY', country: 'USA' },
        badges: ['Pro', 'Rising Star'],
        ratingAvg: 4.7,
        totalRatings: 28,
        completedJobsCount: 15
      },
      {
        name: 'Emily Davis',
        email: 'worker2@eventflex.com',
        phone: '+1-555-0202',
        password: hashedPassword,
        role: 'worker',
        profileCompleted: true,
        bio: 'Reliable and punctual event professional',
        location: { city: 'New York', state: 'NY', country: 'USA' },
        badges: ['Verified'],
        ratingAvg: 4.9,
        totalRatings: 35,
        completedJobsCount: 22
      },
      {
        name: 'Michael Chen',
        email: 'worker3@eventflex.com',
        phone: '+1-555-0203',
        password: hashedPassword,
        role: 'worker',
        profileCompleted: true,
        bio: 'Tech-savvy event coordinator',
        location: { city: 'Brooklyn', state: 'NY', country: 'USA' },
        badges: ['Rising Star'],
        ratingAvg: 4.5,
        totalRatings: 12,
        completedJobsCount: 8
      }
    ]);

    const events = await Event.insertMany([
      {
        title: 'Tech Summit 2024',
        description: 'Annual technology conference featuring industry leaders',
        organizerId: organizer._id,
        eventType: 'conference',
        location: { address: '123 Convention Center, New York, NY', lat: 40.7128, lng: -74.0060 },
        dateStart: new Date('2024-03-15'),
        dateEnd: new Date('2024-03-17'),
        status: 'upcoming',
        attendees: { expectedCount: 500, registeredCount: 350 },
        tickets: { totalDispersed: 500, totalSold: 350, pricePerTicket: 299 }
      },
      {
        title: 'Summer Music Festival',
        description: 'Three-day outdoor music festival with top artists',
        organizerId: organizer._id,
        eventType: 'festival',
        location: { address: '456 Park Avenue, New York, NY', lat: 40.7589, lng: -73.9851 },
        dateStart: new Date('2024-06-20'),
        dateEnd: new Date('2024-06-22'),
        status: 'upcoming',
        attendees: { expectedCount: 2000, registeredCount: 1500 },
        tickets: { totalDispersed: 2000, totalSold: 1500, pricePerTicket: 150 }
      },
      {
        title: 'Corporate Gala Night',
        description: 'Elegant corporate networking event',
        organizerId: organizer._id,
        eventType: 'corporate',
        location: { address: '789 Grand Hotel, Manhattan, NY', lat: 40.7614, lng: -73.9776 },
        dateStart: new Date('2024-04-10'),
        dateEnd: new Date('2024-04-10'),
        status: 'upcoming',
        attendees: { expectedCount: 200, registeredCount: 180 },
        tickets: { totalDispersed: 200, totalSold: 180, pricePerTicket: 500 }
      }
    ]);

    const jobs = await Job.insertMany([
      {
        title: 'Event Registration Staff',
        description: 'Manage attendee check-in and registration desk',
        eventId: events[0]._id,
        organizerId: organizer._id,
        roles: ['Registration', 'Customer Service'],
        requiredSkills: ['Communication', 'Computer Skills'],
        dateStart: new Date('2024-03-15T08:00:00'),
        dateEnd: new Date('2024-03-17T18:00:00'),
        location: { city: 'New York', state: 'NY', address: '123 Convention Center' },
        payPerPerson: 25,
        totalPositions: 5,
        positionsFilled: 2,
        status: 'open'
      },
      {
        title: 'Stage Crew & Setup',
        description: 'Assist with stage setup, sound check, and equipment management',
        eventId: events[1]._id,
        organizerId: organizer._id,
        roles: ['Stage Crew', 'Technical Support'],
        requiredSkills: ['Physical Fitness', 'Technical Knowledge'],
        dateStart: new Date('2024-06-20T06:00:00'),
        dateEnd: new Date('2024-06-22T23:00:00'),
        location: { city: 'New York', state: 'NY', address: '456 Park Avenue' },
        payPerPerson: 30,
        totalPositions: 10,
        positionsFilled: 5,
        status: 'open'
      },
      {
        title: 'Catering & Hospitality Staff',
        description: 'Serve food and beverages, maintain dining area',
        eventId: events[2]._id,
        organizerId: organizer._id,
        roles: ['Catering', 'Hospitality'],
        requiredSkills: ['Customer Service', 'Food Handling'],
        dateStart: new Date('2024-04-10T17:00:00'),
        dateEnd: new Date('2024-04-10T23:00:00'),
        location: { city: 'Manhattan', state: 'NY', address: '789 Grand Hotel' },
        payPerPerson: 22,
        totalPositions: 8,
        positionsFilled: 3,
        status: 'open'
      },
      {
        title: 'Security & Crowd Control',
        description: 'Ensure safety and manage crowd flow',
        eventId: events[1]._id,
        organizerId: organizer._id,
        roles: ['Security', 'Safety'],
        requiredSkills: ['Security Training', 'Communication'],
        dateStart: new Date('2024-06-20T10:00:00'),
        dateEnd: new Date('2024-06-22T22:00:00'),
        location: { city: 'New York', state: 'NY', address: '456 Park Avenue' },
        payPerPerson: 28,
        totalPositions: 15,
        positionsFilled: 8,
        status: 'open'
      }
    ]);

    await Application.insertMany([
      {
        jobId: jobs[0]._id,
        proId: workers[0]._id,
        status: 'accepted',
        coverLetter: 'I have 3 years of experience in event registration and customer service.'
      },
      {
        jobId: jobs[0]._id,
        proId: workers[1]._id,
        status: 'pending',
        coverLetter: 'Excited to contribute to this amazing tech conference!'
      },
      {
        jobId: jobs[1]._id,
        proId: workers[0]._id,
        status: 'pending',
        coverLetter: 'I have experience with stage setup and technical equipment.'
      },
      {
        jobId: jobs[2]._id,
        proId: workers[1]._id,
        status: 'accepted',
        coverLetter: 'Professional hospitality background with 5 years experience.'
      },
      {
        jobId: jobs[2]._id,
        proId: workers[2]._id,
        status: 'declined',
        coverLetter: 'Looking forward to working at this corporate event.'
      },
      {
        jobId: jobs[3]._id,
        proId: workers[2]._id,
        status: 'pending',
        coverLetter: 'Certified security professional with crowd management experience.'
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Organizer: organizer@eventflex.com / password123');
    console.log('Worker 1: worker1@eventflex.com / password123');
    console.log('Worker 2: worker2@eventflex.com / password123');
    console.log('Worker 3: worker3@eventflex.com / password123');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

export default seedDatabase;
