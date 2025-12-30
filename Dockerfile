# Base image for dependency installation and building
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies separately to leverage Docker cache
COPY package.json package-lock.json ./
# Install dependencies (warnings are harmless, npm will continue even with deprecated packages)
RUN npm ci --legacy-peer-deps --ignore-scripts

# Copy application files, including the Prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build


# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps --ignore-scripts

# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Create necessary directories
RUN mkdir -p /app/ssl /app/uploads

# Copy SSL certificates if they exist (optional for Koyeb, they handle SSL)
COPY ssl/server.key /app/ssl/server.key 2>/dev/null || true
COPY ssl/server.cert /app/ssl/server.cert 2>/dev/null || true

# Expose port (Koyeb will use PORT env var)
EXPOSE 3000

ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Start the application
CMD ["npm", "run", "start:prod"]
