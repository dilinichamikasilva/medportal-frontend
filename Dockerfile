# Use Node.js 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install a simple static server globally
RUN npm install -g serve

# Expose the port Cloud Run expects (8080)
ENV PORT=8080
EXPOSE 8080

# Start the app using the PORT environment variable
CMD ["sh", "-c", "serve -s dist -l $PORT"]