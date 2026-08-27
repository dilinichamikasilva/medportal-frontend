# Stage 1: Build the React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files to Nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default Nginx port configuration to listen on $PORT (Cloud Run default: 8080)
RUN sed -i 's/80/8080/g' /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]