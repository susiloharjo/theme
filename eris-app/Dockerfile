# Stage 1: Build the Angular application
FROM node:20-alpine as builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
# Results will be in /app/dist/eris-app/browser or /app/dist/eris-app depending on configuration
# Based on previous logs: /home/gundala22/Documents/Code/theme/eris-app/dist/eris-app
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build artifacts from the builder stage
COPY --from=builder /app/dist/eris-app/browser /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
