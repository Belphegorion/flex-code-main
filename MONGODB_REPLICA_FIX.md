# MongoDB Replica Set Fix

## Problem
"Transaction numbers are only allowed on a replica set member or mongos"

## Solution

1. **Stop containers:**
```bash
docker-compose down -v
```

2. **Start MongoDB:**
```bash
docker-compose up -d mongo
```

3. **Initialize replica set (wait 10 seconds after mongo starts):**
```bash
docker-compose exec mongo mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'mongo:27017'}]})"
```

4. **Verify replica set:**
```bash
docker-compose exec mongo mongosh --eval "rs.status()"
```

5. **Start all services:**
```bash
docker-compose up -d
```

6. **Seed database:**
```bash
docker-compose exec backend npm run seed:docker
```

## Quick Fix Script

```bash
docker-compose down -v
docker-compose up -d mongo
timeout /t 10
docker-compose exec mongo mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'mongo:27017'}]})"
docker-compose up -d
docker-compose exec backend npm run seed:docker
```

## Verify Working

Check backend logs:
```bash
docker-compose logs backend
```

Should see no transaction errors when accepting applications.
