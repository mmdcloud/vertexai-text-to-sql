# -------------------------
# Stage 1: Build React app
# -------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy project files
COPY . .

# Build production-ready static files
RUN npm run build


# -------------------------
# Stage 2: Serve with Nginx
# -------------------------
FROM nginx:1.27-alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx config (optional, if you want SPA routing)
# Uncomment if you have nginx.conf in your project
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Healthcheck
HEALTHCHECK CMD curl --fail http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]