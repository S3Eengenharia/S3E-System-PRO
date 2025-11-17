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
RUN npm install -g tsx
RUN npx prisma generate
CMD ["npm", "run", "dev"]

# Builder stage - Compile TypeScript and generate Prisma
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV CHROMIUM_PATH=/usr/bin/chromium-browser

# Copy package files
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Install tsx globally for running seed script
RUN npm install -g tsx

# Generate Prisma Client for production
COPY prisma ./prisma
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# ✅ COPIA O SCRIPT DE INICIALIZAÇÃO
COPY scripts/start.sh /app/scripts/start.sh
RUN chmod +x /app/scripts/start.sh

# Create uploads directories
RUN mkdir -p /app/uploads/logos /app/uploads/pdf-customization /app/uploads/tarefas-obra /app/uploads/temp

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# ✅ COMANDO CORRETO - Script de inicialização
CMD ["/app/scripts/start.sh"]