# Use official lightweight Node.js 20 Alpine image
FROM node:20-alpine

# Set the working directory to /app
WORKDIR /app

# Copy only the package.json and package-lock.json for the backend first
# This optimizes the Docker build cache for dependency installation
COPY back/package*.json ./back/

# Change to backend directory and install only production dependencies
WORKDIR /app/back
RUN npm ci --omit=dev

# Change back to the main app directory
WORKDIR /app

# Copy the rest of the backend source code and frontend assets
# Note: .dockerignore will automatically prevent the .env file and local node_modules from being copied
COPY back/ ./back/
COPY front/ ./front/

# Expose the backend port
EXPOSE 3000

# Set the working directory to the backend where the entry point is
WORKDIR /app/back

# Set default Node environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
