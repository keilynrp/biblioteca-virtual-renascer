FROM node:22-alpine

# Run as root to avoid permission issues on Windows
USER root

# Install curl for healthchecks and other dependencies
RUN apk add --no-cache \
    curl \
    libc6-compat \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Set environment variables for performance
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=development \
    NPM_CONFIG_LOGLEVEL=warn \
    # Turbopack optimizations
    TURBOPACK_VERBOSE=0 \
    # Next.js performance
    NEXT_PRIVATE_STANDALONE=true

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./

# Install dependencies with optimizations and fallback
# Try npm ci first, fall back to npm install if it fails
RUN npm ci --no-audit --progress=false || npm install --no-audit --progress=false; \
    npm cache clean --force

# Copy project files
COPY . .

# Create .next directory with proper permissions
RUN mkdir -p .next/cache .next/server \
    && chmod -R 777 .next

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start the app with Turbopack
CMD ["npm", "run", "dev"]
