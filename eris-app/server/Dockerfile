FROM node:18

WORKDIR /app

# Copy package json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
