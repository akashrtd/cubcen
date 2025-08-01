# Cubcen Operations Runbooks

This document contains operational procedures for managing Cubcen in production environments.

## Table of Contents

- [Emergency Procedures](#emergency-procedures)
- [Routine Maintenance](#routine-maintenance)
- [Monitoring and Alerting](#monitoring-and-alerting)
- [Backup and Recovery](#backup-and-recovery)
- [Performance Optimization](#performance-optimization)
- [Security Procedures](#security-procedures)

## Emergency Procedures

### Service Down - Complete Outage

**Symptoms:**
- Health check endpoint returns 5xx errors
- Users cannot access the application
- No response from the service

**Immediate Actions:**

1. **Check Service Status**
   ```bash
   # Docker Compose
   docker-compose ps
   docker-compose logs --tail=50 cubcen
   
   # Systemd
   sudo systemctl status cubcen
   sudo journalctl -u cubcen --lines=50
   ```

2. **Quick Restart**
   ```bash
   # Docker Compose
   docker-compose restart cubcen
   
   # Systemd
   sudo systemctl restart cubcen
   ```

3. **Verify Recovery**
   ```bash
   # Wait 30 seconds then check
   sleep 30
   curl -f http://localhost:3000/api/cubcen/v1/health
   ```

4. **If Still Down - Check Dependencies**
   ```bash
   # Database connectivity
   docker-compose exec cubcen npx prisma db pull
   
   # Disk space
   df -h
   
   # Memory usage
   free -m
   
   # Port conflicts
   netstat -tulpn | grep :3000
   ```

**Escalation:**
- If service doesn't recover within 5 minutes, escalate to development team
- Document all actions taken and error messages

### Database Connection Issues

**Symptoms:**
- Application starts but returns database errors
- "Connection refused" or "Connection timeout" errors
- Prisma client errors in logs

**Actions:**

1. **Check Database Status**
   ```bash
   # PostgreSQL
   docker-compose exec postgres pg_isready
   
   # SQLite
   ls -la data/cubcen.db
   sqlite3 data/cubcen.db ".tables"
   ```

2. **Restart Database**
   ```bash
   docker-compose restart postgres
   ```

3. **Check Connection String**
   ```bash
   # Verify DATABASE_URL in environment
   docker-compose exec cubcen printenv DATABASE_URL
   ```

4. **Test Connection**
   ```bash
   docker-compose exec cubcen npx prisma db pull
   ```

### High Memory Usage

**Symptoms:**
- System becomes unresponsive
- Out of memory errors in logs
- High swap usage

**Actions:**

1. **Check Memory Usage**
   ```bash
   free -m
   docker stats cubcen
   ```

2. **Identify Memory Leaks**
   ```bash
   # Check application metrics
   curl http://localhost:3000/api/cubcen/v1/metrics
   
   # Check for memory leaks in logs
   docker-compose logs cubcen | grep -i "memory\|heap"
   ```

3. **Restart Service**
   ```bash
   docker-compose restart cubcen
   ```

4. **Scale Resources**
   ```bash
   # Increase memory limits in docker-compose.yml
   services:
     cubcen:
       deploy:
         resources:
           limits:
             memory: 2G
   ```

### Platform Integration Failures

**Symptoms:**
- Agent discovery fails
- Platform connection errors
- Authentication failures with external platforms

**Actions:**

1. **Check Platform Status**
   ```bash
   # n8n
   curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
     "$N8N_BASE_URL/api/v1/workflows"
   
   # Make.com
   curl -H "Authorization: Bearer $MAKE_TOKEN" \
     "$MAKE_BASE_URL/api/v2/scenarios"
   ```

2. **Verify Credentials**
   ```bash
   # Check environment variables
   docker-compose exec cubcen printenv | grep -E "(N8N|MAKE)_"
   ```

3. **Test Connectivity**
   ```bash
   # Network connectivity
   docker-compose exec cubcen ping -c 3 your-n8n-instance.com
   docker-compose exec cubcen nslookup us1.make.com
   ```

4. **Check Rate Limits**
   ```bash
   # Review API response headers for rate limit info
   curl -I -H "X-N8N-API-KEY: $N8N_API_KEY" \
     "$N8N_BASE_URL/api/v1/workflows"
   ```

## Routine Maintenance

### Daily Checks

**Morning Health Check (5 minutes)**

```bash
#!/bin/bash
# daily-health-check.sh

echo "=== Cubcen Daily Health Check - $(date) ==="

# 1. Service status
echo "1. Service Status:"
curl -s http://localhost:3000/api/cubcen/v1/health | jq .

# 2. System resources
echo "2. System Resources:"
echo "  CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')%"
echo "  Memory: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "  Disk: $(df -h / | awk 'NR==2{print $5}')"

# 3. Database status
echo "3. Database Status:"
docker-compose exec -T cubcen npx prisma db pull > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  Database: OK"
else
    echo "  Database: ERROR"
fi

# 4. Recent errors
echo "4. Recent Errors (last hour):"
docker-compose logs --since=1h cubcen | grep -i error | wc -l

# 5. Active agents
echo "5. Active Agents:"
curl -s http://localhost:3000/api/cubcen/v1/agents | jq '.data | length'

echo "=== Health Check Complete ==="
```

### Weekly Maintenance

**Every Sunday at 2 AM**

```bash
#!/bin/bash
# weekly-maintenance.sh

echo "=== Weekly Maintenance - $(date) ==="

# 1. Create backup
echo "Creating weekly backup..."
curl -X POST http://localhost:3000/api/cubcen/v1/backup

# 2. Clean up old logs
echo "Cleaning up old logs..."
find logs/ -name "*.log" -mtime +7 -delete

# 3. Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 4. Restart services for fresh start
echo "Restarting services..."
docker-compose restart

# 5. Verify everything is working
sleep 30
curl -f http://localhost:3000/api/cubcen/v1/health

echo "=== Weekly Maintenance Complete ==="
```

### Monthly Maintenance

**First Sunday of each month**

```bash
#!/bin/bash
# monthly-maintenance.sh

echo "=== Monthly Maintenance - $(date) ==="

# 1. Full system backup
echo "Creating full system backup..."
tar -czf "/backups/cubcen-full-$(date +%Y%m%d).tar.gz" \
  /opt/cubcen/data \
  /opt/cubcen/logs \
  /opt/cubcen/.env \
  /opt/cubcen/docker-compose.yml

# 2. Database optimization
echo "Optimizing database..."
docker-compose exec -T postgres psql -U cubcen -c "VACUUM ANALYZE;"

# 3. Clean up old backups
echo "Cleaning up old backups..."
find /backups -name "cubcen-*" -mtime +90 -delete

# 4. Security updates
echo "Applying security updates..."
sudo apt update && sudo apt upgrade -y

# 5. Docker cleanup
echo "Cleaning up Docker resources..."
docker system prune -f
docker volume prune -f

# 6. Performance report
echo "Generating performance report..."
curl -s http://localhost:3000/api/cubcen/v1/analytics/performance > \
  "/reports/performance-$(date +%Y%m).json"

echo "=== Monthly Maintenance Complete ==="
```

## Monitoring and Alerting

### Health Check Monitoring

**Continuous Health Monitoring**

```bash
#!/bin/bash
# health-monitor.sh

SLACK_WEBHOOK="your-slack-webhook-url"
SERVICE_URL="http://localhost:3000/api/cubcen/v1/health"
ALERT_FILE="/tmp/cubcen-alert-sent"

while true; do
    if curl -f -s $SERVICE_URL > /dev/null; then
        # Service is healthy
        if [ -f "$ALERT_FILE" ]; then
            # Send recovery notification
            curl -X POST -H 'Content-type: application/json' \
                --data '{"text":"✅ Cubcen service has recovered!"}' \
                $SLACK_WEBHOOK
            rm "$ALERT_FILE"
        fi
    else
        # Service is down
        if [ ! -f "$ALERT_FILE" ]; then
            # Send alert (only once)
            curl -X POST -H 'Content-type: application/json' \
                --data '{"text":"🚨 Cubcen service is down! Investigating..."}' \
                $SLACK_WEBHOOK
            touch "$ALERT_FILE"
            
            # Attempt automatic recovery
            docker-compose restart cubcen
        fi
    fi
    
    sleep 60
done
```

### Performance Monitoring

**Resource Usage Alerts**

```bash
#!/bin/bash
# resource-monitor.sh

SLACK_WEBHOOK="your-slack-webhook-url"

# CPU threshold (80%)
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"⚠️ High CPU usage: ${CPU_USAGE}%\"}" \
        $SLACK_WEBHOOK
fi

# Memory threshold (85%)
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
if (( $(echo "$MEMORY_USAGE > 85" | bc -l) )); then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"⚠️ High memory usage: ${MEMORY_USAGE}%\"}" \
        $SLACK_WEBHOOK
fi

# Disk threshold (90%)
DISK_USAGE=$(df / | awk 'NR==2{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"⚠️ High disk usage: ${DISK_USAGE}%\"}" \
        $SLACK_WEBHOOK
fi
```

### Log Monitoring

**Error Log Monitoring**

```bash
#!/bin/bash
# log-monitor.sh

SLACK_WEBHOOK="your-slack-webhook-url"
LOG_FILE="/opt/cubcen/logs/error.log"
LAST_CHECK_FILE="/tmp/last-log-check"

# Get timestamp of last check
if [ -f "$LAST_CHECK_FILE" ]; then
    LAST_CHECK=$(cat "$LAST_CHECK_FILE")
else
    LAST_CHECK=$(date -d "1 hour ago" +%s)
fi

# Find new errors since last check
NEW_ERRORS=$(awk -v since="$LAST_CHECK" '
    {
        # Extract timestamp from log line
        if (match($0, /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}/)) {
            timestamp = substr($0, RSTART, RLENGTH)
            cmd = "date -d \"" timestamp "\" +%s"
            cmd | getline epoch
            close(cmd)
            
            if (epoch > since) {
                print $0
            }
        }
    }
' "$LOG_FILE")

if [ -n "$NEW_ERRORS" ]; then
    # Send alert with error count
    ERROR_COUNT=$(echo "$NEW_ERRORS" | wc -l)
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🔥 $ERROR_COUNT new errors in Cubcen logs\"}" \
        $SLACK_WEBHOOK
fi

# Update last check timestamp
date +%s > "$LAST_CHECK_FILE"
```

## Backup and Recovery

### Automated Backup Verification

**Daily Backup Verification**

```bash
#!/bin/bash
# backup-verify.sh

echo "=== Backup Verification - $(date) ==="

# 1. List recent backups
BACKUPS=$(curl -s http://localhost:3000/api/cubcen/v1/backup | jq -r '.data[].id' | head -3)

for BACKUP_ID in $BACKUPS; do
    echo "Verifying backup: $BACKUP_ID"
    
    # 2. Get backup metadata
    METADATA=$(curl -s "http://localhost:3000/api/cubcen/v1/backup/$BACKUP_ID")
    
    # 3. Check file exists and size
    BACKUP_PATH=$(echo "$METADATA" | jq -r '.path')
    EXPECTED_SIZE=$(echo "$METADATA" | jq -r '.size')
    
    if [ -f "$BACKUP_PATH" ]; then
        ACTUAL_SIZE=$(stat -c%s "$BACKUP_PATH")
        if [ "$ACTUAL_SIZE" -eq "$EXPECTED_SIZE" ]; then
            echo "  ✅ Backup file integrity OK"
        else
            echo "  ❌ Backup file size mismatch"
        fi
    else
        echo "  ❌ Backup file missing"
    fi
done

echo "=== Backup Verification Complete ==="
```

### Disaster Recovery Procedure

**Complete System Recovery**

```bash
#!/bin/bash
# disaster-recovery.sh

echo "=== DISASTER RECOVERY PROCEDURE ==="
echo "This will restore Cubcen from backup"
echo "Press Ctrl+C to cancel, or wait 10 seconds to continue..."
sleep 10

# 1. Stop all services
echo "Stopping services..."
docker-compose down

# 2. Backup current state (if possible)
echo "Creating emergency backup of current state..."
mkdir -p /tmp/emergency-backup
cp -r data/ /tmp/emergency-backup/ 2>/dev/null || true
cp -r logs/ /tmp/emergency-backup/ 2>/dev/null || true

# 3. List available backups
echo "Available backups:"
curl -s http://localhost:3000/api/cubcen/v1/backup | jq -r '.data[] | "\(.id) - \(.createdAt)"'

# 4. Prompt for backup selection
read -p "Enter backup ID to restore: " BACKUP_ID

# 5. Restore from backup
echo "Restoring from backup: $BACKUP_ID"
curl -X POST -H "Content-Type: application/json" \
    -d "{\"backupId\":\"$BACKUP_ID\"}" \
    http://localhost:3000/api/cubcen/v1/backup/restore

# 6. Start services
echo "Starting services..."
docker-compose up -d

# 7. Wait for startup
echo "Waiting for services to start..."
sleep 30

# 8. Verify recovery
echo "Verifying recovery..."
if curl -f http://localhost:3000/api/cubcen/v1/health; then
    echo "✅ Recovery successful!"
else
    echo "❌ Recovery failed - check logs"
    docker-compose logs cubcen
fi

echo "=== DISASTER RECOVERY COMPLETE ==="
```

## Performance Optimization

### Database Performance Tuning

**PostgreSQL Optimization**

```bash
#!/bin/bash
# db-optimize.sh

echo "=== Database Optimization ==="

# 1. Analyze query performance
echo "Analyzing slow queries..."
docker-compose exec postgres psql -U cubcen -c "
    SELECT query, mean_time, calls, total_time
    FROM pg_stat_statements 
    WHERE mean_time > 100
    ORDER BY mean_time DESC 
    LIMIT 10;"

# 2. Check index usage
echo "Checking index usage..."
docker-compose exec postgres psql -U cubcen -c "
    SELECT schemaname, tablename, attname, n_distinct, correlation
    FROM pg_stats
    WHERE schemaname = 'public'
    ORDER BY n_distinct DESC;"

# 3. Vacuum and analyze
echo "Running VACUUM ANALYZE..."
docker-compose exec postgres psql -U cubcen -c "VACUUM ANALYZE;"

# 4. Update statistics
echo "Updating table statistics..."
docker-compose exec postgres psql -U cubcen -c "ANALYZE;"

echo "=== Database Optimization Complete ==="
```

### Application Performance Tuning

**Memory and CPU Optimization**

```bash
#!/bin/bash
# app-optimize.sh

echo "=== Application Optimization ==="

# 1. Check memory usage patterns
echo "Memory usage analysis:"
docker stats --no-stream cubcen

# 2. Analyze garbage collection
echo "Checking GC performance..."
docker-compose exec cubcen node -e "
    console.log('Memory Usage:', process.memoryUsage());
    console.log('Uptime:', process.uptime());
"

# 3. Check for memory leaks
echo "Memory leak detection..."
docker-compose logs cubcen | grep -i "heap\|memory" | tail -10

# 4. Optimize Node.js settings
echo "Applying Node.js optimizations..."
# Add to docker-compose.yml:
# environment:
#   - NODE_OPTIONS=--max-old-space-size=2048 --optimize-for-size

echo "=== Application Optimization Complete ==="
```

## Security Procedures

### Security Audit

**Monthly Security Check**

```bash
#!/bin/bash
# security-audit.sh

echo "=== Security Audit - $(date) ==="

# 1. Check for vulnerable dependencies
echo "Checking for vulnerable dependencies..."
docker-compose exec cubcen npm audit --audit-level=high

# 2. Check SSL certificate expiry
echo "Checking SSL certificate..."
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | \
    openssl x509 -noout -dates

# 3. Check file permissions
echo "Checking file permissions..."
find /opt/cubcen -type f -perm /o+w -ls

# 4. Check for exposed secrets
echo "Checking for exposed secrets..."
grep -r "password\|secret\|key" /opt/cubcen --exclude-dir=node_modules | \
    grep -v ".env.example"

# 5. Check open ports
echo "Checking open ports..."
netstat -tulpn | grep LISTEN

# 6. Check failed login attempts
echo "Checking authentication logs..."
docker-compose logs cubcen | grep -i "authentication\|login" | grep -i "fail\|error" | tail -10

echo "=== Security Audit Complete ==="
```

### Incident Response

**Security Incident Response**

```bash
#!/bin/bash
# incident-response.sh

echo "=== SECURITY INCIDENT RESPONSE ==="
echo "This script helps respond to security incidents"

# 1. Immediate containment
echo "1. Immediate Actions:"
echo "   - Change all passwords and API keys"
echo "   - Revoke all active sessions"
echo "   - Block suspicious IP addresses"

# 2. Evidence collection
echo "2. Collecting evidence..."
mkdir -p /tmp/incident-$(date +%Y%m%d-%H%M%S)
INCIDENT_DIR="/tmp/incident-$(date +%Y%m%d-%H%M%S)"

# Copy logs
cp -r logs/ "$INCIDENT_DIR/"

# System state
ps aux > "$INCIDENT_DIR/processes.txt"
netstat -tulpn > "$INCIDENT_DIR/network.txt"
df -h > "$INCIDENT_DIR/disk.txt"

# Recent authentication attempts
docker-compose logs cubcen | grep -i "auth\|login" > "$INCIDENT_DIR/auth.log"

echo "Evidence collected in: $INCIDENT_DIR"

# 3. Notification
echo "3. Sending incident notification..."
curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚨 SECURITY INCIDENT DETECTED - Response initiated"}' \
    "$SLACK_WEBHOOK"

echo "=== INCIDENT RESPONSE INITIATED ==="
echo "Next steps:"
echo "1. Contact security team"
echo "2. Preserve evidence"
echo "3. Investigate root cause"
echo "4. Implement fixes"
echo "5. Document lessons learned"
```

## Cron Job Setup

Add these to your crontab for automated operations:

```bash
# Edit crontab
crontab -e

# Add these entries:

# Daily health check at 8 AM
0 8 * * * /opt/cubcen/scripts/daily-health-check.sh >> /var/log/cubcen-health.log 2>&1

# Weekly maintenance on Sundays at 2 AM
0 2 * * 0 /opt/cubcen/scripts/weekly-maintenance.sh >> /var/log/cubcen-maintenance.log 2>&1

# Monthly maintenance on first Sunday at 3 AM
0 3 1-7 * 0 /opt/cubcen/scripts/monthly-maintenance.sh >> /var/log/cubcen-maintenance.log 2>&1

# Backup verification daily at 9 AM
0 9 * * * /opt/cubcen/scripts/backup-verify.sh >> /var/log/cubcen-backup.log 2>&1

# Resource monitoring every 5 minutes
*/5 * * * * /opt/cubcen/scripts/resource-monitor.sh

# Log monitoring every 10 minutes
*/10 * * * * /opt/cubcen/scripts/log-monitor.sh

# Security audit monthly on 15th at 1 AM
0 1 15 * * /opt/cubcen/scripts/security-audit.sh >> /var/log/cubcen-security.log 2>&1
```

Remember to make all scripts executable:

```bash
chmod +x /opt/cubcen/scripts/*.sh
```

This runbook provides comprehensive operational procedures for managing Cubcen in production. Customize the scripts and procedures based on your specific environment and requirements.