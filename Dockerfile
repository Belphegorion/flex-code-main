# Frontend Dockerfile for Vite-based React app
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Copy package files for layer caching
COPY package*.json ./

# Install dependencies with legacy peer deps for compatibility
RUN npm install --legacy-peer-deps --no-audit --no-fund



# Copy source and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine
# Remove default config and copy custom nginx config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

# copy built files (Vite outputs to /dist)
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
