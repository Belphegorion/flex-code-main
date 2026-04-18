# EVENTFLEX — Project Analysis

## 📋 Project Overview

**EventFlex** is a comprehensive event workforce management platform built with modern full-stack technologies. It enables event organizers, workers, sponsors, and workers to collaborate, manage events, post jobs, and handle payments seamlessly.

**Status:** Multi-tier web and mobile application with Docker containerization
**Version:** 1.0.0
**Architecture:** Microservices-ready with Node.js backend, React frontend, React Native mobile, and containerized databases

---

## 🏗️ Project Architecture

```
EventFlex Platform
├── Backend (Node.js/Express)
│   ├── REST API (port 4000)
│   ├── WebSocket (Socket.io)
│   └── Scheduled Jobs (node-cron)
├── Frontend (React/Vite)
│   ├── Web UI (port 3000)
│   └── Nginx reverse proxy
├── Mobile (React Native/Expo)
│   └── Cross-platform (iOS/Android/Web)
├── Databases
│   ├── MongoDB (port 27017) - Primary data store
│   └── Redis (port 6379) - Caching & Bull queues
└── Docker Compose Orchestration
```

---

## 📦 Tech Stack

### Backend
- **Runtime:** Node.js 18-Alpine (Docker)
- **Framework:** Express.js v4.19.2
- **ODM:** Mongoose v8.19.1
- **Authentication:** JWT (jsonwebtoken v9.0.2)
- **Password:** bcryptjs v3.0.2 + bcrypt v6.0.0
- **Caching & Queues:** Redis v5.8.3 + ioredis v5.8.2 + Bull v4.16.5
- **File Storage:** Cloudinary v2.7.0
- **Payments:** Stripe v19.1.0
- **Email:** Nodemailer v7.0.9
- **QR Codes:** qrcode v1.5.4
- **Logging:** Winston v3.18.3 + Morgan v1.10.0
- **Security:** Helmet v7.1.0, CORS v2.8.5, express-rate-limit v7.5.1
- **Scheduled Tasks:** node-cron v4.2.1

### Frontend
- **Framework:** React v19.2.0 with Vite
- **Styling:** Tailwind CSS v3.4.1 + Radix UI components
- **Routing:** React Router v7.9.4
- **HTTP:** Axios v1.12.2
- **Real-time:** Socket.io-client v4.8.1
- **Maps:** Leaflet v1.9.4 + react-leaflet v5.0.0
- **Charts:** Recharts v3.3.0
- **UI Animations:** Framer Motion v12.23.24
- **QR Reader:** html5-qrcode v2.3.8
- **Icons:** Lucide React v0.553.0

### Mobile
- **Framework:** React Native v0.81.5 with Expo v54.0.33
- **Navigation:** React Navigation v7.x
- **Storage:** AsyncStorage v3.0.2
- **Camera/Barcode:** Expo Camera & Barcode Scanner
- **Push Notifications:** Expo Notifications
- **UI:** React Native Vector Icons

### Infrastructure
- **Container:** Docker (multi-stage builds, Alpine Linux)
- **Orchestration:** Docker Compose v5.0.0
- **Web Server:** Nginx (Alpine)
- **Database:** MongoDB v7
- **Cache:** Redis v7-Alpine

---

## 📊 Database Models

### Core Entities
1. **User** - Base user model with role-based fields
   - Fields: email, password, role (worker/organizer/sponsor), profile references
   - Indexes: email (unique), role-based queries

2. **Profile** - Extended user information
   - Fields: bio, skills, certifications, ratings, experience level
   - Links to: User, Reviews, Applications

3. **Job** - Job postings by organizers
   - Fields: title, description, requiredSkills, location, compensation
   - Text indexes: title, description, requiredSkills
   - Links to: Applications, Reviews, Event

4. **Event** - Events created by organizers
   - Fields: name, date, location, budget, eventJobs
   - Links to: EventWorkers, EventJobs, Sponsors

5. **Application** - Worker applications for jobs
   - Fields: jobId, workerId, status (pending/accepted/rejected)
   - Links to: Job, Profile, Offer

