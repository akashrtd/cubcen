#!/bin/bash

# Cubcen Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="/var/backups/cubcen"
LOG_FILE="/var/log/cubcen-deployment.log"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)  echo -e "${GREEN}[INFO]${NC} $message" ;;
        WARN)  echo -e "${YELLOW}[WARN]${NC} $message" ;;
        ERROR) echo -e "${RED}[ERROR]${NC} $message" ;;
        DEBUG) echo -e "${BLUE}[DEBUG]${NC} $message" ;;
    esac
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Slack notification function
notify_slack() {
    local message="$1"
    local emoji="$2"
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$emoji Cubcen Deployment: $message\"}" \
            "$SLACK_WEBHOOK" 2>/dev/null || true
    fi
}

# Error handler
error_handler() {
    local line_number=$1
    log ERROR "Deployment failed at line $line_number"
    notify_slack "Deployment failed at line $line_number" "❌"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Pre-deployment checks
pre_deployment_checks() {
    log INFO "Starting pre-deployment checks..."
    
    # Check if running as root or with sudo
    if [ "$EUID" -ne 0 ]; then
        log ERROR "This script must be run as root or with sudo"
        exit 1
    fi
    
    # Check required commands
    local required_commands=("docker" "docker-compose" "curl" "jq" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log ERROR "Required command '$cmd' not found"
            exit 1
        fi
    done
    
    # Check environment file
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        log ERROR "Environment file .env not found"
        log INFO "Please copy .env.production to .env and configure it"
        exit 1
    fi
    
    # Check critical environment variables
    source "$PROJECT_DIR/.env"
    local required_vars=("JWT_SECRET" "DATABASE_URL")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log ERROR "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    # Check JWT secret strength
    if [ ${#JWT_SECRET} -lt 32 ]; then
        log ERROR "JWT_SECRET must be at least 32 characters long"
        exit 1
    fi
    
    # Check disk space (minimum 5GB)
    local available_space=$(df / | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 5242880 ]; then  # 5GB in KB
        log ERROR "Insufficient disk space. At least 5GB required"
        exit 1
    fi
    
    # Check memory (minimum 2GB)
    local available_memory=$(free -m | awk 'NR==2{print $7}')
    if [ "$available_memory" -lt 2048 ]; then
        log WARN "Low available memory. At least 2GB recommended"
    fi
    
    log INFO "Pre-deployment checks completed successfully"
}

# Create backup before deployment
create_backup() {
    log INFO "Creating pre-deployment backup..."
    
    mkdir -p "$BACKUP_DIR"
    local backup_name="pre-deployment-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name.tar.gz"
    
    # Backup current deployment if it exists
    if [ -d "$PROJECT_DIR/data" ]; then
        tar -czf "$backup_path" \
            -C "$PROJECT_DIR" \
            data/ logs/ .env docker-compose.yml 2>/dev/null || true
        
        log INFO "Backup created: $backup_path"
    else
        log INFO "No existing data to backup"
    fi
}

# Pull latest code and build
build_application() {
    log INFO "Building application..."
    
    cd "$PROJECT_DIR"
    
    # Pull latest code (if git repository)
    if [ -d ".git" ]; then
        log INFO "Pulling latest code from repository..."
        git pull origin main
    fi
    
    # Build Docker image
    log INFO "Building Docker image..."
    docker-compose build --no-cache cubcen
    
    # Verify build
    if ! docker images | grep -q "cubcen"; then
        log ERROR "Docker image build failed"
        exit 1
    fi
    
    log INFO "Application build completed successfully"
}

# Database migration
migrate_database() {
    log INFO "Running database migrations..."
    
    cd "$PROJECT_DIR"
    
    # Generate Prisma client
    docker-compose run --rm cubcen npx prisma generate
    
    # Run migrations
    docker-compose run --rm cubcen npx prisma migrate deploy
    
    # Verify database connection
    if ! docker-compose run --rm cubcen npx prisma db pull > /dev/null 2>&1; then
        log ERROR "Database migration failed"
        exit 1
    fi
    
    log INFO "Database migrations completed successfully"
}

# Deploy application with zero-downtime
deploy_application() {
    log INFO "Deploying application..."
    
    cd "$PROJECT_DIR"
    
    # Start new containers
    docker-compose up -d --remove-orphans
    
    # Wait for application to start
    log INFO "Waiting for application to start..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:3000/api/cubcen/v1/health > /dev/null 2>&1; then
            log INFO "Application started successfully"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log ERROR "Application failed to start within timeout"
            docker-compose logs --tail=50 cubcen
            exit 1
        fi
        
        log DEBUG "Attempt $attempt/$max_attempts - waiting for application..."
        sleep 10
        ((attempt++))
    done
    
    log INFO "Application deployment completed successfully"
}

# Post-deployment verification
post_deployment_verification() {
    log INFO "Running post-deployment verification..."
    
    # Health check
    local health_response=$(curl -s http://localhost:3000/api/cubcen/v1/health)
    if ! echo "$health_response" | jq -e '.status == "healthy"' > /dev/null 2>&1; then
        log ERROR "Health check failed: $health_response"
        exit 1
    fi
    
    # Database connectivity
    if ! docker-compose exec -T cubcen npx prisma db pull > /dev/null 2>&1; then
        log ERROR "Database connectivity check failed"
        exit 1
    fi
    
    # API endpoints
    local endpoints=("/api/cubcen/v1/health" "/api/cubcen/v1/agents" "/api/cubcen/v1/tasks")
    for endpoint in "${endpoints[@]}"; do
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$endpoint")
        if [[ ! "$status_code" =~ ^(200|401)$ ]]; then  # 401 is OK for protected endpoints
            log ERROR "Endpoint $endpoint returned status $status_code"
            exit 1
        fi
    done
    
    # Check logs for errors
    local error_count=$(docker-compose logs --since=5m cubcen | grep -i error | wc -l)
    if [ "$error_count" -gt 0 ]; then
        log WARN "Found $error_count errors in recent logs"
        docker-compose logs --since=5m cubcen | grep -i error | tail -5
    fi
    
    log INFO "Post-deployment verification completed successfully"
}

# Setup monitoring and alerting
setup_monitoring() {
    log INFO "Setting up monitoring and alerting..."
    
    # Create monitoring scripts directory
    mkdir -p /opt/cubcen/monitoring
    
    # Copy monitoring scripts
    cp "$SCRIPT_DIR/health-monitor.sh" /opt/cubcen/monitoring/ 2>/dev/null || true
    cp "$SCRIPT_DIR/resource-monitor.sh" /opt/cubcen/monitoring/ 2>/dev/null || true
    
    # Make scripts executable
    chmod +x /opt/cubcen/monitoring/*.sh 2>/dev/null || true
    
    # Setup systemd service for health monitoring
    cat > /etc/systemd/system/cubcen-monitor.service << EOF
[Unit]
Description=Cubcen Health Monitor
After=network.target

[Service]
Type=simple
User=root
ExecStart=/opt/cubcen/monitoring/health-monitor.sh
Restart=always
RestartSec=60

[Install]
WantedBy=multi-user.target
EOF
    
    # Enable and start monitoring service
    systemctl daemon-reload
    systemctl enable cubcen-monitor.service
    systemctl start cubcen-monitor.service
    
    log INFO "Monitoring and alerting setup completed"
}

# Setup log rotation
setup_log_rotation() {
    log INFO "Setting up log rotation..."
    
    cat > /etc/logrotate.d/cubcen << EOF
/var/log/cubcen*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}

$PROJECT_DIR/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f $PROJECT_DIR/docker-compose.yml restart cubcen > /dev/null 2>&1 || true
    endscript
}
EOF
    
    log INFO "Log rotation setup completed"
}

# Cleanup old resources
cleanup() {
    log INFO "Cleaning up old resources..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove old backups (keep last 10)
    if [ -d "$BACKUP_DIR" ]; then
        ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    fi
    
    # Clean up old logs
    find /var/log -name "cubcen*.log.*" -mtime +30 -delete 2>/dev/null || true
    
    log INFO "Cleanup completed"
}

# Main deployment function
main() {
    log INFO "Starting Cubcen production deployment..."
    notify_slack "Starting production deployment" "🚀"
    
    local start_time=$(date +%s)
    
    # Run deployment steps
    pre_deployment_checks
    create_backup
    build_application
    migrate_database
    deploy_application
    post_deployment_verification
    setup_monitoring
    setup_log_rotation
    cleanup
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log INFO "Deployment completed successfully in ${duration}s"
    notify_slack "Deployment completed successfully in ${duration}s" "✅"
    
    # Display final status
    echo
    echo "=========================================="
    echo "🎉 CUBCEN DEPLOYMENT SUCCESSFUL"
    echo "=========================================="
    echo "Application URL: http://$(hostname -I | awk '{print $1}'):3000"
    echo "Health Check: curl http://localhost:3000/api/cubcen/v1/health"
    echo "Logs: docker-compose logs -f cubcen"
    echo "Monitoring: systemctl status cubcen-monitor"
    echo "=========================================="
}

# Rollback function
rollback() {
    log WARN "Initiating rollback procedure..."
    notify_slack "Initiating rollback procedure" "⚠️"
    
    cd "$PROJECT_DIR"
    
    # Stop current containers
    docker-compose down
    
    # Find latest backup
    local latest_backup=$(ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -1)
    
    if [ -n "$latest_backup" ]; then
        log INFO "Restoring from backup: $latest_backup"
        
        # Extract backup
        tar -xzf "$latest_backup" -C "$PROJECT_DIR"
        
        # Start services
        docker-compose up -d
        
        # Wait for startup
        sleep 30
        
        # Verify rollback
        if curl -f -s http://localhost:3000/api/cubcen/v1/health > /dev/null 2>&1; then
            log INFO "Rollback completed successfully"
            notify_slack "Rollback completed successfully" "✅"
        else
            log ERROR "Rollback failed - manual intervention required"
            notify_slack "Rollback failed - manual intervention required" "❌"
        fi
    else
        log ERROR "No backup found for rollback"
        notify_slack "No backup found for rollback" "❌"
    fi
}

# Handle command line arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    rollback)
        rollback
        ;;
    *)
        echo "Usage: $0 [deploy|rollback]"
        echo "  deploy   - Deploy application to production (default)"
        echo "  rollback - Rollback to previous version"
        exit 1
        ;;
esac