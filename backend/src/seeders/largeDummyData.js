import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Event from '../models/Event.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import GroupChat from '../models/GroupChat.js';
import CoOrganizer from '../models/CoOrganizer.js';

const badges = ['Elite', 'Verified', 'Top Rated', 'Pro', 'Rising Star', 'Tech Savvy', 'Safety Certified', 'Reliable', 'Fast Responder'];
const skills = ['Customer Service', 'Registration', 'Communication', 'Hospitality', 'Catering', 'Security', 'Technical Support', 'AV Setup', 'Stage Crew', 'Event Planning', 'Problem Solving', 'Time Management', 'First Aid', 'Crowd Control', 'Food Handling'];
const cities = ['New York', 'Brooklyn', 'Queens', 'Manhattan', 'Bronx', 'Staten Island'];

const generateWorker = (index) => {
  const rating = (3.5 + Math.random() * 1.5).toFixed(1);
  const jobsCompleted = Math.floor(Math.random() * 50) + 5;
  const reliability = (0.75 + Math.random() * 0.25).toFixed(2);
  
  return {
    name: `Worker ${index}`,
    email: `worker${index}@eventflex.com`,
    phone: `+1-555-${String(index).padStart(4, '0')}`,
    role: 'worker',
    profileCompleted: true,
    ratingAvg: parseFloat(rating),
    totalRatings: Math.floor(Math.random() * 50) + 10,
    completedJobsCount: jobsCompleted,
    reliabilityScore: parseFloat(reliability),
    noShowCount: Math.floor(Math.random() * 3)
  };
};

const generateProfile = (userId, index) => {
  const exp = Math.floor(Math.random() * 10) + 1;
  const selectedSkills = skills.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 3);
  const selectedBadges = badges.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
  
  return {
    userId,
    bio: `Professional event worker with ${exp} years of experience. Specialized in ${selectedSkills[0]} and ${selectedSkills[1]}.`,
    location: { city: cities[index % cities.length], state: 'NY', country: 'USA', zipCode: `1000${index % 9}` },
    tagline: `${selectedBadges[0]} Event Professional | ${exp}+ Years`,
    skills: selectedSkills,
    badges: selectedBadges,
    yearsOfExperience: exp,
    hourlyRate: 20 + Math.floor(Math.random() * 20),
    availability: ['full-time', 'part-time', 'weekends', 'flexible'][Math.floor(Math.random() * 4)],
    languages: [
      { language: 'English', proficiency: 'native' },
      ...(Math.random() > 0.5 ? [{ language: ['Spanish', 'French', 'Mandarin'][Math.floor(Math.random() * 3)], proficiency: ['conversational', 'fluent'][Math.floor(Math.random() * 2)] }] : [])
    ],
    preferences: {
      travelWillingness: ['local', 'regional', 'national'][Math.floor(Math.random() * 3)],
      remoteWork: Math.random() > 0.5,
      teamSize: ['small', 'medium', 'large', 'any'][Math.floor(Math.random() * 4)]
    }
  };
};