6. **Review** - Ratings and feedback
   - Fields: rating (1-5), comment, reviewer, reviewee
   - Links to: Job, Profile

7. **Chat/Messages** - Real-time communication
   - Fields: participants, messages, timestamp
   - Collections: DirectMessage, Message (groups), Chat

8. **Transaction** - Payment tracking
   - Fields: amount, status, method, transactionId
   - Links to: Job, Event, User

9. **WorkSession** - Time tracking for workers
   - Fields: startTime, endTime, status, workerId, eventId
   - Links to: Event, User, Timesheet

10. **Notification** - User alerts
    - Fields: type, message, read status, recipient
    - Links to: User

11. **Sponsor** - Sponsor information for events
    - Fields: company, industry, sponsorshipLevel
    - Links to: Event

12. **WorkSchedule** - Event scheduling
    - Fields: eventId, shifts, workers assigned
    - Links to: Event, User

---

## 🛣️ API Route Structure

### Authentication (`/api/auth`)
- POST `/register` — User registration
- POST `/login` — User login
- POST `/refresh` — Refresh access token
- GET `/profile` — Get current user (protected)

### Jobs (`/api/jobs`)
- GET `/` — List organizer's jobs
- POST `/` — Create job (Organizer only)
- GET `/:id` — Job details
- PUT `/:id` — Update job
- DELETE `/:id` — Delete job
- GET `/discover` — Browse public jobs (Worker)

### Events (`/api/events`)
- GET `/` — List events (Organizer)
- POST `/` — Create event
- GET `/:id` — Event details
- PUT `/:id` — Update event
- DELETE `/:id` — Delete event

### Applications (`/api/applications`)
- GET `/` — Get applications
- POST `/` — Apply for job
- PUT `/:id/accept` — Accept application
- PUT `/:id/reject` — Reject application

### Profiles (`/api/profiles`)
- GET `/` — Get profiles
- GET `/:id` — Profile details
- PUT `/` — Update profile
- GET `/search` — Search workers

### Chat (`/api/chat`)
- GET `/messages` — Get conversation
- POST `/messages` — Send message
- GET `/conversations` — List chats
- Socket events for real-time updates

### Reviews (`/api/reviews`)
- POST `/` — Create review
- GET `/:id` — Get reviews
- PUT `/:id` — Update review

### Events Workers (`/api/eventWorkers`)
- GET `/` — List event workers
- POST `/assign` — Assign worker to event
- PUT `/:id` — Update assignment

### Work Schedule (`/api/workSchedule`)
- GET `/` — Get schedule
- POST `/` — Create shift
- PUT `/:id` — Update shift

### Analytics (`/api/analytics`)
- GET `/dashboard` — Dashboard metrics
- GET `/revenue` — Revenue reports
- GET `/workers` — Worker statistics

### Admin (`/api/admin`)
- GET `/users` — Manage users
- GET `/jobs` — Manage jobs
- DELETE `/:resource/:id` — Delete resource

### Sponsors (`/api/sponsors`)
- GET `/` — List sponsors
- POST `/` — Create sponsor
- PUT `/:id` — Update sponsor

### Groups (`/api/groups`)
- GET `/` — List groups
- POST `/` — Create group
- PUT `/:id` — Update group

### Badges (`/api/badges`)
- GET `/` — List badges
- POST `/assign` — Assign badge to user

### Documents (`/api/documents`)
- GET `/` — List documents
- POST `/` — Upload document
- DELETE `/:id` — Delete document

---

## 🔐 Security Features

1. **Authentication**
   - JWT tokens with expiration (1h access, 7d refresh)
   - Password hashing with bcryptjs (rounds: 10)
   - Separate JWT_SECRET and JWT_REFRESH_SECRET

2. **Authorization**
   - Role-based access control (worker/organizer/sponsor/admin)
   - Middleware-based route protection

3. **Input Validation**
   - express-validator for schema validation
   - MongoDB sanitization (express-mongo-sanitize)
   - Custom sanitizer middleware

