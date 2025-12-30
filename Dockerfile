# Base image for dependency installation and building
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies separately to leverage Docker cache
COPY package.json ./
COPY package-lock.json* ./
# Install dependencies (warnings are harmless, npm will continue even with deprecated packages)
RUN npm ci --legacy-peer-deps --ignore-scripts || npm install --legacy-peer-deps --ignore-scripts

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
COPY package.json ./
COPY package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps --ignore-scripts || npm install --omit=dev --legacy-peer-deps --ignore-scripts

# Ensure Prisma CLI is installed (needed for migrations)
RUN npm list prisma || npm install prisma@^6.2.1 --save --legacy-peer-deps --no-save

# Copy Prisma schema and generated client from builder
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Create necessary directories (SSL not needed - Koyeb handles SSL termination)
RUN mkdir -p /app/uploads

# Expose port (Koyeb will use PORT env var)
EXPOSE 3000

ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Start the application
CMD ["npm", "run", "start:prod"]
