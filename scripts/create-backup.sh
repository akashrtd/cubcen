#!/bin/bash
# Backup script for Cubcen
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cubcen_backup_$TIMESTAMP.tar.gz"

# Create backup
tar -czf "$BACKUP_FILE" data/ logs/ .env

# Keep only last 10 backups
ls -t "$BACKUP_DIR"/cubcen_backup_*.tar.gz | tail -n +11 | xargs rm -f

echo "Backup created: $BACKUP_FILE"
