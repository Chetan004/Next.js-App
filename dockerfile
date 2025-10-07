# Use Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Build the Next.js app (App Router)
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
