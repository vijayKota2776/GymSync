#!/bin/bash
# ==========================================================================
# GymSync — Setup Cron Jobs for Automation
# Run once to configure all scheduled tasks
# ==========================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "⏰ Setting up GymSync cron jobs..."

# Make scripts executable
chmod +x $SCRIPT_DIR/backup.sh
chmod +x $SCRIPT_DIR/health_check.sh

# Add cron jobs (idempotent — removes old gymsync entries first)
(crontab -l 2>/dev/null | grep -v gymsync; \
  echo "0 2 * * * $SCRIPT_DIR/backup.sh >> /var/log/gymsync_backup.log 2>&1"; \
  echo "*/5 * * * * $SCRIPT_DIR/health_check.sh"; \
  echo "0 3 * * 0 sudo docker system prune -af >> /var/log/gymsync_cleanup.log 2>&1"
) | crontab -

echo "✅ Cron jobs configured:"
crontab -l | grep -v '^$'
echo ""
echo "📋 Schedule:"
echo "  • Backup:       Every day at 2:00 AM"
echo "  • Health check: Every 5 minutes"
echo "  • Cleanup:      Every Sunday at 3:00 AM"