const seedDatabase = async () => {
  try {
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Event.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await GroupChat.deleteMany({});
    await CoOrganizer.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create 5 Organizers
    const organizers = await User.insertMany([
      { name: 'Syed Adnan', email: 'syedadnanmohd@gmail.com', phone: '+1-555-1001', password: hashedPassword, role: 'organizer', profileCompleted: true, ratingAvg: 4.8, totalRatings: 45 },
      { name: 'David Miller', email: 'organizer2@eventflex.com', phone: '+1-555-1002', password: hashedPassword, role: 'organizer', profileCompleted: true, ratingAvg: 4.6, totalRatings: 32 },
      { name: 'Jennifer Lee', email: 'organizer3@eventflex.com', phone: '+1-555-1003', password: hashedPassword, role: 'organizer', profileCompleted: true, ratingAvg: 4.9, totalRatings: 58 },
      { name: 'Robert Brown', email: 'organizer4@eventflex.com', phone: '+1-555-1004', password: hashedPassword, role: 'organizer', profileCompleted: true, ratingAvg: 4.7, totalRatings: 41 },
      { name: 'Maria Garcia', email: 'organizer5@eventflex.com', phone: '+1-555-1005', password: hashedPassword, role: 'organizer', profileCompleted: true, ratingAvg: 4.5, totalRatings: 28 }
    ]);

    await Profile.insertMany(organizers.map((org, i) => ({
      userId: org._id,
      bio: `Professional event organizer with ${8 + i} years experience`,
      location: { city: cities[i], state: 'NY', country: 'USA' },
      tagline: `Elite Event Organizer | ${8 + i}+ Years`,
      yearsOfExperience: 8 + i
    })));

    // Create 40 Workers
    const workerData = Array.from({ length: 40 }, (_, i) => ({ ...generateWorker(i + 1), password: hashedPassword }));
    const workers = await User.insertMany(workerData);
    await Profile.insertMany(workers.map((w, i) => generateProfile(w._id, i + 1)));

    // Create 10 Events
    const events = await Event.insertMany([
      { title: 'Tech Summit 2024', description: 'Annual technology conference', organizerId: organizers[0]._id, eventType: 'conference', location: { address: '123 Convention Center, NY', lat: 40.7128, lng: -74.0060 }, dateStart: new Date('2024-03-15'), dateEnd: new Date('2024-03-17'), status: 'upcoming', attendees: { expectedCount: 500, registeredCount: 350 }, tickets: { totalDispersed: 500, totalSold: 350, pricePerTicket: 299 } },
      { title: 'Summer Music Festival', description: 'Three-day outdoor music festival', organizerId: organizers[1]._id, eventType: 'festival', location: { address: '456 Park Ave, NY', lat: 40.7589, lng: -73.9851 }, dateStart: new Date('2024-06-20'), dateEnd: new Date('2024-06-22'), status: 'upcoming', attendees: { expectedCount: 2000, registeredCount: 1500 }, tickets: { totalDispersed: 2000, totalSold: 1500, pricePerTicket: 150 } },
      { title: 'Corporate Gala Night', description: 'Elegant corporate networking event', organizerId: organizers[2]._id, eventType: 'corporate', location: { address: '789 Grand Hotel, Manhattan', lat: 40.7614, lng: -73.9776 }, dateStart: new Date('2024-04-10T18:00:00'), dateEnd: new Date('2024-04-10T23:00:00'), status: 'upcoming', attendees: { expectedCount: 200, registeredCount: 180 }, tickets: { totalDispersed: 200, totalSold: 180, pricePerTicket: 500 } },
      { title: 'Food & Wine Expo', description: 'Culinary showcase event', organizerId: organizers[3]._id, eventType: 'exhibition', location: { address: '321 Expo Center, Brooklyn', lat: 40.6782, lng: -73.9442 }, dateStart: new Date('2024-05-05'), dateEnd: new Date('2024-05-07'), status: 'upcoming', attendees: { expectedCount: 800, registeredCount: 600 }, tickets: { totalDispersed: 800, totalSold: 600, pricePerTicket: 75 } },
      { title: 'Charity Marathon', description: 'Annual charity running event', organizerId: organizers[4]._id, eventType: 'sports', location: { address: '555 Central Park, NY', lat: 40.7829, lng: -73.9654 }, dateStart: new Date('2024-09-15T07:00:00'), dateEnd: new Date('2024-09-15T14:00:00'), status: 'upcoming', attendees: { expectedCount: 1000, registeredCount: 850 }, tickets: { totalDispersed: 1000, totalSold: 850, pricePerTicket: 50 } },
      { title: 'Art Gallery Opening', description: 'Contemporary art exhibition', organizerId: organizers[0]._id, eventType: 'exhibition', location: { address: '888 Gallery St, Manhattan', lat: 40.7580, lng: -73.9855 }, dateStart: new Date('2024-07-12T18:00:00'), dateEnd: new Date('2024-07-12T22:00:00'), status: 'upcoming', attendees: { expectedCount: 150, registeredCount: 120 }, tickets: { totalDispersed: 150, totalSold: 120, pricePerTicket: 100 } },
      { title: 'Business Conference', description: 'Leadership and innovation summit', organizerId: organizers[1]._id, eventType: 'conference', location: { address: '999 Business Center, NY', lat: 40.7489, lng: -73.9680 }, dateStart: new Date('2024-08-20'), dateEnd: new Date('2024-08-22'), status: 'upcoming', attendees: { expectedCount: 400, registeredCount: 320 }, tickets: { totalDispersed: 400, totalSold: 320, pricePerTicket: 399 } },
      { title: 'Holiday Market', description: 'Seasonal shopping and entertainment', organizerId: organizers[2]._id, eventType: 'festival', location: { address: '111 Market Square, Queens', lat: 40.7282, lng: -73.7949 }, dateStart: new Date('2024-12-10'), dateEnd: new Date('2024-12-24'), status: 'upcoming', attendees: { expectedCount: 3000, registeredCount: 2500 }, tickets: { totalDispersed: 3000, totalSold: 2500, pricePerTicket: 0 } },
      { title: 'Fashion Week Show', description: 'Designer runway presentations', organizerId: organizers[3]._id, eventType: 'exhibition', location: { address: '222 Fashion Ave, Manhattan', lat: 40.7549, lng: -73.9840 }, dateStart: new Date('2024-10-05'), dateEnd: new Date('2024-10-08'), status: 'upcoming', attendees: { expectedCount: 600, registeredCount: 550 }, tickets: { totalDispersed: 600, totalSold: 550, pricePerTicket: 250 } },
      { title: 'Comedy Night Live', description: 'Stand-up comedy showcase', organizerId: organizers[4]._id, eventType: 'other', location: { address: '333 Comedy Club, Brooklyn', lat: 40.6501, lng: -73.9496 }, dateStart: new Date('2024-11-18T19:00:00'), dateEnd: new Date('2024-11-18T23:00:00'), status: 'upcoming', attendees: { expectedCount: 250, registeredCount: 200 }, tickets: { totalDispersed: 250, totalSold: 200, pricePerTicket: 45 } }
    ]);

    // Create Co-Organizers (elevate some workers)
    const coOrganizers = await CoOrganizer.insertMany([
      { eventId: events[0]._id, userId: workers[0]._id, addedBy: organizers[0]._id, permissions: { canHireWorkers: true, canManageJobs: true, canViewFinancials: false, canEditEvent: false }, elevatedFrom: 'worker' },
      { eventId: events[1]._id, userId: workers[1]._id, addedBy: organizers[1]._id, permissions: { canHireWorkers: true, canManageJobs: true, canViewFinancials: true, canEditEvent: false }, elevatedFrom: 'worker' },
      { eventId: events[2]._id, userId: workers[2]._id, addedBy: organizers[2]._id, permissions: { canHireWorkers: true, canManageJobs: false, canViewFinancials: false, canEditEvent: false }, elevatedFrom: 'worker' }
    ]);

    // Create 20 Jobs with multiple positions
    const jobs = await Job.insertMany([
      { title: 'Event Registration Staff', description: 'Manage attendee check-in', eventId: events[0]._id, organizerId: organizers[0]._id, roles: ['Registration'], requiredSkills: ['Communication', 'Customer Service'], dateStart: new Date('2024-03-15T08:00:00'), dateEnd: new Date('2024-03-17T18:00:00'), location: { city: 'New York', state: 'NY' }, payPerPerson: 25, totalPositions: 10, positionsFilled: 8, status: 'open' },
      { title: 'Stage Crew & Setup', description: 'Stage setup and equipment', eventId: events[1]._id, organizerId: organizers[1]._id, roles: ['Stage Crew'], requiredSkills: ['Technical Support'], dateStart: new Date('2024-06-20T06:00:00'), dateEnd: new Date('2024-06-22T23:00:00'), location: { city: 'New York', state: 'NY' }, payPerPerson: 30, totalPositions: 15, positionsFilled: 12, status: 'open' },
      { title: 'Catering Staff', description: 'Food and beverage service', eventId: events[2]._id, organizerId: organizers[2]._id, roles: ['Catering'], requiredSkills: ['Hospitality', 'Food Handling'], dateStart: new Date('2024-04-10T17:00:00'), dateEnd: new Date('2024-04-10T23:00:00'), location: { city: 'Manhattan', state: 'NY' }, payPerPerson: 22, totalPositions: 12, positionsFilled: 10, status: 'open' },
      { title: 'Security Personnel', description: 'Event security and safety', eventId: events[1]._id, organizerId: organizers[1]._id, roles: ['Security'], requiredSkills: ['Security', 'Crowd Control'], dateStart: new Date('2024-06-20T10:00:00'), dateEnd: new Date('2024-06-22T22:00:00'), location: { city: 'New York', state: 'NY' }, payPerPerson: 28, totalPositions: 20, positionsFilled: 18, status: 'open' },
      { title: 'Booth Attendants', description: 'Manage expo booths', eventId: events[3]._id, organizerId: organizers[3]._id, roles: ['Customer Service'], requiredSkills: ['Communication'], dateStart: new Date('2024-05-05T09:00:00'), dateEnd: new Date('2024-05-07T18:00:00'), location: { city: 'Brooklyn', state: 'NY' }, payPerPerson: 24, totalPositions: 25, positionsFilled: 20, status: 'open' },
      { title: 'Water Station Volunteers', description: 'Hydration support', eventId: events[4]._id, organizerId: organizers[4]._id, roles: ['Support'], requiredSkills: ['Customer Service'], dateStart: new Date('2024-09-15T06:00:00'), dateEnd: new Date('2024-09-15T14:00:00'), location: { city: 'New York', state: 'NY' }, payPerPerson: 18, totalPositions: 30, positionsFilled: 25, status: 'open' },
      { title: 'Gallery Guides', description: 'Art exhibition guides', eventId: events[5]._id, organizerId: organizers[0]._id, roles: ['Guide'], requiredSkills: ['Communication'], dateStart: new Date('2024-07-12T18:00:00'), dateEnd: new Date('2024-07-12T22:00:00'), location: { city: 'Manhattan', state: 'NY' }, payPerPerson: 26, totalPositions: 8, positionsFilled: 6, status: 'open' },
      { title: 'Conference Coordinators', description: 'Session management', eventId: events[6]._id, organizerId: organizers[1]._id, roles: ['Coordination'], requiredSkills: ['Event Planning', 'Time Management'], dateStart: new Date('2024-08-20T08:00:00'), dateEnd: new Date('2024-08-22T17:00:00'), location: { city: 'New York', state: 'NY' }, payPerPerson: 32, totalPositions: 12, positionsFilled: 10, status: 'open' },
      { title: 'Market Vendors Support', description: 'Vendor assistance', eventId: events[7]._id, organizerId: organizers[2]._id, roles: ['Support'], requiredSkills: ['Customer Service', 'Problem Solving'], dateStart: new Date('2024-12-10T10:00:00'), dateEnd: new Date('2024-12-24T20:00:00'), location: { city: 'Queens', state: 'NY' }, payPerPerson: 20, totalPositions: 40, positionsFilled: 35, status: 'open' },
      { title: 'Runway Assistants', description: 'Fashion show support', eventId: events[8]._id, organizerId: organizers[3]._id, roles: ['Assistant'], requiredSkills: ['Time Management'], dateStart: new Date('2024-10-05T14:00:00'), dateEnd: new Date('2024-10-08T22:00:00'), location: { city: 'Manhattan', state: 'NY' }, payPerPerson: 35, totalPositions: 10, positionsFilled: 8, status: 'open' },
      { title: 'Ushers & Seating', description: 'Audience management', eventId: events[9]._id, organizerId: organizers[4]._id, roles: ['Usher'], requiredSkills: ['Customer Service', 'Communication'], dateStart: new Date('2024-11-18T18:00:00'), dateEnd: new Date('2024-11-18T23:00:00'), location: { city: 'Brooklyn', state: 'NY' }, payPerPerson: 21, totalPositions: 6, positionsFilled: 5, status: 'open' },
      { title: 'AV Technicians', description: 'Audio visual support', eventId: events[0]._id, organizerId: organizers[0]._id, roles: ['Technical'], requiredSkills: ['AV Setup', 'Technical Support'], dateStart: new Date('2024-03-15T07:00:00'), dateEnd: new Date('2024-03-17T19:00:00'), location: { city: 'New York', state: 'NY' }, payPerPerson: 40, totalPositions: 8, positionsFilled: 7, status: 'open' },
      { title: 'Parking Attendants', description: 'Parking management', eventId: events[1]._id, organizerId: organizers[1]._id, roles: ['Parking'], requiredSkills: ['Customer Service'], dateStart: new Date('2024-06-20T08:00:00'), dateEnd: new Date('2024-06-22T23:00:00'), location: { city: 'New York', state: 'NY' }, payPerPerson: 19, totalPositions: 15, positionsFilled: 12, status: 'open' },
      { title: 'Coat Check Staff', description: 'Coat check service', eventId: events[2]._id, organizerId: organizers[2]._id, roles: ['Service'], requiredSkills: ['Customer Service'], dateStart: new Date('2024-04-10T17:00:00'), dateEnd: new Date('2024-04-10T23:00:00'), location: { city: 'Manhattan', state: 'NY' }, payPerPerson: 20, totalPositions: 4, positionsFilled: 4, status: 'in-progress' },
      { title: 'Cleanup Crew', description: 'Post-event cleanup', eventId: events[3]._id, organizerId: organizers[3]._id, roles: ['Cleanup'], requiredSkills: ['Time Management'], dateStart: new Date('2024-05-07T18:00:00'), dateEnd: new Date('2024-05-07T22:00:00'), location: { city: 'Brooklyn', state: 'NY' }, payPerPerson: 22, totalPositions: 20, positionsFilled: 15, status: 'open' },
      { title: 'Medical Support', description: 'First aid stations', eventId: events[4]._id, organizerId: organizers[4]._id, roles: ['Medical'], requiredSkills: ['First Aid'], dateStart: new Date('2024-09-15T06:00:00'), dateEnd: new Date('2024-09-15T14:00:00'), location: { city: 'New York', state: 'NY' }, payPerPerson: 45, totalPositions: 10, positionsFilled: 10, status: 'in-progress' },
      { title: 'Photography Assistants', description: 'Event photography support', eventId: events[5]._id, organizerId: organizers[0]._id, roles: ['Photography'], requiredSkills: ['Technical Support'], dateStart: new Date('2024-07-12T17:00:00'), dateEnd: new Date('2024-07-12T23:00:00'), location: { city: 'Manhattan', state: 'NY' }, payPerPerson: 38, totalPositions: 3, positionsFilled: 3, status: 'in-progress' },
      { title: 'Registration Desk', description: 'Conference registration', eventId: events[6]._id, organizerId: organizers[1]._id, roles: ['Registration'], requiredSkills: ['Communication'], dateStart: new Date('2024-08-20T07:00:00'), dateEnd: new Date('2024-08-22T18:00:00'), location: { city: 'New York', state: 'NY' }, payPerPerson: 27, totalPositions: 10, positionsFilled: 8, status: 'open' },
      { title: 'Entertainment Coordinators', description: 'Manage performers', eventId: events[7]._id, organizerId: organizers[2]._id, roles: ['Coordination'], requiredSkills: ['Event Planning', 'Communication'], dateStart: new Date('2024-12-10T10:00:00'), dateEnd: new Date('2024-12-24T20:00:00'), location: { city: 'Queens', state: 'NY' }, payPerPerson: 30, totalPositions: 8, positionsFilled: 6, status: 'open' },
      { title: 'Backstage Crew', description: 'Backstage management', eventId: events[8]._id, organizerId: organizers[3]._id, roles: ['Backstage'], requiredSkills: ['Time Management', 'Problem Solving'], dateStart: new Date('2024-10-05T12:00:00'), dateEnd: new Date('2024-10-08T23:00:00'), location: { city: 'Manhattan', state: 'NY' }, payPerPerson: 33, totalPositions: 12, positionsFilled: 10, status: 'open' }
    ]);

    // Create Applications (distribute workers across jobs)
    const applications = [];
    jobs.forEach((job, jobIndex) => {
      const numApplicants = Math.min(job.totalPositions + 5, 15);
      for (let i = 0; i < numApplicants; i++) {
        const workerIndex = (jobIndex * 2 + i) % workers.length;
        const statuses = ['pending', 'accepted', 'declined'];
        const status = i < job.positionsFilled ? 'accepted' : (i < job.positionsFilled + 3 ? 'pending' : 'declined');
        applications.push({
          jobId: job._id,
          proId: workers[workerIndex]._id,
          status,
          coverLetter: `I'm interested in the ${job.title} position. I have relevant experience and skills.`
        });
      }
    });
    await Application.insertMany(applications);

    // Create Group Chats with Messages
    const groupChats = [];
    for (let i = 0; i < 5; i++) {
      const acceptedApps = applications.filter(app => app.jobId.equals(jobs[i]._id) && app.status === 'accepted');
      const participants = [organizers[i]._id, ...acceptedApps.map(app => app.proId)];
      
      groupChats.push({
        name: `${events[i].title} - Team Chat`,
        eventId: events[i]._id,
        groupType: 'worker',
        participants,
        createdBy: organizers[i]._id,
        messages: [
          { senderId: organizers[i]._id, text: `Welcome to ${events[i].title} team! Excited to work with you all.`, type: 'text', createdAt: new Date(Date.now() - 86400000 * 2) },
          { senderId: acceptedApps[0]?.proId, text: 'Thanks for having me! Looking forward to the event.', type: 'text', createdAt: new Date(Date.now() - 86400000 * 2 + 3600000) },
          { senderId: acceptedApps[1]?.proId, text: 'What time should we arrive for setup?', type: 'text', createdAt: new Date(Date.now() - 86400000 * 1) },
          { senderId: organizers[i]._id, text: 'Please arrive 2 hours before the event start time.', type: 'text', createdAt: new Date(Date.now() - 86400000 * 1 + 1800000) },
          { senderId: acceptedApps[2]?.proId, text: 'Got it! See you all there.', type: 'text', createdAt: new Date(Date.now() - 3600000) }
        ],
        lastMessage: 'Got it! See you all there.',
        lastMessageAt: new Date(Date.now() - 3600000),
        isActive: true
      });
    }
    await GroupChat.insertMany(groupChats);

    console.log('✅ Large database seeded successfully!');
    console.log('\n📊 Seeded Data:');
    console.log('- 5 Organizers');
    console.log('- 40 Workers (with complete profiles & badges)');
    console.log('- 3 Co-Organizers');
    console.log('- 10 Events');
    console.log('- 20 Jobs (with multiple positions)');
    console.log(`- ${applications.length} Applications`);
    console.log('- 5 Group Chats (with messages)');
    console.log('\n🔑 Login Credentials:');
    console.log('Main Organizer: syedadnanmohd@gmail.com / password123');
    console.log('Other Organizers: organizer2-5@eventflex.com / password123');
    console.log('Workers: worker1-40@eventflex.com / password123');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

export default seedDatabase;
