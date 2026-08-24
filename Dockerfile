# =========================================================
# Multi-stage Dockerfile for Amaris Mathematics Hub
# Target Image: bethuelm/amaris-mathematics-deploy-v1
# =========================================================

# Stage 1: Build Phase
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies needed for build)
RUN npm ci || npm install

# Copy source code and config files
COPY . .

# Build Vite frontend and compile Express server into dist/server.cjs
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --omit=dev

# Copy compiled frontend and bundled server from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Optional: Copy default JSON data storage files if required
COPY --from=builder /app/*.json ./ 2>/dev/null || true

# Expose container port
EXPOSE 3000

# Start compiled CommonJS server
CMD ["node", "dist/server.cjs"]
