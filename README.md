# EVENTFLEX - Event Workforce Management Platform

A comprehensive platform connecting event organizers with workers, featuring real-time communication, profile management, job applications, and team collaboration.

---

## 🚀 Core Features

### 1. **User Authentication & Authorization**
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control**: Worker, Organizer, Sponsor, Admin
- **Profile completion flow** with mandatory setup after registration
- **Secure password hashing** using bcrypt

**Implementation:**
- Backend: `backend/src/controllers/authController.js`, `backend/src/middleware/auth.js`
- Frontend: `frontend/src/context/AuthContext.jsx`, `frontend/src/pages/Login.jsx`, `frontend/src/pages/Signup.jsx`

---

### 2. **Profile Management**

#### Profile Photo Upload
- **Cloudinary integration** for image storage
- **File validation** (size, type)
- **Image preview** before upload
- **Profile photo display** across the platform

**Implementation:**
- Backend: `backend/src/controllers/profileController.js` (uploadProfilePhoto)
- Frontend: `frontend/src/components/profile/PhotoUpload.jsx`
- Config: `backend/src/config/cloudinary.js`

#### Profile Editing
- **Full profile update** (name, email, phone, bio, skills)
- **Skills management** with add/remove functionality
- **Role-specific fields** (worker badges, organizer company info)

**Implementation:**
- Backend: `backend/src/controllers/profileController.js` (updateMyProfile)
- Frontend: `frontend/src/pages/ProfileEdit.jsx`

#### Profile Viewing
- **Public profile pages** with ratings and badges
- **Edit button** for own profile
- **Worker statistics** (jobs completed, rating average)

**Implementation:**
- Backend: `backend/src/controllers/profileController.js` (getProfile)
- Frontend: `frontend/src/pages/ProfileView.jsx`

---

### 3. **Job Management**

#### Job Creation (Organizers)
- **Comprehensive job form** with title, description, location, pay rate
- **Date/time selection** for event scheduling
- **Worker capacity** management
- **Job status tracking** (open, in-progress, completed, cancelled)

**Implementation:**
- Backend: `backend/src/controllers/jobController.js` (createJob)
- Frontend: `frontend/src/pages/JobCreate.jsx`

#### Job Discovery (Workers)
- **Browse available jobs** with filters
- **Search by location, date, pay rate**
- **Job details view** with organizer information
- **One-click application** with optional cover letter

**Implementation:**
- Backend: `backend/src/controllers/jobController.js` (getJobs)
- Frontend: `frontend/src/pages/JobDiscover.jsx`, `frontend/src/pages/JobDetails.jsx`

#### Job Applications
- **Application submission** with cover letter
- **Application status tracking** (pending, accepted, declined)
- **Organizer applicant management** with accept/decline actions
- **Real-time notifications** on status changes

**Implementation:**
- Backend: `backend/src/controllers/applicationController.js`
- Frontend: `frontend/src/pages/JobApplicants.jsx`

---

### 4. **Real-Time Notifications**

#### Notification System
- **Socket.IO integration** for instant updates
- **Notification types**: Application received, accepted, declined, job updates
- **Unread badge** with count display
- **LinkedIn-style dropdown** with notification list
- **Click to navigate** to related content
- **Mark as read** functionality (individual and bulk)

**Implementation:**
- Backend: 
  - Model: `backend/src/models/Notification.js`
  - Controller: `backend/src/controllers/notificationController.js`
  - Routes: `backend/src/routes/notifications.js`
  - Socket events in `backend/src/controllers/applicationController.js`
- Frontend:
  - Component: `frontend/src/components/common/NotificationBell.jsx`
  - Socket service: `frontend/src/services/socket.js`
  - Integration: `frontend/src/context/AuthContext.jsx`

**Socket Events:**
- `join-user-room`: User joins their notification room
- `notification`: New notification broadcast to user

---

### 5. **Group Chat & Team Communication**

#### Group Chat Features
- **WhatsApp-style interface** with message bubbles
- **Real-time messaging** via Socket.IO
- **Job-based groups** created automatically on worker acceptance
- **Member management** (add/remove participants)
- **Message history** with timestamps
- **Member sidebar** showing all participants
- **Auto-scroll** to latest messages
- **System messages** for member join/leave events

**Implementation:**
- Backend:
  - Model: `backend/src/models/GroupChat.js`
  - Controller: `backend/src/controllers/groupChatController.js`
  - Routes: `backend/src/routes/groups.js`
- Frontend:
  - Pages: `frontend/src/pages/GroupChat.jsx`, `frontend/src/pages/Groups.jsx`
  - Socket integration in GroupChat component

**Socket Events:**
- `join-group`: User joins group room
- `group-message`: New message broadcast to group

#### Groups List
- **All user groups** displayed with job context
- **Last message preview** with timestamp
- **Unread indicators** (future enhancement)
- **Quick navigation** to group chat

---

### 6. **Attendance Tracking**

#### Check-In/Check-Out System
- **QR code generation** for events
- **GPS-based location verification**
- **Time tracking** with automatic duration calculation
- **Attendance history** for workers and organizers
- **Status indicators** (checked-in, checked-out, absent)

