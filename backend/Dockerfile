# Backend Dockerfile - Multi-stage build

# Base stage
FROM node:20-alpine AS base
WORKDIR /app

# Install system dependencies for Puppeteer
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Install dependencies only when needed
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Development stage
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3001

# Install tsx globally for development
RUN npm install -g tsx

# Generate Prisma Client
RUN npx prisma generate

CMD ["npm", "run", "dev"]

# Builder stage - Compile TypeScript and generate Prisma
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV CHROMIUM_PATH=/usr/bin/chromium-browser

# Copy package files AND package-lock.json
COPY package*.json ./

# Install only production dependencies (usar --omit=dev em vez de --only=production)
RUN npm ci --omit=dev && npm cache clean --force

# Generate Prisma Client for production
COPY prisma ./prisma
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create uploads directories
RUN mkdir -p /app/uploads/logos /app/uploads/pdf-customization /app/uploads/tarefas-obra /app/uploads/temp

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["node", "dist/app.js"]