4. **Rate Limiting**
   - express-rate-limit on API endpoints
   - Configurable per route

5. **HTTP Headers**
   - Helmet.js for security headers
   - Custom CORS configuration
   - HTTPS in production (CORS_ORIGIN = https://yourdomain.com)

6. **Data Protection**
   - Password requirements: 8+ chars, uppercase, lowercase, number
   - Sensitive fields excluded from responses
   - Audit logging for critical actions

---

## 🔄 Key Features & Workflows

### 1. User Registration & Authentication
- Three user types: Worker, Organizer, Sponsor
- Role-specific profile setup (`/api/profileSetup`)
- Email validation
- Password complexity enforcement
- JWT token generation and refresh

### 2. Event Management
- Create and manage events
- Assign co-organizers
- Add sponsors to events
- Track event financials
- QR code generation for check-in

### 3. Job Management
- Post jobs (title, skills, compensation, location)
- Worker job discovery with filtering
- Application tracking
- Job offers and acceptance workflow
- Job completion and payment

### 4. Worker Management
- Worker profiles with skills/certifications
- Application history
- Time tracking (WorkSession)
- Work schedules and shifts
- Badge/achievement system
- Worker directory/search

### 5. Real-time Communication
- Direct messaging (Socket.io)
- Group chat for events
- Notifications system
- Message persistence in MongoDB

### 6. Payments & Escrow
- Stripe integration for payments
- Escrow system for job payments
- Transaction tracking
- Payment history and reporting

### 7. Reviews & Ratings
- Workers rate organizers and jobs
- Organizers rate workers
- Reputation system
- Public review visibility

### 8. Admin Panel
- User management
- Job/Event moderation
- Analytics dashboard
- System-wide statistics
- Audit logs

---

## 🎯 Frontend Pages & Components

### Authentication Pages
- `Login.jsx` — User login
- `Signup.jsx` — User registration
- `ProfileSetup.jsx` — Initial profile configuration
- `ProfileEdit.jsx` — Edit user profile
- `ProfileView.jsx` — View user profile

### Worker Pages
- `JobDiscover.jsx` — Browse available jobs
- `JobDetails.jsx` — Apply for jobs
- `WorkerDashboard.jsx` — Worker overview
- `WorkHours.jsx` — Time tracking
- `WorkQR.jsx` — QR code check-in
- `Leaderboard.jsx` — Worker rankings

### Organizer Pages
- `EventCreate.jsx` — Create new event
- `EventDetails.jsx` — View event
- `EventEdit.jsx` — Edit event
- `EventManagement.jsx` — Manage events
- `EventFinancials.jsx` — Event budget/payments
- `EventJobCreate.jsx` — Post job for event
- `OrganizerDashboard.jsx` — Organizer overview
- `JobApplicants.jsx` — View job applications

### Admin Pages
- `AdminDashboard.jsx` — System overview
- `Attendance.jsx` — Track attendance

### Sponsor Pages
- `SponsorDashboard.jsx` — Sponsor overview
- `SponsorEvents.jsx` — Sponsored events

### General Pages
- `Home.jsx` — Landing page
- `EventsHero.jsx` — Events showcase
- `JobsLanding.jsx` — Jobs showcase
- `Groups.jsx` — Group management
- `GroupChat.jsx` — Group conversations
- `CostEstimator.jsx` — Event budget calculator
- `UiShowcase.jsx` — Component library

### Major Components
- **Auth:** LoginForm, SignupForm, ProtectedRoute
- **Events:** EventCard, EventForm, EventList, EventStats
- **Jobs:** JobCard, JobForm, JobList, JobFilter, ApplicationCard
- **Chat:** ChatWindow, MessageList, ChatList
- **Work:** TimesheetForm, QRScanner, WorkSessionTracker
- **Common:** Navbar, Footer, Sidebar, Header
- **UI:** Buttons, Cards, Modals, Tabs, Accordions

---

## 🧠 Context & State Management

### Context Providers
1. **AuthContext** — User authentication state, login/logout
2. **JobContext** — Job listings, filters, applications
3. **ChatContext** — Messages, conversations, socket connection
4. **ThemeContext** — Dark/light mode, UI preferences

### Custom Hooks
- `useAuth()` — Access auth state and methods
- `useChat()` — Access chat state and methods
- `useJobs()` — Access job state and methods
- `useTheme()` — Access theme state and methods
- `useGeolocation()` — Get user location for job filtering

---

## 🔧 Backend Configuration

### Environment Variables (Required)
```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb://mongo:27017/eventflex
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=https://yourdomain.com
```

### Optional Environment Variables
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_key
```

### Middleware Stack
1. **Morgan** — HTTP request logging
2. **Helmet** — Security headers
3. **CORS** — Cross-origin resource sharing
4. **Compression** — Response compression
5. **express-json** — JSON body parser
6. **express-urlencoded** — URL-encoded body parser
7. **Sanitizer** — Input sanitization
8. **Express Validator** — Request validation
9. **Rate Limiter** — API rate limiting
10. **Error Handler** — Centralized error handling

### Background Jobs (Bull Queues)
- Email sending
- Notification processing
- Image optimization
- Report generation
- Scheduled tasks (cron)

---

## 📱 Mobile App Structure

### Screens
- **Auth:** LoginScreen, SignupScreen, ProfileSetupScreen
- **Worker:** JobDiscoverScreen, ApplicationsScreen, TimesheetScreen, WorkerDashboardScreen
- **Organizer:** EventCreateScreen, JobPostScreen, OrganizerDashboardScreen
- **Chat:** ChatListScreen, ChatDetailScreen
- **QR:** QRScannerScreen, AttendanceScreen
- **Profile:** ProfileViewScreen, ProfileEditScreen

### Navigation
- Bottom tab navigation (home, jobs, chat, profile)
- Stack navigation for screens
- Nested navigation for flows

### Services
- API service (axios instance)
- Socket.io connection for real-time features
- AsyncStorage for local persistence

---

## 🐳 Docker Configuration

### Multi-stage Builds
- **Backend:** deps stage + runner stage (optimized for production)
- **Frontend:** builder stage + nginx stage

### Services in docker-compose.yml
1. **backend** — Node.js app on port 4000
   - Depends on: mongo (healthy), redis (started)
   - Volume: None (stateless)
   - Build context: ./backend

2. **frontend** — Nginx on port 3000
   - Depends on: None (serves static files)
   - Volume: None (built into image)
   - Build context: ./frontend

3. **mongo** — MongoDB v7 on port 27017
   - Healthcheck: mongosh ping command
   - Volume: mongo_data (persistent)
   - Init database: eventflex

4. **redis** — Redis v7-Alpine on port 6379
   - Volume: redis_data (persistent)
   - No password (internal network only)

### Volume Management
- `mongo_data` — MongoDB documents
- `redis_data` — Redis cache/queue data

### Network
- All services connected via bridge network (flex-code-main_default)
- Internal DNS: hostname resolution via service names

---

## ⚠️ Known Issues & Fixes

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Backend container exits (code 1) | Missing JWT_SECRET, JWT_REFRESH_SECRET | Add these to `.env` file |
| Registration 500 error | Sponsor model has required nested fields | Fixed: made nested fields optional |
| Login 401 error | Double password hashing (controller + model) | Fixed: removed controller hash, use model only |
| Password mismatch | Mixed bcryptjs ↔ bcrypt libraries | Fixed: use bcryptjs consistently in model |
| Redis connection fails | lazyConnect: true not triggered | Fixed: removed lazy connection |
| Bull queue dies | Using host/port instead of REDIS_URL | Fixed: use REDIS_URL env var |
| Frontend password validation | Frontend allows 6 chars, backend requires 8+ | Fixed: frontend now enforces 8 minimum |
| MongoDB job text index | Conflicting indexes (old: roles, new: requiredSkills) | Fixed: drop old index, rebuild |

---

## 📋 MongoDB Indexes

### Users Collection
- email (unique)
- role
- createdAt

### Jobs Collection
- title, description, requiredSkills (text indexes for search)
- organizerId
- status
- createdAt

### Events Collection
- organizerId
- status
- eventDate
- createdAt

### Applications Collection
- workerId
- jobId
- status
- createdAt

### Reviews Collection
- targetId (worker/organizer)
- reviewerId
- createdAt

### Transactions Collection
- userId
- jobId
- status
- createdAt

### WorkSessions Collection
- workerId
- eventId
- date

---

## 🚀 Deployment Readiness

### Production Checklist
- [ ] Environment variables configured (.env file)
- [ ] JWT secrets changed to random strong values
- [ ] Cloudinary credentials added
- [ ] Stripe API key configured
- [ ] CORS_ORIGIN updated to production domain
- [ ] MongoDB backups configured
- [ ] Redis persistence enabled
- [ ] Email/Nodemailer configured for production
- [ ] SSL/TLS certificates installed
- [ ] Docker images built and pushed to registry
- [ ] Docker Compose secrets management implemented
- [ ] Monitoring and logging configured
- [ ] Rate limiting tested
- [ ] Database indexes verified

### Scalability Considerations
1. **Database:**
   - Add read replicas for MongoDB
   - Consider sharding for large datasets
   - Implement connection pooling

2. **Cache:**
   - Redis cluster for high availability
   - Implement cache invalidation strategy

3. **Backend:**
   - Load balancing (Nginx or HAProxy)
   - Horizontal scaling with container orchestration (Kubernetes)
   - API rate limiting per user

4. **Frontend:**
   - CDN for static assets
   - Image optimization with Cloudinary
   - Service Worker for offline support

5. **Real-time:**
   - Socket.io adapter for distributed systems
   - Message queue for cross-server communication

---

## 📊 Project Statistics

**Backend:**
- 20 route files with comprehensive API coverage
- 18 controller files with business logic
- 18 database models and entities
- Middleware for auth, validation, error handling
- Services for business logic separation
- Utilities for scheduling, logging, auditing

**Frontend:**
- 25+ pages covering all major features
- 30+ reusable components (UI, auth, events, jobs, chat, work)
- 5 context providers for state management
- 5 custom hooks for business logic

**Mobile:**
- React Native app with Expo
- Cross-platform support (iOS, Android, Web)
- Navigation with React Navigation

**Total Lines of Code:** ~50,000+ (estimated)
**Git Repositories:** 1 monorepo (flex-code-main)

---

## 🎨 Code Quality & Best Practices

### Backend
✅ Separation of concerns (routes → controllers → services)
✅ Input validation with express-validator
✅ Error handling with centralized middleware
✅ Logging with Winston
✅ Security headers with Helmet
✅ Rate limiting protection
✅ Database sanitization

### Frontend
✅ Component-based architecture
✅ Context API for state management
✅ Custom hooks for logic reuse
✅ Responsive Tailwind CSS design
✅ React Router for navigation
✅ Axios interceptors for API calls

✅ Error boundaries
✅ Loading states
✅ Toast notifications

### Mobile
✅ React Navigation patterns
✅ State management with AsyncStorage
✅ Responsive UI components
✅ Permission handling (camera, notifications)
✅ Error handling and user feedback

---

## 📝 Next Steps & Recommendations

1. **Setup Environment:**
   - Create `.env` file with required variables
   - Generate strong JWT secrets
   - Add Cloudinary & Stripe credentials

2. **Database:**
   - Run `npm run seed:docker` to populate test data
   - Verify all indexes are created
   - Test database health monitoring

3. **Testing:**
   - Run backend tests: `npm run test`
   - Run frontend linting: `npm run lint`
   - Set up CI/CD pipeline

4. **Documentation:**
   - Add API documentation (Swagger/OpenAPI)
   - Create deployment guide
   - Document testing procedures

5. **Monitoring:**
   - Set up logging aggregation
   - Configure error tracking (Sentry)
   - Add performance monitoring

6. **Optimization:**
   - Profile API response times
   - Optimize database queries
   - Implement caching strategy
   - Bundle size analysis

---

Generated: April 18, 2026
