# ==============================================================================
# JalLoop Dockerfile / Containerfile
# Compatible with AWS Finch (`finch build -t jalloop:latest .`) and Docker
# Track: Containers and Kubernetes (Finch, EKS Distro, ECS, Fargate)
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Web Server
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Clean default nginx files
RUN rm -rf ./*

# Copy built artifacts from Stage 1
COPY --from=builder /app/dist ./

# Expose HTTP port
EXPOSE 80

# Health check for AWS ECS / App Runner / Fargate
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
