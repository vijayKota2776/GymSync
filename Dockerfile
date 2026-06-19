# ==========================================================================
# GymSync Backend — Dockerfile
# Node.js Express API with SQLite
# ==========================================================================
FROM node:22-alpine

WORKDIR /app

# Install build tools for better-sqlite3 native module
RUN apk add --no-cache python3 make g++

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy server code
COPY server/ ./server/

# Copy built frontend (for production serving)
COPY dist/ ./dist/

# Create data directory for SQLite
RUN mkdir -p /app/data

# Environment
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/app/data/gymsync.db

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

# Start server
CMD ["node", "server/index.js"]
