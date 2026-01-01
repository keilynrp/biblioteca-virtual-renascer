FROM node:22-alpine

# Run as root to avoid permission issues on Windows
USER root

# Install curl for healthchecks
RUN apk add --no-cache curl

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Start the app
CMD ["npm", "run", "dev"]
