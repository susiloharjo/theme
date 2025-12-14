FROM node:18

WORKDIR /app

# Install netcat for health check
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Copy package json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 3000

# Use entrypoint script for initialization
ENTRYPOINT ["./entrypoint.sh"]
