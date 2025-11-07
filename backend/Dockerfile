# Backend Dockerfile for eventpro-backend
FROM node:18-alpine AS deps
WORKDIR /usr/src/app

# Copy only package manifests first for layer caching
COPY package*.json ./

# Use npm ci when a lockfile exists for reproducible installs,
# otherwise fall back to npm install without dev deps.
RUN if [ -f package-lock.json ]; then \
      npm ci --only=production; \
    else \
      npm install --omit=dev --no-audit --no-fund; \
    fi

FROM node:18-alpine AS runner
WORKDIR /usr/src/app

# Copy node_modules from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules
# Copy the rest of the backend source
COPY . .

ENV NODE_ENV=production
EXPOSE 4000

# Keep using the project's start script (package.json start -> node src/server.js)
CMD ["npm", "start"]
