FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (skip patch validation for Railway compatibility)
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start
CMD ["node", "dist/index.js"]