**Implementation:**
- Backend: `backend/src/controllers/attendanceController.js`
- Frontend: `frontend/src/pages/Attendance.jsx`

---

### 7. **Review & Rating System**

#### Worker Reviews
- **5-star rating system**
- **Written feedback** from organizers
- **Rating average** calculation
- **Review history** on profile pages
- **Badge system** for top performers

**Implementation:**
- Backend: `backend/src/controllers/reviewController.js`
- Frontend: Review components integrated in profile views

---

### 8. **Dashboard Systems**

#### Worker Dashboard
- **Active jobs** with status tracking
- **Application history** with status
- **Upcoming events** calendar view
- **Earnings summary** and payment history
- **Quick actions** (discover jobs, view profile)

**Implementation:**
- Frontend: `frontend/src/pages/WorkerDashboard.jsx`

#### Organizer Dashboard
- **Posted jobs** management
- **Applicant overview** with counts
- **Event calendar** with scheduling
- **Worker management** for active jobs
- **Quick actions** (create job, view applicants)

**Implementation:**
- Frontend: `frontend/src/pages/OrganizerDashboard.jsx`

---

## 🛠️ Technical Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Cloudinary** for image storage
- **bcrypt** for password hashing
- **express-rate-limit** for API protection

### Frontend
- **React 18** with Hooks
- **React Router v6** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.IO Client** for real-time updates
- **Axios** for API requests
- **React Toastify** for notifications
- **React Icons** for UI icons

---

## 📁 Project Structure

```
eventflex/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js          # Cloudinary configuration
│   │   │   └── database.js            # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js      # Authentication logic
│   │   │   ├── profileController.js   # Profile management
│   │   │   ├── jobController.js       # Job CRUD operations
│   │   │   ├── applicationController.js # Application handling
│   │   │   ├── notificationController.js # Notification system
│   │   │   ├── groupChatController.js # Group chat logic
│   │   │   ├── attendanceController.js # Attendance tracking
│   │   │   └── reviewController.js    # Review system
│   │   ├── models/
│   │   │   ├── User.js                # User schema
│   │   │   ├── Job.js                 # Job schema
│   │   │   ├── Application.js         # Application schema
│   │   │   ├── Notification.js        # Notification schema
│   │   │   ├── GroupChat.js           # Group chat schema
│   │   │   ├── Attendance.js          # Attendance schema
│   │   │   └── Review.js              # Review schema
│   │   ├── routes/
│   │   │   ├── auth.js                # Auth endpoints
│   │   │   ├── profiles.js            # Profile endpoints
│   │   │   ├── jobs.js                # Job endpoints
│   │   │   ├── applications.js        # Application endpoints
│   │   │   ├── notifications.js       # Notification endpoints
│   │   │   ├── groups.js              # Group chat endpoints
│   │   │   ├── attendance.js          # Attendance endpoints
│   │   │   └── reviews.js             # Review endpoints
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT verification
│   │   │   ├── rateLimiter.js         # Rate limiting
│   │   │   └── errorHandler.js        # Error handling
│   │   └── server.js                  # Express app & Socket.IO setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx         # Navigation with NotificationBell
│   │   │   │   ├── NotificationBell.jsx # Real-time notifications
│   │   │   │   ├── Layout.jsx         # Page wrapper
│   │   │   │   └── ProtectedRoute.jsx # Route protection
│   │   │   └── profile/
│   │   │       └── PhotoUpload.jsx    # Image upload component
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Auth state & Socket connection
│   │   │   ├── JobContext.jsx         # Job state management
│   │   │   └── ThemeContext.jsx       # Dark mode toggle
│   │   ├── pages/
│   │   │   ├── Login.jsx              # Login page
│   │   │   ├── Signup.jsx             # Registration page
│   │   │   ├── ProfileSetup.jsx       # Profile completion
│   │   │   ├── ProfileView.jsx        # Profile display
│   │   │   ├── ProfileEdit.jsx        # Profile editing
│   │   │   ├── WorkerDashboard.jsx    # Worker home
│   │   │   ├── OrganizerDashboard.jsx # Organizer home
│   │   │   ├── JobCreate.jsx          # Job creation form
│   │   │   ├── JobDiscover.jsx        # Job browsing
│   │   │   ├── JobDetails.jsx         # Job details & apply
│   │   │   ├── JobApplicants.jsx      # Applicant management
│   │   │   ├── Groups.jsx             # Group list
│   │   │   ├── GroupChat.jsx          # Chat interface
│   │   │   └── Attendance.jsx         # Attendance tracking
│   │   ├── services/
│   │   │   ├── api.js                 # Axios instance with interceptors
│   │   │   ├── socket.js              # Socket.IO service
│   │   │   └── authService.js         # Auth API calls
│   │   └── App.jsx                    # Route configuration
│   └── package.json
└── docker-compose.yml                 # Docker orchestration
```

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js 16+
- MongoDB 5+
- Cloudinary account (for image uploads)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/eventflex

# JWT Secrets
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **Start server:**
```bash
npm start
```

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```env
VITE_API_URL=http://localhost:4000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=ml_default
```

