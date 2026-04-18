# EVENTFLEX — Event Workforce Management Platform

## Quick Start (Docker)

```bash
docker-compose up -d
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:4000      |
| MongoDB  | mongodb://localhost:27017  |
| Redis    | redis://localhost:6379     |

---

## Environment Variables

Add these to `docker-compose.yml` under `backend > environment`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name      # required for image uploads
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_key          # required for payments
JWT_SECRET=change_this_to_random_string    # ⚠️ change before production
JWT_REFRESH_SECRET=change_this_too         # ⚠️ change before production
```

---

## Bugs Fixed

| # | Bug | File | Fix |
|---|-----|------|-----|
| 1 | Registration 500 — sponsor `industry` field `required: true` unconditionally | `backend/src/models/User.js` | Removed `required` from nested sponsor fields |
| 2 | Login 401 — double password hashing (controller + model pre-save hook) | `backend/src/controllers/authController.js` | Removed manual `bcrypt.hash()` from controller, use model pre-save |
| 3 | Login 401 — `bcryptjs` in controller vs `bcrypt` in model (different libraries) | `authController.js` | Switched login to use `user.comparePassword()` from model |
| 4 | Redis connection failing — `lazyConnect: true` never triggered | `backend/src/config/redis.js` | Removed `lazyConnect: true` |
| 5 | Bull queue Redis connection failing — using `host/port` instead of `REDIS_URL` | `backend/src/config/queue.js` | Changed to use `REDIS_URL` env var |
| 6 | Frontend allows 6-char passwords, backend requires 8+ with complexity | `frontend/src/components/auth/SignupForm.jsx` | Updated `minLength` to 8, updated hint text |
| 7 | MongoDB text index conflict on `jobs` collection — old index `roles` vs new `requiredSkills` | `backend/src/utils/createIndexes.js` | Run fix script below |

---

## Fix MongoDB Index Conflict

Run once after first deploy:

```bash
docker exec -it flex-code-main-mongo-1 mongosh eventflex --eval \
  'db.jobs.dropIndex("title_text_description_text_roles_text")'

docker-compose restart backend
```

---

## Password Requirements

Backend enforces — frontend must match:
- Minimum **8 characters**
- At least one **uppercase** letter
- At least one **lowercase** letter
- At least one **number**

Example valid password: `Test123!`

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/auth/profile` | Yes | Get current user |

### Jobs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/jobs` | Yes | List organizer's jobs |
| POST | `/api/jobs` | Organizer | Create job |
| GET | `/api/jobs/:id` | Yes | Get job details |
| PUT | `/api/jobs/:id` | Organizer | Update job |
| GET | `/api/jobs/discover` | Worker | Browse open jobs |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | Organizer | List events |
| POST | `/api/events` | Organizer | Create event |
| GET | `/api/events/:id` | Yes | Get event |
| PUT | `/api/events/:id` | Organizer | Update event |

### Applications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/applications` | Worker | Apply to job |
| GET | `/api/applications/job/:jobId` | Organizer | Get applicants |
| POST | `/api/applications/:id/accept` | Organizer | Accept application |
| POST | `/api/applications/:id/decline` | Organizer | Decline application |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | Yes | Get notifications |
| PUT | `/api/notifications/:id/read` | Yes | Mark as read |
| PUT | `/api/notifications/read-all` | Yes | Mark all read |

### Groups
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/groups` | Yes | List user groups |
| GET | `/api/groups/:id` | Yes | Get group + messages |
| POST | `/api/groups/:id/message` | Yes | Send message |

---

## Socket.IO Events

**Client → Server**
- `join-user-room` — join personal notification room
- `join-group` — join group chat room
- `send-message` — send chat message

**Server → Client**
- `notification` — new notification
- `group-message` — new group message
- `receive-message` — direct message

---

## Roles & Access

| Role | Dashboard | Can Do |
|------|-----------|--------|
| `worker` | `/worker` | Browse jobs, apply, chat, check-in/out |
| `organizer` | `/organizer` | Create events/jobs, manage applicants, chat |
| `sponsor` | `/sponsor` | View events, sponsor |
| `admin` | `/admin` | Full access |

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), Redis, Socket.IO, JWT, bcrypt, Bull, Cloudinary, Stripe

**Frontend:** React 18, React Router v6, Tailwind CSS, Framer Motion, Axios, Socket.IO Client, React Toastify

**Infrastructure:** Docker, Docker Compose, Nginx (frontend), MongoDB 7, Redis 7

---

## Useful Commands

```bash
# View logs
docker logs flex-code-main-backend-1 --tail 50
docker logs flex-code-main-frontend-1 --tail 20

# Restart services
docker-compose restart backend
docker-compose restart frontend

# Rebuild after code changes
docker-compose up -d --build backend
docker-compose up -d --build frontend

# Access MongoDB shell
docker exec -it flex-code-main-mongo-1 mongosh eventflex

# Access Redis CLI
docker exec -it flex-code-main-redis-1 redis-cli

# Stop everything
docker-compose down

# Stop and wipe volumes (fresh start)
docker-compose down -v
```

---

## Known Warnings (Non-Breaking)

- **Cloudinary not configured** — image uploads will fail until credentials are added
- **Stripe not configured** — payments will fail until key is added
- **JWT secrets are hardcoded** — change before any production deployment
- **MongoDB index conflict** — run the fix script above once
