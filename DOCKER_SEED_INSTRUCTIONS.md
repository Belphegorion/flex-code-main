# Docker Seed Instructions

## Option 1: Seed via Docker Exec (Recommended)

```bash
# Start containers
docker-compose up -d

# Wait for containers to be ready (30 seconds)

# Run seeder inside backend container
docker-compose exec backend npm run seed
```

## Option 2: Add Seed Script to Docker Compose

Add this to `docker-compose.yml` under backend service:

```yaml
backend:
  # ... existing config ...
  command: sh -c "npm run seed && npm start"
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

## Option 3: Manual Seed (If exec doesn't work)

```bash
# Enter backend container
docker-compose exec backend sh

# Inside container, run:
npm run seed

# Exit
exit
```

## Verify Seeding

```bash
# Check backend logs
docker-compose logs backend

# Should see:
# ✅ Large database seeded successfully!
# 📊 Seeded Data: 5 Organizers, 40 Workers, etc.
```

## Troubleshooting

**If "npm run seed" fails:**
```bash
# Check if backend is running
docker-compose ps

# Restart backend
docker-compose restart backend

# Try seed again
docker-compose exec backend npm run seed
```

**If MongoDB connection fails:**
```bash
# Check MongoDB is running
docker-compose ps mongo

# Check MongoDB logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

## Access Application

After seeding:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- MongoDB: localhost:27017

Login with:
- organizer1-5@eventflex.com / password123
- worker1-40@eventflex.com / password123
