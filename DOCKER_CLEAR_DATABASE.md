# Clear MongoDB Data in Docker

## Option 1: Clear Data via Docker Exec (Recommended)

```bash
# Connect to MongoDB container
docker exec -it flex-code-mongodb-1 mongosh

# In MongoDB shell:
use flex-code
db.dropDatabase()
exit
```

## Option 2: Stop and Remove Volumes

```bash
# Stop all containers
docker-compose down

# Remove volumes (this deletes all data)
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Option 3: Clear Specific Collections

```bash
# Connect to MongoDB
docker exec -it flex-code-mongodb-1 mongosh

# In MongoDB shell:
use flex-code
db.users.deleteMany({})
db.events.deleteMany({})
db.jobs.deleteMany({})
db.applications.deleteMany({})
db.groupchats.deleteMany({})
db.notifications.deleteMany({})
db.reviews.deleteMany({})
db.attendances.deleteMany({})
exit
```

## Option 4: Run Clear Script in Docker

```bash
# Copy script to container
docker cp backend/clearDatabase.js flex-code-backend-1:/app/clearDatabase.js

# Run script inside container
docker exec -it flex-code-backend-1 node clearDatabase.js
```

## Verify Data is Cleared

```bash
# Connect to MongoDB
docker exec -it flex-code-mongodb-1 mongosh

# Check collections
use flex-code
db.users.countDocuments()
db.events.countDocuments()
db.jobs.countDocuments()
exit
```

All should return 0.

## After Clearing

1. Go to `http://localhost:3000/signup`
2. Create new organizer account
3. Create event with multiple jobs
4. Test the system fresh!
