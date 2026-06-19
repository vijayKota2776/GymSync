#!/bin/bash
# ==========================================================================
# GymSync — Health Check & Auto-Recovery Script
# Schedule via cron: */5 * * * * /path/to/health_check.sh
# ==========================================================================
LOG_FILE="/var/log/gymsync_health.log"
APP_DIR="/home/ssm-user/gymsync"

check_service() {
  local name=$1
  local url=$2
  if curl -sf --max-time 5 "$url" > /dev/null 2>&1; then
    echo "[$(date)] ✅ $name is healthy" >> $LOG_FILE
    return 0
  else
    echo "[$(date)] ❌ $name is DOWN — attempting restart" >> $LOG_FILE
    return 1
  fi
}

echo "[$(date)] 🔍 Running health checks..." >> $LOG_FILE

# Check API
if ! check_service "API" "http://localhost/api/health"; then
  cd $APP_DIR && sudo docker compose restart gymsync-api
  sleep 10
  check_service "API (after restart)" "http://localhost/api/health"
fi

# Check Nginx
if ! check_service "Nginx" "http://localhost/"; then
  cd $APP_DIR && sudo docker compose restart gymsync-web
  sleep 5
  check_service "Nginx (after restart)" "http://localhost/"
fi

# Check Prometheus
if ! check_service "Prometheus" "http://localhost:9090/-/healthy"; then
  cd $APP_DIR && sudo docker compose restart prometheus
  sleep 5
fi

# Check Grafana
if ! check_service "Grafana" "http://localhost:3000/api/health"; then
  cd $APP_DIR && sudo docker compose restart grafana
  sleep 5
fi

# Check disk usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt 85 ]; then
  echo "[$(date)] ⚠️ Disk usage at ${DISK_USAGE}% — cleaning Docker" >> $LOG_FILE
  sudo docker system prune -f >> $LOG_FILE 2>&1
fi

# Check memory
MEM_FREE=$(free -m | awk '/Mem:/ {print $7}')
if [ "$MEM_FREE" -lt 100 ]; then
  echo "[$(date)] ⚠️ Low memory (${MEM_FREE}MB free) — restarting containers" >> $LOG_FILE
  cd $APP_DIR && sudo docker compose restart
fi

echo "[$(date)] ✅ Health check complete" >> $LOG_FILE
