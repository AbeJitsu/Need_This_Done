# Nginx Docker Image - Lightweight Web Server
# Uses Alpine Linux: a tiny, super-efficient base image
# Alpine = 5MB instead of 200MB (40x smaller!)
# Smaller image = faster download, less disk space, faster startup

FROM nginx:alpine

# Copy our custom configuration into the container
# :ro = read-only (container can't accidentally modify it)
COPY nginx.conf /etc/nginx/nginx.conf:ro

# Health check - is Nginx actually responding?
# Runs every 30 seconds, fails if no response in 3 seconds
# If it fails 3 times in a row, Docker marks the container as unhealthy
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1
