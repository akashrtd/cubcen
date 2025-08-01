#!/bin/bash
# Health monitoring script for Cubcen
while true; do
  if ! curl -f -s http://localhost:3000/api/cubcen/v1/health > /dev/null; then
    echo "$(date): Health check failed" >> logs/health-monitor.log
  fi
  sleep 60
done
