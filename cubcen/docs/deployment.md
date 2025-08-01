# Cubcen Deployment Guide

This guide covers the deployment of Cubcen AI Agent Management Platform in various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment Methods](#deployment-methods)
- [Production Deployment](#production-deployment)
- [Monitoring and Health Checks](#monitoring-and-health-checks)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows with WSL2
- **Node.js**: Version 20 or higher
- **Memory**: Minimum 2GB RAM, 4GB+ recommended for production
- **Storage**: Minimum 10GB free space, SSD recommended
- **Network**: Outbound HTTPS access for platform integrations

### Required Software

- Docker and Docker Compose (recommended)
- Git
- curl (for health checks)

### Optional Dependencies

- PostgreSQL (for production database)
- Redis (for caching and queues)
- Nginx (for reverse proxy)

## Environment Configuration

### 1. Environment Variables

Copy the appropriate environment template:

```bash
# For development
cp .env.example .env

# For production
cp .env.production .env
```

### 2. Required Configuration

Update the following critical variables:

```bash
# Security (CRITICAL for production)
JWT_SECRET=your-super-secure-jwt-secret-min-32-characters
NODE_ENV=production

# Database
DATABASE_URL=file:./data/cubcen.db  # SQLite
# OR
DATABASE_URL=postgresql://user:pass@localhost:5432/cubcen  # PostgreSQL

# Platform Integrations
N8N_BASE_URL=https://your-n8n-instance.com
N8N_API_KEY=your-n8n-api-key
MAKE_BASE_URL=https://us1.make.com
MAKE_CLIENT_ID=your-make-client-id
MAKE_CLIENT_SECRET=your-make-client-secret

# Notifications
SMTP_HOST=smtp.your-domain.com
SMTP_USER=cubcen@your-domain.com
SMTP_PASS=your-smtp-password
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL=#cubcen-alerts
```

### 3. Feature Flags

Configure feature flags based on your rollout strategy:

```bash
ENABLE_ANALYTICS=true
ENABLE_KANBAN_BOARD=true
ENABLE_WORKFLOW_ORCHESTRATION=false  # Enable gradually
ENABLE_ADVANCED_AUTH=false           # Enable for enterprise
ENABLE_NOTIFICATIONS=true
```

## Deployment Methods

### Method 1: Docker Compose (Recommended)

#### Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/cubcen.git
cd cubcen/cubcen

# Configure environment
cp .env.production .env
# Edit .env with your configuration

# Start services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs cubcen
```

#### With PostgreSQL

```bash
# Start with PostgreSQL
docker-compose --profile postgres up -d

# Run migrations
docker-compose exec cubcen npx prisma migrate deploy
```

#### With Full Stack (PostgreSQL + Redis + Nginx)

```bash
# Start all services
docker-compose --profile postgres --profile redis --profile nginx up -d
```

### Method 2: Docker (Standalone)

```bash
# Build image
docker build -t cubcen:latest .

# Run container
docker run -d \
  --name cubcen \
  -p 3000:3000 \
  -v cubcen_data:/app/data \
  -v cubcen_logs:/app/logs \
  -v cubcen_backups:/app/backups \
  --env-file .env \
  cubcen:latest

# Check health
curl http://localhost:3000/api/cubcen/v1/health
```

### Method 3: Manual Installation

```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build
npm run build:server

# Start production server
npm run start:server
```

## Production Deployment

### 1. Infrastructure Setup

#### Server Specifications

**Minimum Requirements:**
- 2 vCPUs
- 4GB RAM
- 50GB SSD storage
- Ubuntu 20.04 LTS

**Recommended for Production:**
- 4 vCPUs
- 8GB RAM
- 100GB SSD storage
- Load balancer for high availability

#### Security Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### 2. SSL/TLS Configuration

#### Using Let's Encrypt with Nginx

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/cubcen
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Database Setup

#### PostgreSQL Production Setup

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE cubcen;
CREATE USER cubcen WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE cubcen TO cubcen;
\q

# Update connection string
DATABASE_URL=postgresql://cubcen:secure_password@localhost:5432/cubcen
```

### 4. Process Management

#### Using systemd

```bash
# Create service file
sudo nano /etc/systemd/system/cubcen.service
```

```ini
[Unit]
Description=Cubcen AI Agent Management Platform
After=network.target

[Service]
Type=simple
User=cubcen
WorkingDirectory=/opt/cubcen
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/cubcen/.env

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable cubcen
sudo systemctl start cubcen
sudo systemctl status cubcen
```

## Monitoring and Health Checks

### 1. Health Check Endpoints

```bash
# Application health
curl http://localhost:3000/api/cubcen/v1/health

# Detailed health check
curl http://localhost:3000/api/cubcen/v1/health/detailed
```

### 2. Log Monitoring

```bash
# View application logs
docker-compose logs -f cubcen

# Or for systemd
sudo journalctl -u cubcen -f

# Log files location
tail -f /opt/cubcen/logs/cubcen.log
tail -f /opt/cubcen/logs/error.log
```

### 3. Performance Monitoring

#### Basic Monitoring Script

```bash
#!/bin/bash
# monitor.sh

while true; do
    echo "=== $(date) ==="
    
    # Health check
    curl -s http://localhost:3000/api/cubcen/v1/health | jq .
    
    # System resources
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')"
    echo "Memory: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
    echo "Disk: $(df -h / | awk 'NR==2{print $5}')"
    
    echo "---"
    sleep 60
done
```

### 4. Alerting Setup

#### Slack Webhook Monitoring

```bash
#!/bin/bash
# alert.sh

SLACK_WEBHOOK="your-slack-webhook-url"
SERVICE_URL="http://localhost:3000/api/cubcen/v1/health"

if ! curl -f -s $SERVICE_URL > /dev/null; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 Cubcen service is down!"}' \
        $SLACK_WEBHOOK
fi
```

## Backup and Recovery

### 1. Automated Backups

Backups are automatically created based on configuration:

```bash
# Environment variables
BACKUP_ENABLED=true
BACKUP_INTERVAL_HOURS=6
BACKUP_RETENTION_DAYS=30
BACKUP_PATH=/var/backups/cubcen
```

### 2. Manual Backup

```bash
# Create backup via API
curl -X POST http://localhost:3000/api/cubcen/v1/backup

# Or using Docker
docker-compose exec cubcen npm run backup:create
```

### 3. Restore from Backup

```bash
# List available backups
curl http://localhost:3000/api/cubcen/v1/backup

# Restore specific backup
curl -X POST http://localhost:3000/api/cubcen/v1/backup/restore \
  -H "Content-Type: application/json" \
  -d '{"backupId": "backup_id_here"}'
```

### 4. Database Migration

```bash
# Backup before migration
docker-compose exec cubcen npm run backup:create

# Run migrations
docker-compose exec cubcen npx prisma migrate deploy

# Verify migration
docker-compose exec cubcen npx prisma migrate status
```

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check logs
docker-compose logs cubcen

# Common causes:
# - Invalid environment variables
# - Database connection issues
# - Port conflicts
# - Insufficient permissions
```

#### 2. Database Connection Issues

```bash
# Test database connection
docker-compose exec cubcen npx prisma db pull

# Check database status
docker-compose exec postgres pg_isready

# Reset database (CAUTION: Data loss)
docker-compose exec cubcen npx prisma migrate reset
```

#### 3. Platform Integration Issues

```bash
# Test n8n connection
curl -H "X-N8N-API-KEY: your-api-key" \
  https://your-n8n-instance.com/api/v1/workflows

# Test Make.com connection
curl -H "Authorization: Bearer your-token" \
  https://us1.make.com/api/v2/scenarios
```

#### 4. Performance Issues

```bash
# Check resource usage
docker stats cubcen

# Analyze slow queries (PostgreSQL)
docker-compose exec postgres psql -U cubcen -c "
  SELECT query, mean_time, calls 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 10;"

# Check application metrics
curl http://localhost:3000/api/cubcen/v1/metrics
```

### Recovery Procedures

#### 1. Service Recovery

```bash
# Restart service
docker-compose restart cubcen

# Or for systemd
sudo systemctl restart cubcen

# Check health after restart
curl http://localhost:3000/api/cubcen/v1/health
```

#### 2. Database Recovery

```bash
# Stop application
docker-compose stop cubcen

# Restore from backup
docker-compose exec cubcen npm run backup:restore backup_id

# Start application
docker-compose start cubcen
```

#### 3. Full System Recovery

```bash
# 1. Stop all services
docker-compose down

# 2. Restore data volumes
docker volume create cubcen_data
# Restore from backup to volume

# 3. Start services
docker-compose up -d

# 4. Verify functionality
curl http://localhost:3000/api/cubcen/v1/health
```

### Support and Maintenance

#### Regular Maintenance Tasks

```bash
# Weekly tasks
- Review logs for errors
- Check backup integrity
- Update security patches
- Monitor resource usage

# Monthly tasks
- Update dependencies
- Review performance metrics
- Clean up old backups
- Security audit
```

#### Getting Help

1. Check application logs first
2. Review this documentation
3. Check GitHub issues
4. Contact support with:
   - Error messages
   - Configuration details
   - Steps to reproduce
   - System information

For additional support, please refer to the [GitHub repository](https://github.com/your-org/cubcen) or contact the development team.