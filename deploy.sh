#!/bin/bash
# ==========================================================================
# GymSync — EC2 Deployment Script
# Run this in AWS Session Manager or SSH
# ==========================================================================
set -e

echo "🚀 GymSync Deployment Starting..."
echo "=================================="

# 1. Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo "📦 Installing Docker..."
  sudo apt-get update -y
  sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo usermod -aG docker $USER
  sudo systemctl enable docker
  sudo systemctl start docker
  echo "✅ Docker installed"
else
  echo "✅ Docker already installed: $(docker --version)"
fi

# 2. Install Node.js if not present (for building frontend)
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
  echo "✅ Node.js installed: $(node --version)"
else
  echo "✅ Node.js already installed: $(node --version)"
fi

# 3. Install git if not present
if ! command -v git &> /dev/null; then
  echo "📦 Installing Git..."
  sudo apt-get install -y git
fi

# 4. Clone or update repo
APP_DIR="$HOME/gymsync"
if [ -d "$APP_DIR/.git" ]; then
  echo "📥 Updating existing repo..."
  cd "$APP_DIR"
  git pull origin main
else
  echo "📥 Cloning from GitHub..."
  rm -rf "$APP_DIR"
  git clone https://github.com/vijayKota2776/GymSync.git "$APP_DIR"
  cd "$APP_DIR"
fi

# 5. Install deps and build frontend
echo "📦 Installing dependencies..."
npm install

echo "🔨 Building frontend..."
npm run build
echo "✅ Frontend built"

# 6. Create production .env
if [ ! -f "$APP_DIR/.env" ]; then
  echo "⚙️  Creating .env..."
  cat > "$APP_DIR/.env" << 'ENVFILE'
NODE_ENV=production
PORT=3001
JWT_SECRET=gymsync-prod-$(openssl rand -hex 16)
DB_PATH=/app/data/gymsync.db
ENVFILE
  echo "✅ .env created"
else
  echo "✅ .env already exists"
fi

# 7. Build and start Docker containers
echo "🐳 Building Docker containers..."
sudo docker compose down 2>/dev/null || true
sudo docker compose build --no-cache

echo "🚀 Starting containers..."
sudo docker compose up -d

# 8. Wait for API to be ready
echo "⏳ Waiting for API health check..."
sleep 10
for i in {1..12}; do
  if curl -s http://localhost/api/health | grep -q '"success":true'; then
    echo "✅ API is healthy!"
    break
  fi
  echo "   Waiting... ($i/12)"
  sleep 5
done

# 9. Seed database inside container
echo "🌱 Seeding database..."
sudo docker exec gymsync-api node server/seed.js

# 10. Show status
echo ""
echo "=================================="
echo "✅ GymSync Deployed Successfully!"
echo "=================================="
echo ""
sudo docker compose ps
echo ""
echo "🌐 Frontend: http://$(curl -s ifconfig.me)"
echo "📡 API:      http://$(curl -s ifconfig.me)/api/health"
echo "🔑 Login:    admin@gymsync.com / admin123"
echo ""
