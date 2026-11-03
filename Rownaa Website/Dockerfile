FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Set Node environment to production
ENV NODE_ENV=production

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application using standard non-root user for security
USER node
CMD ["npm", "start"]
