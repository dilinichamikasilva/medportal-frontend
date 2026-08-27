# Step 1: Build the React app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve with a lightweight static server (serve)
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist /app/dist

# Cloud Run expects the app to listen on the port provided by the PORT env variable
EXPOSE 8080
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]