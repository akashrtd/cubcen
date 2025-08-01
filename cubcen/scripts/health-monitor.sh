#!/bin/bash

# Cubcen Health Monitoring Script
# Continuously monitors application health and sends alerts

set -e

# Configuration
SERVICE_URL="${SERVICE_URL:-http://localhost:3000/api/cubcen/v1/health}"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"
EMAIL_RECIPIENT="${ALERT_EMAIL:-}"
CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-60}"
ALERT_COOLDOWN="${ALERT_COOLDOWN:-300}"  # 5 minutes
LOG_FILE="/var/log/cubcen-health-monitor.log"
STATE_FILE="/tmp/cubcen-health-state"

# Alert state tracking
LAST_ALERT_FILE="/tmp/cubcen-last-alert"
CONSECUTIVE_FAILURES=0
MAX_FAILURES=3

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Send Slack notification
send_slack_alert() {
    local message="$1"
    local emoji="$2"
    local color="$3"
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        local payload=$(cat << EOF
{
    "text": "$emoji Cubcen Health Alert",
    "attachments": [
        {
            "color": "$color",
            "fields": [
                {
                    "title": "Status",
                    "value": "$message",
                    "short": false
                },
                {
                    "title": "Timestamp",
                    "value": "$(date '+%Y-%m-%d %H:%M:%S')",
                    "short": true
                },
                {
                    "title": "Server",
                    "value": "$(hostname)",
                    "short": true
                }
            ]
        }
    ]
}
EOF
        )
        
        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" \
            "$SLACK_WEBHOOK" 2>/dev/null || log "WARN" "Failed to send Slack notification"
    fi
}

# Send email notification
send_email_alert() {
    local subject="$1"
    local message="$2"
    
    if [ -n "$EMAIL_RECIPIENT" ] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "$subject" "$EMAIL_RECIPIENT" 2>/dev/null || \
            log "WARN" "Failed to send email notification"
    fi
}

# Check if we should send alert (respects cooldown)
should_send_alert() {
    local current_time=$(date +%s)
    
    if [ -f "$LAST_ALERT_FILE" ]; then
        local last_alert_time=$(cat "$LAST_ALERT_FILE")
        local time_diff=$((current_time - last_alert_time))
        
        if [ $time_diff -lt $ALERT_COOLDOWN ]; then
            return 1  # Don't send alert
        fi
    fi
    
    echo "$current_time" > "$LAST_ALERT_FILE"
    return 0  # Send alert
}

# Perform comprehensive health check
perform_health_check() {
    local health_status="healthy"
    local issues=()
    
    # 1. Basic HTTP health check
    local http_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SERVICE_URL" 2>/dev/null || echo "000")
    
    if [ "$http_status" != "200" ]; then
        health_status="unhealthy"
        issues+=("HTTP health check failed (status: $http_status)")
    fi
    
    # 2. Detailed health endpoint check
    if [ "$http_status" = "200" ]; then
        local health_response=$(curl -s --max-time 10 "$SERVICE_URL" 2>/dev/null || echo "{}")
        
        # Check if response is valid JSON
        if ! echo "$health_response" | jq . > /dev/null 2>&1; then
            health_status="unhealthy"
            issues+=("Invalid JSON response from health endpoint")
        else
            # Check specific health indicators
            local db_status=$(echo "$health_response" | jq -r '.checks.database.status // "unknown"')
            local memory_status=$(echo "$health_response" | jq -r '.checks.memory.status // "unknown"')
            
            if [ "$db_status" != "healthy" ]; then
                health_status="degraded"
                issues+=("Database health check failed: $db_status")
            fi
            
            if [ "$memory_status" != "healthy" ]; then
                health_status="degraded"
                issues+=("Memory health check failed: $memory_status")
            fi
        fi
    fi
    
    # 3. Docker container check
    if command -v docker &> /dev/null; then
        local container_status=$(docker-compose ps -q cubcen 2>/dev/null | xargs docker inspect --format='{{.State.Status}}' 2>/dev/null || echo "unknown")
        
        if [ "$container_status" != "running" ]; then
            health_status="unhealthy"
            issues+=("Docker container not running (status: $container_status)")
        fi
    fi
    
    # 4. System resource checks
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}' 2>/dev/null || echo "0")
    local memory_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}' 2>/dev/null || echo "0")
    local disk_usage=$(df / | awk 'NR==2{print $5}' | sed 's/%//' 2>/dev/null || echo "0")
    
    # CPU threshold: 90%
    if (( $(echo "$cpu_usage > 90" | bc -l 2>/dev/null || echo "0") )); then
        health_status="degraded"
        issues+=("High CPU usage: ${cpu_usage}%")
    fi
    
    # Memory threshold: 90%
    if (( $(echo "$memory_usage > 90" | bc -l 2>/dev/null || echo "0") )); then
        health_status="degraded"
        issues+=("High memory usage: ${memory_usage}%")
    fi
    
    # Disk threshold: 85%
    if [ "$disk_usage" -gt 85 ] 2>/dev/null; then
        health_status="degraded"
        issues+=("High disk usage: ${disk_usage}%")
    fi
    
    # Return results
    echo "$health_status"
    printf '%s\n' "${issues[@]}"
}

