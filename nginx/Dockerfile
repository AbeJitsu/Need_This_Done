# Nginx Docker Image - Lightweight Web Server
# Uses Alpine Linux: a tiny, super-efficient base image
# Alpine = 5MB instead of 200MB (40x smaller!)
# Smaller image = faster download, less disk space, faster startup

FROM nginx:alpine

# Remove default nginx config that intercepts localhost requests
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom configuration into the container
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates for HTTPS
# In development: self-signed certificates (generates browser warning)
# In production: replace with Let's Encrypt certificates
COPY ssl/cert.pem /etc/nginx/ssl/cert.pem
COPY ssl/key.pem /etc/nginx/ssl/key.pem

# Health check - is Nginx actually responding?
# Runs every 30 seconds, fails if no response in 3 seconds
# If it fails 3 times in a row, Docker marks the container as unhealthy
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/health || exit 1
