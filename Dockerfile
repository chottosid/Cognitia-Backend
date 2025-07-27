FROM node:22-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl wget

# Copy package files
COPY package*.json ./

# Install dependencies without postinstall to avoid prisma generate
RUN npm ci --ignore-scripts && npm cache clean --force

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

# Generate Prisma client again to ensure it's available with all source code
RUN npx prisma generate

# Make startup script executable
RUN chmod +x ./scripts/start.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the application
CMD ["./scripts/start.sh"]