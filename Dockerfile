# Use official Node.js runtime as base image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
# Install all dependencies (including devDependencies)
RUN npm ci
# Copy source code
COPY . .
# Expose port
EXPOSE 3000
# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
# Start the application in development mode
CMD ["npm", "run", "dev"]

# Production dependencies stage
FROM base AS prod-deps
# Set NODE_ENV to production
ENV NODE_ENV=production
# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM base AS production
# Set NODE_ENV to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy source code
COPY --chown=nextjs:nodejs . .

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/index.js"]
