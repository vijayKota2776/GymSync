#!/bin/bash
# ==========================================================================
# GymSync — Automated Backup Script
# Schedule via cron: 0 2 * * * /path/to/backup.sh
# ==========================================================================
set -e
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ssm-user/backups"
APP_DIR="/home/ssm-user/gymsync"
REGION="ap-south-1"

mkdir -p $BACKUP_DIR

echo "[$(date)] 🔄 Starting GymSync backup..."

# 1. Database backup
echo "💾 Backing up database..."
docker exec gymsync-api cp /app/data/gymsync.db /tmp/gymsync_backup.db
docker cp gymsync-api:/tmp/gymsync_backup.db $BACKUP_DIR/gymsync_db_$TIMESTAMP.db
echo "✅ Database backed up"

# 2. Docker volumes backup
echo "📦 Backing up Docker volumes..."
docker run --rm -v gymsync_api-data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/api_data_$TIMESTAMP.tar.gz -C /data .
echo "✅ Volumes backed up"

# 3. Configuration backup
echo "⚙️ Backing up configs..."
tar czf $BACKUP_DIR/config_$TIMESTAMP.tar.gz -C $APP_DIR nginx/ monitoring/ docker-compose.yml Dockerfile Dockerfile.nginx .env 2>/dev/null
echo "✅ Configs backed up"

# 4. Upload to S3 (if bucket exists)
if aws s3 ls s3://gymsync-backups 2>/dev/null; then
  echo "☁️ Uploading to S3..."
  aws s3 sync $BACKUP_DIR s3://gymsync-backups/$TIMESTAMP/ --region $REGION
  echo "✅ S3 upload complete"
fi

# 5. Cleanup old local backups (keep last 7 days)
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "[$(date)] ✅ Backup complete! Files in $BACKUP_DIR"
ls -lh $BACKUP_DIR/*$TIMESTAMP*