4. **Start development server:**
```bash
npm run dev
```

### Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get credentials from dashboard
3. Create upload preset:
   - Go to Settings → Upload → Upload Presets
   - Click "Add upload preset"
   - Set name: `ml_default`
   - Set signing mode: `Unsigned`
   - Set folder: `eventflex/profiles`
   - Save

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Profiles
- `GET /api/profiles/:id` - Get user profile
- `GET /api/profiles/me` - Get own full profile
- `PUT /api/profiles/me` - Update own profile
- `POST /api/profiles/photo` - Upload profile photo

### Jobs
- `GET /api/jobs` - List all jobs (with filters)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (organizer only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `POST /api/applications` - Apply to job
- `GET /api/applications/job/:jobId` - Get job applicants
- `POST /api/applications/:id/accept` - Accept application
- `POST /api/applications/:id/decline` - Decline application

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Group Chat
- `POST /api/groups` - Create group
- `GET /api/groups` - Get user groups
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/message` - Send message
- `POST /api/groups/:id/members` - Add member
- `DELETE /api/groups/:id/members/:userId` - Remove member

### Attendance
- `POST /api/attendance/check-in` - Check in to job
- `POST /api/attendance/check-out` - Check out from job
- `GET /api/attendance/job/:jobId` - Get job attendance

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/worker/:workerId` - Get worker reviews

---

## 🔐 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password hashing** with bcrypt (10 rounds)
- **Role-based authorization** middleware
- **Rate limiting** (production only)
- **CORS protection** with whitelist
- **Input validation** on all endpoints
- **SQL injection prevention** via Mongoose
- **XSS protection** via sanitization

---

## 🌐 Real-Time Features

### Socket.IO Events

**Client → Server:**
- `join-user-room` - Join personal notification room
- `join-group` - Join group chat room
- `join-event` - Join event room

**Server → Client:**
- `notification` - New notification received
- `group-message` - New group message
- `receive-message` - Direct message received

### Connection Flow
1. User logs in → AuthContext connects socket
2. Socket emits `join-user-room` with userId
3. Backend joins user to `user_${userId}` room
4. Notifications sent to room trigger real-time updates
5. User logs out → Socket disconnects

---

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['worker', 'organizer', 'sponsor', 'admin'],
  profilePhoto: String (Cloudinary URL),
  phone: String,
  bio: String,
  skills: [String],
  badges: [String],
  ratingAvg: Number,
  ratingCount: Number,
  profileCompleted: Boolean,
  createdAt: Date
}
```

### Job Model
```javascript
{
  title: String,
  description: String,
  location: String,
  date: Date,
  payRate: Number,
  workersNeeded: Number,
  status: Enum ['open', 'in-progress', 'completed', 'cancelled'],
  organizerId: ObjectId (ref: User),
  createdAt: Date
}
```

### Notification Model
```javascript
{
  userId: ObjectId (ref: User),
  type: Enum ['application', 'acceptance', 'rejection', 'job_update'],
  title: String,
  message: String,
  relatedId: ObjectId,
  actionUrl: String,
  read: Boolean,
  createdAt: Date
}
```

### GroupChat Model
```javascript
{
  jobId: ObjectId (ref: Job),
  name: String,
  participants: [ObjectId] (ref: User),
  messages: [{
    senderId: ObjectId (ref: User),
    text: String,
    type: Enum ['text', 'system'],
    createdAt: Date
  }],
  createdBy: ObjectId (ref: User),
  lastMessage: String,
  lastMessageAt: Date
}
```

---

## 🎨 UI/UX Features

- **Dark mode support** with theme toggle
- **Responsive design** (mobile, tablet, desktop)
- **Smooth animations** via Framer Motion
- **Toast notifications** for user feedback
- **Loading states** with spinners
- **Empty states** with helpful messages
- **Form validation** with error messages
- **Accessible components** (ARIA labels, keyboard navigation)

---

## 🚦 Application Flow

### Worker Journey
1. Sign up → Complete profile → Browse jobs
2. Apply to job with cover letter
3. Receive notification when accepted/declined
4. Join group chat with organizer and team
5. Check in/out on event day
6. Receive payment and review

### Organizer Journey
1. Sign up → Complete profile → Create job posting
2. Receive applications with notifications
3. Review applicants → Accept/Decline
4. Create group chat with accepted workers
5. Track attendance on event day
6. Process payments and leave reviews

---

## 🔄 State Management

- **AuthContext**: User authentication state, socket connection
- **JobContext**: Job listings and filters
- **ThemeContext**: Dark/light mode preference
- **Local component state**: Form inputs, UI toggles

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

---

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

Services:
- **Backend**: Port 4000
- **Frontend**: Port 3000
- **MongoDB**: Port 27017

---

## 📈 Future Enhancements

- [ ] Video calling integration (WebRTC)
- [ ] Payment processing (Stripe/PayPal)
- [ ] Advanced search filters
- [ ] Calendar integration
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Geolocation-based job matching

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Contributors

Built with ❤️ by the EVENTFLEX team

---

## 📞 Support

For issues and questions, please open a GitHub issue or contact support@eventflex.com