# Handle health status change
handle_status_change() {
    local new_status="$1"
    local issues="$2"
    local previous_status=""
    
    # Read previous status
    if [ -f "$STATE_FILE" ]; then
        previous_status=$(cat "$STATE_FILE")
    fi
    
    # Save current status
    echo "$new_status" > "$STATE_FILE"
    
    case "$new_status" in
        "healthy")
            if [ "$previous_status" != "healthy" ] && [ -n "$previous_status" ]; then
                # Recovery
                log "INFO" "Service recovered - status: healthy"
                
                if should_send_alert; then
                    send_slack_alert "Service has recovered and is now healthy" "✅" "good"
                    send_email_alert "Cubcen Service Recovered" "The Cubcen service has recovered and is now healthy."
                fi
                
                CONSECUTIVE_FAILURES=0
            fi
            ;;
            
        "degraded")
            log "WARN" "Service degraded - issues: $issues"
            
            if [ "$previous_status" = "healthy" ] && should_send_alert; then
                send_slack_alert "Service is degraded: $issues" "⚠️" "warning"
                send_email_alert "Cubcen Service Degraded" "The Cubcen service is experiencing issues: $issues"
            fi
            ;;
            
        "unhealthy")
            ((CONSECUTIVE_FAILURES++))
            log "ERROR" "Service unhealthy (failure #$CONSECUTIVE_FAILURES) - issues: $issues"
            
            if [ $CONSECUTIVE_FAILURES -ge $MAX_FAILURES ] && should_send_alert; then
                send_slack_alert "Service is unhealthy after $CONSECUTIVE_FAILURES consecutive failures: $issues" "❌" "danger"
                send_email_alert "Cubcen Service Down" "The Cubcen service is down after $CONSECUTIVE_FAILURES consecutive failures: $issues"
                
                # Attempt automatic recovery
                attempt_recovery
            fi
            ;;
    esac
}

# Attempt automatic recovery
attempt_recovery() {
    log "INFO" "Attempting automatic recovery..."
    
    # Try restarting the service
    if command -v docker-compose &> /dev/null; then
        log "INFO" "Restarting Docker containers..."
        
        cd "$(dirname "$(dirname "$0")")" || return 1
        
        if docker-compose restart cubcen; then
            log "INFO" "Container restart initiated"
            
            # Wait for service to come back up
            sleep 30
            
            # Check if recovery was successful
            local recovery_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SERVICE_URL" 2>/dev/null || echo "000")
            
            if [ "$recovery_status" = "200" ]; then
                log "INFO" "Automatic recovery successful"
                send_slack_alert "Automatic recovery successful - service restarted" "🔄" "good"
            else
                log "ERROR" "Automatic recovery failed - manual intervention required"
                send_slack_alert "Automatic recovery failed - manual intervention required" "🚨" "danger"
            fi
        else
            log "ERROR" "Failed to restart containers"
        fi
    fi
}

# Generate health report
generate_health_report() {
    local status="$1"
    local issues="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    cat << EOF
Cubcen Health Report - $timestamp

Status: $status
Server: $(hostname)
Service URL: $SERVICE_URL

System Resources:
- CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}' 2>/dev/null || echo "N/A")%
- Memory Usage: $(free | awk 'NR==2{printf "%.1f", $3*100/$2}' 2>/dev/null || echo "N/A")%
- Disk Usage: $(df / | awk 'NR==2{print $5}' 2>/dev/null || echo "N/A")
- Load Average: $(uptime | awk -F'load average:' '{print $2}' 2>/dev/null || echo "N/A")

Docker Status:
$(docker-compose ps 2>/dev/null || echo "Docker Compose not available")

Issues:
$issues

EOF
}

# Main monitoring loop
main() {
    log "INFO" "Starting Cubcen health monitoring (PID: $$)"
    log "INFO" "Service URL: $SERVICE_URL"
    log "INFO" "Check interval: ${CHECK_INTERVAL}s"
    
    # Trap signals for graceful shutdown
    trap 'log "INFO" "Health monitor shutting down"; exit 0' SIGTERM SIGINT
    
    while true; do
        # Perform health check
        local health_output=$(perform_health_check)
        local health_status=$(echo "$health_output" | head -1)
        local issues=$(echo "$health_output" | tail -n +2 | tr '\n' '; ')
        
        # Handle status change
        handle_status_change "$health_status" "$issues"
        
        # Log current status
        if [ "$health_status" = "healthy" ]; then
            log "DEBUG" "Health check passed"
        else
            log "WARN" "Health check issues: $issues"
        fi
        
        # Wait for next check
        sleep "$CHECK_INTERVAL"
    done
}

# Handle command line arguments
case "${1:-monitor}" in
    monitor)
        main
        ;;
    check)
        # Single health check
        health_output=$(perform_health_check)
        health_status=$(echo "$health_output" | head -1)
        issues=$(echo "$health_output" | tail -n +2)
        
        echo "Status: $health_status"
        if [ -n "$issues" ]; then
            echo "Issues:"
            echo "$issues"
        fi
        
        # Exit with appropriate code
        case "$health_status" in
            "healthy") exit 0 ;;
            "degraded") exit 1 ;;
            "unhealthy") exit 2 ;;
        esac
        ;;
    report)
        # Generate detailed report
        health_output=$(perform_health_check)
        health_status=$(echo "$health_output" | head -1)
        issues=$(echo "$health_output" | tail -n +2 | tr '\n' '\n')
        
        generate_health_report "$health_status" "$issues"
        ;;
    *)
        echo "Usage: $0 [monitor|check|report]"
        echo "  monitor - Start continuous monitoring (default)"
        echo "  check   - Perform single health check"
        echo "  report  - Generate detailed health report"
        exit 1
        ;;
esac