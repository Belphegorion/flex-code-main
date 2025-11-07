import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Event from '../models/Event.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

const seedDatabase = async () => {
  try {
    await User.deleteMany({});
    await Profile.deleteMany({});
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
      ratingAvg: 4.8,
      totalRatings: 45
    });

    await Profile.create({
      userId: organizer._id,
      bio: 'Professional event organizer with 10+ years experience in corporate and tech events',
      location: { city: 'New York', state: 'NY', country: 'USA' },
      tagline: 'Elite Event Organizer | 10+ Years Experience',
      yearsOfExperience: 10
    });

    const workers = await User.insertMany([
      {
        name: 'John Smith',
        email: 'worker1@eventflex.com',
        phone: '+1-555-0201',
        password: hashedPassword,
        role: 'worker',
        profileCompleted: true,
        ratingAvg: 4.7,
        totalRatings: 28,
        completedJobsCount: 15,
        reliabilityScore: 0.95,
        noShowCount: 1
      },
      {
        name: 'Emily Davis',
        email: 'worker2@eventflex.com',
        phone: '+1-555-0202',
        password: hashedPassword,
        role: 'worker',
        profileCompleted: true,
        ratingAvg: 4.9,
        totalRatings: 35,
        completedJobsCount: 22,
        reliabilityScore: 1.0,
        noShowCount: 0
      },
      {
        name: 'Michael Chen',
        email: 'worker3@eventflex.com',
        phone: '+1-555-0203',
        password: hashedPassword,
        role: 'worker',
        profileCompleted: true,
        ratingAvg: 4.5,
        totalRatings: 12,
        completedJobsCount: 8,
        reliabilityScore: 0.88,
        noShowCount: 2
      },
      {
        name: 'Alex Rodriguez',
        email: 'worker4@eventflex.com',
        phone: '+1-555-0204',
        password: hashedPassword,
        role: 'worker',
        profileCompleted: true,
        ratingAvg: 4.8,
        totalRatings: 42,
        completedJobsCount: 30,
        reliabilityScore: 0.97,
        noShowCount: 1
      },
      {
        name: 'Lisa Wang',
        email: 'worker5@eventflex.com',
        phone: '+1-555-0205',
        password: hashedPassword,
        role: 'worker',
        profileCompleted: true,
        ratingAvg: 4.6,
        totalRatings: 18,
        completedJobsCount: 12,
        reliabilityScore: 0.92,
        noShowCount: 1
      }
    ]);

    await Profile.insertMany([
      {
        userId: workers[0]._id,
        bio: 'Experienced event staff with excellent customer service skills. Specialized in registration and attendee management.',
        location: { city: 'New York', state: 'NY', country: 'USA', zipCode: '10001' },
        tagline: 'Pro Event Staff | Customer Service Expert',
        skills: ['Customer Service', 'Registration', 'Communication', 'Problem Solving'],
        badges: ['Pro', 'Top Rated', 'Rising Star'],
        yearsOfExperience: 3,
        hourlyRate: 25,
        availability: 'flexible',
        languages: [{ language: 'English', proficiency: 'native' }, { language: 'Spanish', proficiency: 'conversational' }],
        socialLinks: { linkedin: 'https://linkedin.com/in/johnsmith' },
        preferences: { travelWillingness: 'local', remoteWork: false, teamSize: 'any' }
      },
      {
        userId: workers[1]._id,
        bio: 'Reliable and punctual event professional with hospitality background. 5+ years in catering and guest services.',
        location: { city: 'New York', state: 'NY', country: 'USA', zipCode: '10002' },
        tagline: 'Verified Hospitality Pro | 5+ Years Experience',
        skills: ['Hospitality', 'Catering', 'Food Service', 'Guest Relations', 'Time Management'],
        badges: ['Verified', 'Top Rated', 'Elite'],
        yearsOfExperience: 5,
        hourlyRate: 28,
        availability: 'full-time',
        languages: [{ language: 'English', proficiency: 'native' }, { language: 'French', proficiency: 'fluent' }],
        socialLinks: { linkedin: 'https://linkedin.com/in/emilydavis', portfolio: 'https://emilydavis.com' },
        preferences: { travelWillingness: 'regional', remoteWork: false, teamSize: 'medium' }
      },
      {
        userId: workers[2]._id,
        bio: 'Tech-savvy event coordinator with expertise in AV setup and technical support. Quick learner and problem solver.',
        location: { city: 'Brooklyn', state: 'NY', country: 'USA', zipCode: '11201' },
        tagline: 'Rising Star | Tech & AV Specialist',
        skills: ['Technical Support', 'AV Setup', 'Sound Systems', 'Troubleshooting'],
        badges: ['Rising Star', 'Tech Savvy'],
        yearsOfExperience: 2,
        hourlyRate: 30,
        availability: 'part-time',
        languages: [{ language: 'English', proficiency: 'native' }, { language: 'Mandarin', proficiency: 'native' }],
        socialLinks: { github: 'https://github.com/mchen', linkedin: 'https://linkedin.com/in/michaelchen' },
        preferences: { travelWillingness: 'local', remoteWork: true, teamSize: 'small' }
      },
      {
        userId: workers[3]._id,
        bio: 'Certified security professional with 7 years experience in crowd management and event safety. CPR and First Aid certified.',
        location: { city: 'Queens', state: 'NY', country: 'USA', zipCode: '11354' },
        tagline: 'Elite Security Pro | Certified & Experienced',
        skills: ['Security', 'Crowd Control', 'First Aid', 'Emergency Response', 'Communication'],
        badges: ['Elite', 'Verified', 'Top Rated', 'Safety Certified'],
        yearsOfExperience: 7,
        hourlyRate: 32,
        availability: 'flexible',
        languages: [{ language: 'English', proficiency: 'native' }, { language: 'Spanish', proficiency: 'fluent' }],
        socialLinks: { linkedin: 'https://linkedin.com/in/alexrodriguez' },
        preferences: { travelWillingness: 'national', remoteWork: false, teamSize: 'large' }
      },
      {
        userId: workers[4]._id,
        bio: 'Creative stage crew member with experience in concerts and festivals. Strong physical fitness and teamwork skills.',
        location: { city: 'Manhattan', state: 'NY', country: 'USA', zipCode: '10003' },
        tagline: 'Pro Stage Crew | Festival Specialist',
        skills: ['Stage Setup', 'Equipment Handling', 'Teamwork', 'Physical Fitness', 'Lighting'],
        badges: ['Pro', 'Rising Star'],
        yearsOfExperience: 3,
        hourlyRate: 27,
        availability: 'weekends',
        languages: [{ language: 'English', proficiency: 'native' }],
        socialLinks: { portfolio: 'https://lisawang.com' },
        preferences: { travelWillingness: 'regional', remoteWork: false, teamSize: 'medium' }
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
    console.log('\n📊 Seeded Data:');
    console.log('- 1 Organizer');
    console.log('- 5 Workers (with badges & complete profiles)');
    console.log('- 3 Events');
    console.log('- 4 Jobs');
    console.log('- 6 Applications');
    console.log('\n📧 Login Credentials:');
    console.log('Organizer: organizer@eventflex.com / password123');
    console.log('Worker 1: worker1@eventflex.com / password123 (Pro, Top Rated, Rising Star)');
    console.log('Worker 2: worker2@eventflex.com / password123 (Verified, Top Rated, Elite)');
    console.log('Worker 3: worker3@eventflex.com / password123 (Rising Star, Tech Savvy)');
    console.log('Worker 4: worker4@eventflex.com / password123 (Elite, Verified, Top Rated, Safety Certified)');
    console.log('Worker 5: worker5@eventflex.com / password123 (Pro, Rising Star)');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

export default seedDatabase;
