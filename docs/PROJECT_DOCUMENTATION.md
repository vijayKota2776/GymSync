# GymSync Fitness Club Cloud
## Complete Project Documentation

> **Industry:** Fitness Centre & Gym Management  
> **Cloud Provider:** AWS (ap-south-1, Mumbai)  
> **Project Type:** Enterprise Cloud Platform — Production Grade  
> **Live URL:** http://13.205.58.39  
> **ALB URL:** http://gymsync-alb-1436718464.ap-south-1.elb.amazonaws.com  
> **GitHub:** https://github.com/vijayKota2776/GymSync  
> **Current Status:** Phase 1 ✅ · Phase 2 ✅ · Phase 3 ✅ · Phase 4 ✅ · Phase 5 ✅ · Phase 6 ✅  
> **Last Updated:** June 19, 2026

### Project Mind Map


---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution Strategy](#2-solution-strategy)
3. [Cloud Architecture](#3-cloud-architecture)
4. [AWS Services Chosen & Why](#4-aws-services-chosen--why)
5. [Phase 1 — Linux & Infrastructure Setup](#5-phase-1--linux--infrastructure-setup)
6. [Phase 2 — Database, Docker & Automation](#6-phase-2--database-docker--automation)
7. [Phase 3 — Full-Stack Application (React + Express)](#7-phase-3--full-stack-application-react--express)
8. [Phase 4 — Production Deployment & CI/CD](#8-phase-4--production-deployment--cicd)
9. [Phase 5 — Full Observability Stack](#9-phase-5--full-observability-stack)
10. [Phase 6 — Auto Scaling & High Availability](#10-phase-6--auto-scaling--high-availability)
11. [Real Issues Faced & How They Were Resolved](#11-real-issues-faced--how-they-were-resolved)
12. [Complete File Inventory](#12-complete-file-inventory)
13. [Database Schema Documentation](#13-database-schema-documentation)
14. [API Documentation](#14-api-documentation)
15. [Pricing Strategy](#15-pricing-strategy)
16. [Completion Tracker](#16-completion-tracker)
17. [Infrastructure Summary](#17-infrastructure-summary)

---

## 1. Problem Statement

GymSync Fitness Club Cloud is a rapidly growing fitness chain operating across multiple cities in India. Before this project, the organization was running on completely disconnected systems with no central visibility or control.

### The Pain Points

| Problem Area | Current State |
|---|---|
| Data management | Spreadsheets per branch, no central database |
| Reporting | Manual, delayed, inconsistent across branches |
| Access control | No role-based system — everyone saw everything |
| Monitoring | No server health tracking, no alerts |
| Backups | No automated backup or recovery plan |
| Scalability | Adding a new branch required rebuilding everything manually |
| Member tracking | Paper logs, no attendance or churn visibility |
| Equipment | No tracking of maintenance cycles or usage hours |
| Revenue | No real-time revenue visibility across branches |
| Workflows | No digital approval chain for leave, purchases, complaints |

### What GymSync Needed

A centralized cloud platform capable of:

- Running operational management for all branches from one place
- Providing real-time analytics, KPIs, and executive dashboards
- Enforcing role-based access so admins, managers, trainers, and receptionists each see only what they need
- Monitoring infrastructure health 24/7 with proactive alerts
- Handling disaster recovery with defined RPO (24h) and RTO (2h) targets
- Scaling to new cities and regions without architectural changes
- Automating workflows like leave requests, equipment purchases, and member complaints
- Providing infrastructure cost transparency with optimization recommendations

### Technical Requirements from the PS

The solution had to cover **all** of these domains:

| Domain | Requirement |
|---|---|
| **Cloud Architecture** | Scalable compute, storage, networking, high availability, elasticity, multi-region deployment concepts |
| **Linux Administration** | Server config, users/groups, permissions, package management, process monitoring, system logs, cron automation |
| **Cloud VM Deployment** | Nginx web services on cloud VMs, SSH access, systemctl, SCP and Git deployments |
| **Cloud Databases** | MySQL/MariaDB with operational records, analytics, backup and recovery strategies |
| **Docker & Containerisation** | Containerised services, lifecycle management, Docker Hub images, multi-container orchestration |
| **Cloud Networking** | VPC, subnets, IP addressing, public/private access, firewall rules, security groups |
| **Monitoring & Resource Management** | CPU, memory, storage, application logs, performance metrics |
| **Automation** | Shell scripts for deployments, backups, web server config, maintenance tasks |

### Product Building Requirements

| Requirement | Description |
|---|---|
| Operational Dashboard | Real-time visibility into all platform metrics and KPIs |
| Role-Based Access | Appropriate data access for admins, managers, trainers, receptionists |
| Reporting & Analytics | Data-driven decision-making across all departments |
| Workflow Management | Approval chains, task assignments, process automation |
| Monitoring Dashboard | Proactive incident response and resource optimization |
| Database Records | Data integrity, auditability, and compliance |
| Executive Reporting | Aggregated performance insights for leadership |
| Scalability Management | Future geographic and operational growth |

### Pricing Requirements

| Requirement |
|---|
| Infrastructure pricing estimates (compute, storage, network) |
| Cost breakdown by service tier and usage pattern |
| Monitoring and analytics costs with SLA-based tiers |
| Backup and disaster recovery costs (RPO/RTO aligned) |
| Multi-city and multi-region deployment costs |
| Infrastructure optimization recommendations |

---

## 2. Solution Strategy

### Why AWS

We chose **AWS (Amazon Web Services)** as the cloud provider for these reasons:

| Reason | Detail |
|---|---|
| Industry standard | Most recognized in job market and enterprise environments |
| Mumbai region | ap-south-1 gives lowest latency to all Indian branches |
| Free tier | Covers almost the entire project: EC2, RDS, S3, CloudWatch |
| Security | IAM, VPC, Security Groups are powerful, well-documented, and free |
| Fallback access | SSM Session Manager provides browser-based shell when SSH fails |
| Scaling path | ALB, ASG, Multi-AZ are built-in — no migration needed |

### Design Principles Followed

| Principle | Implementation |
|---|---|
| **Private by default** | Database never exposed to internet, internal traffic only |
| **Least privilege** | IAM roles scoped to only what each service needs |
| **No hardcoded credentials** | All secrets in `.env` files with `chmod 600` or IAM roles |
| **Automation first** | Backups, health checks, and alerts all run on cron, not manual |
| **Free tier maximised** | Every service chosen to stay within free tier limits |
| **Container-first** | All application services run in Docker for portability |
| **Infrastructure as Code** | Docker Compose for containers, shell scripts for AWS resources |

### Technology Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast build times, component-based architecture, modern ecosystem |
| **Backend** | Node.js 22 + Express.js | JavaScript full-stack, lightweight, excellent for APIs |
| **Database** | SQLite (better-sqlite3) | Zero-config, file-based, perfect for single-server deployment |
| **Database (Managed)** | AWS RDS MySQL 8.4 | Automated backups, deletion protection, managed patches |
| **Web Server** | Nginx Alpine | Lightweight reverse proxy, serves static React build |
| **Containerization** | Docker + Docker Compose | Multi-container orchestration, reproducible deployments |
| **Monitoring** | Prometheus + Grafana | Industry-standard metrics collection and visualization |
| **CI/CD** | GitHub Actions | Free for public repos, integrated with Git workflow |
| **Styling** | Vanilla CSS (dark theme) | Full control, no framework dependencies, premium aesthetic |

### High-Level Architecture


```
┌──────────────────────────────────────────────────────────┐
│                        Internet                           │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│              Application Load Balancer                    │
│         gymsync-alb (Multi-AZ: 1a + 1b)                  │
│         DNS: gymsync-alb-*.ap-south-1.elb.amazonaws.com  │
└────────────────────────┬─────────────────────────────────┘
                         │ Port 80
┌────────────────────────▼─────────────────────────────────┐
│                   EC2 Instance                            │
│            t3.micro · Elastic IP 13.205.58.39             │
│            VPC: vpc-0395bd899a31f2d10                     │
│            Subnet: subnet-0949dfddc28b2156f (1a)          │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            Docker Container Stack                    │ │
│  │                                                     │ │
│  │  ┌──────────────┐  ┌──────────────┐                │ │
│  │  │ gymsync-web  │  │ gymsync-api  │                │ │
│  │  │ nginx:alpine │  │ node:22      │                │ │
│  │  │  Port 80     │──│  Port 3001   │                │ │
│  │  └──────────────┘  └──────┬───────┘                │ │
│  │                           │                         │ │
│  │  ┌──────────────┐  ┌─────▼────────┐                │ │
│  │  │ prometheus   │  │  SQLite DB   │                │ │
│  │  │  Port 9090   │  │ gymsync.db   │                │ │
│  │  └──────────────┘  └──────────────┘                │ │
│  │                                                     │ │
│  │  ┌──────────────┐  ┌──────────────┐                │ │
│  │  │   grafana    │  │ node-exporter│                │ │
│  │  │  Port 3000   │  │  Port 9100   │                │ │
│  │  └──────────────┘  └──────────────┘                │ │
│  │                                                     │ │
│  │  ┌──────────────┐                                  │ │
│  │  │   cAdvisor   │                                  │ │
│  │  │  Port 8080   │                                  │ │
│  │  └──────────────┘                                  │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│              AWS RDS MySQL 8.4                            │
│         db.t3.micro · Private subnet                     │
│         7-day automated backups                          │
│         Deletion protection: ON                          │
└──────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│         Auto Scaling Group (gymsync-asg)                  │
│         Min: 1 · Max: 3 · Desired: 1                     │
│         CPU Target: 70%                                  │
│         Launch Template: gymsync-lt                       │
│         AMI: ami-07101e70602524a82                        │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Cloud Architecture

### VPC Design


```
gymsync-vpc  (10.0.0.0/16)  —  VPC ID: vpc-0395bd899a31f2d10
│
├── Public Subnet 1   10.0.0.0/20    (ap-south-1a)
│     ├── subnet-0949dfddc28b2156f
│     ├── EC2 t3.micro (i-00986d4453cf86141)
│     ├── Elastic IP: 13.205.58.39
│     └── Internet Gateway attached
│
├── Public Subnet 2   10.0.144.0/20  (ap-south-1b)
│     ├── subnet-0ffe42e0460b969d7
│     └── ALB second AZ (required for Multi-AZ)
│
├── Private Subnet 1  10.0.16.0/20   (ap-south-1b)
│     ├── subnet-01e1cbb75bec89c65
│     └── RDS MySQL 8.4 (private, no public access)
│
└── Private Subnet 2  10.0.128.0/20  (ap-south-1a)
      ├── subnet-0b3baaae21c36202d
      └── RDS Subnet Group (spans 2 AZs — AWS requirement)
```

> **Design Decision:** Two subnets in different AZs were required because AWS RDS needs a DB Subnet Group spanning at least 2 Availability Zones — even for Single-AZ deployments. The ALB also requires subnets in at least 2 AZs. This was a real issue encountered during setup (see Issues #5 and #13).

### Security Group Configuration

**Security Group: sg-0399b7fe122518c65** — attached to EC2 instance

| Direction | Port | Protocol | Source | Purpose |
|---|---|---|---|---|
| Inbound | 22 | TCP | My IP only | SSH admin access |
| Inbound | 80 | TCP | 0.0.0.0/0 | HTTP web traffic |
| Inbound | 443 | TCP | 0.0.0.0/0 | HTTPS web traffic |
| Inbound | 3000 | TCP | 0.0.0.0/0 | Grafana dashboard |
| Inbound | 9090 | TCP | 0.0.0.0/0 | Prometheus UI |
| Outbound | All | All | 0.0.0.0/0 | Outgoing traffic |

### Network Flow

```
User → HTTP/HTTPS → ALB (Multi-AZ) → EC2 Elastic IP
                                          ↓
                                    Nginx (port 80)
                                     ├── /          → React SPA (static files)
                                     ├── /api/*     → Express.js (port 3001)
                                     └── /metrics   → Prometheus endpoint
                                          ↓
                                    SQLite DB (file-based)
                                          ↓
                                    RDS MySQL (backup/DR)
```

---

## 4. AWS Services Chosen & Why

### Services Used

| Service | Config | Why Chosen | Free Tier |
|---|---|---|---|
| EC2 | t3.micro, Ubuntu 22.04 | Compute for Docker containers | 750 hrs/mo (12 months) |
| EBS | 20GB gp3 | Server disk storage | 30GB free (12 months) |
| RDS | db.t3.micro, MySQL 8.4 | Managed database with auto-backups | 750 hrs/mo (12 months) |
| S3 | Standard storage | Backup storage — durable, cheap | 5GB always free |
| VPC | Custom (10.0.0.0/16) | Network isolation, subnet separation | Always free |
| Security Groups | sg-0399b7fe122518c65 | Stateful firewall at instance level | Always free |
| IAM | Roles + policies | Access control, no hardcoded credentials | Always free |
| Elastic IP | 13.205.58.39 | Static public IP survives reboots | Free while attached |
| CloudWatch | Agent + alarms | CPU, memory, disk metrics + alerts | 10 metrics free |
| SNS | Email notifications | Alert delivery on threshold breach | 1000 emails/mo free |
| SSM | Session Manager | Browser-based shell when SSH fails | Always free |
| ALB | gymsync-alb (Multi-AZ) | Load balancing across AZs | — |
| ASG | gymsync-asg (1-3 instances) | Auto-scaling on CPU utilization | — |
| AMI | ami-07101e70602524a82 | Disaster recovery snapshot | — |
| Launch Template | gymsync-lt | ASG instance configuration | Always free |

### Services Deliberately Avoided

| Service | Monthly Cost | Why Skipped |
|---|---|---|
| NAT Gateway | ~$32/mo | Replaced by direct IAM role access from EC2 |
| Route 53 | $0.50/zone/mo | Using Elastic IP directly |
| ElastiCache | ~$15/mo | Using in-memory caching in Express |
| Certificate Manager | Free (but needs domain) | No custom domain yet |
| WAF | $5+/mo | Security Groups sufficient for now |

### Cost Breakdown

| Tier | Monthly Cost | Includes |
|---|---|---|
| **Starter** | $0/mo | t2.micro, 20GB EBS, 20GB RDS, basic monitoring |
| **Growth** | $47/mo | t3.small, 50GB storage, enhanced monitoring, multi-branch |
| **Enterprise** | $180/mo | t3.medium, 100GB, full observability, multi-region, WAF |

---

## 5. Phase 1 — Linux & Infrastructure Setup

### Step 1 — AWS Account Protection

Before creating any resource:

1. **Billing → Budgets → Create Budget** — set $1 threshold with email alert so any accidental charge triggers notification immediately
2. Created IAM user with `AdministratorAccess` policy — root account never used for daily work

### Step 2 — VPC and Networking

Created via **VPC → Create VPC → VPC and more** (AWS wizard):

```
VPC name:           gymsync-vpc
VPC ID:             vpc-0395bd899a31f2d10
IPv4 CIDR:          10.0.0.0/16
Availability Zones: 2 (required for RDS + ALB)
Public subnets:     2  →  10.0.0.0/20 (1a), 10.0.144.0/20 (1b)
Private subnets:    2  →  10.0.16.0/20 (1b), 10.0.128.0/20 (1a)
NAT Gateway:        None (saves $32/mo)
DNS hostnames:      Enabled
```

### Step 3 — Security Groups

Created security group `sg-0399b7fe122518c65` with rules allowing HTTP (80), HTTPS (443), SSH (22), Grafana (3000), and Prometheus (9090). The DB security group source references the web security group ID — not an IP — so the DB access rule automatically follows the EC2 instance.

### Step 4 — EC2 Instance Launch

```
Name:               gymsync-server
Instance ID:        i-00986d4453cf86141
AMI:                Ubuntu Server 22.04 LTS (free tier eligible)
Instance type:      t3.micro (2 vCPU, 1GB RAM)
Key pair:           gymsync-key (.pem downloaded)
VPC:                gymsync-vpc
Subnet:             Public subnet (10.0.0.0/20, ap-south-1a)
Auto-assign IP:     Enabled
Security group:     sg-0399b7fe122518c65
Storage:            20GB gp3
IAM role:           dev
```

After launch: **EC2 → Elastic IPs → Allocate → Associate** to get permanent IP `13.205.58.39`.

### Step 5 — First Login and Server Setup

```bash
# SSH access
chmod 400 gymsync-key.pem
ssh -i gymsync-key.pem ubuntu@13.205.58.39

# System update
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y ca-certificates curl gnupg
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
sudo systemctl enable docker && sudo systemctl start docker

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git
```

### Step 6 — Nginx Configuration

Nginx runs inside a Docker container (nginx:alpine) and acts as a reverse proxy:

```nginx
# nginx/app.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # API reverse proxy — forwards to Express.js backend
    location /api/ {
        set $backend "http://gymsync-api:3001";
        proxy_pass $backend$request_uri;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # React SPA — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
}
```

> **Critical Fix:** The `proxy_pass` directive MUST include `$request_uri` when using a variable (`set $backend`). Without it, Nginx strips the URI path and sends all API requests to `/` instead of `/api/health`, `/api/auth/login`, etc. This caused login failures and was Issue #10.

### Step 7 — Git Deployment Setup

```bash
cd ~/gymsync
git init
git remote add origin https://github.com/vijayKota2776/GymSync.git
git push -u origin main
```

---

## 6. Phase 2 — Database, Docker & Automation

### Step 8 — Docker Compose Stack

The complete `docker-compose.yml` orchestrates 6 services:

```yaml
version: '3.8'
services:
  gymsync-api:
    build: .
    container_name: gymsync-api
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - api-data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3001
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - gymsync-net

  gymsync-web:
    build:
      context: .
      dockerfile: Dockerfile.nginx
    container_name: gymsync-web
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      gymsync-api:
        condition: service_healthy
    networks:
      - gymsync-net

  prometheus:
    image: prom/prometheus:latest
    container_name: gymsync-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    networks:
      - gymsync-net

  grafana:
    image: grafana/grafana:latest
    container_name: gymsync-grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=gymsync2026
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
    networks:
      - gymsync-net

  node-exporter:
    image: prom/node-exporter:latest
    container_name: gymsync-node-exporter
    restart: unless-stopped
    ports:
      - "9100:9100"
    networks:
      - gymsync-net

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: gymsync-cadvisor
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    networks:
      - gymsync-net

volumes:
  api-data:
  grafana-data:

networks:
  gymsync-net:
    driver: bridge
```

### Step 9 — RDS MySQL Setup

**AWS Console → RDS → Create Database:**

```
Engine:              MySQL 8.4
Template:            Free tier
DB identifier:       gymsync-db
Master username:     gymsync_admin
Instance class:      db.t3.micro
Storage:             20GB gp3
VPC:                 gymsync-vpc
Public access:       No
Initial DB name:     gymsync_prod
Backup retention:    7 days
Backup window:       03:00–04:00 UTC
Deletion protection: ON
```

### Step 10 — S3 Bucket for Backups

```
Bucket name:         gymsync-backups
Region:              ap-south-1
Block public access: ON (all options)
Versioning:          Enabled
```

IAM Role `dev` attached to EC2 with S3 access — no access keys stored on server.

### Step 11 — Backup Automation Script

Created `scripts/backup.sh` — runs daily at 2:00 AM via cron:

```bash
#!/bin/bash
# Backs up: SQLite database, Docker volumes, configuration files
# Uploads to S3 if bucket exists
# Cleans local backups older than 7 days
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ssm-user/backups"
mkdir -p $BACKUP_DIR

# 1. Database backup (copy from Docker container)
docker exec gymsync-api cp /app/data/gymsync.db /tmp/gymsync_backup.db
docker cp gymsync-api:/tmp/gymsync_backup.db $BACKUP_DIR/gymsync_db_$TIMESTAMP.db

# 2. Docker volumes backup
docker run --rm -v gymsync_api-data:/data -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/api_data_$TIMESTAMP.tar.gz -C /data .

# 3. Configuration backup
tar czf $BACKUP_DIR/config_$TIMESTAMP.tar.gz -C ~/gymsync \
  nginx/ monitoring/ docker-compose.yml Dockerfile Dockerfile.nginx .env

# 4. S3 upload (if bucket exists)
aws s3 sync $BACKUP_DIR s3://gymsync-backups/$TIMESTAMP/ --region ap-south-1

# 5. Cleanup (keep 7 days)
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### Step 12 — Health Check Script

Created `scripts/health_check.sh` — runs every 5 minutes via cron:

```bash
#!/bin/bash
# Checks: API health, Nginx, Prometheus, Grafana
# Monitors: Disk usage, memory
# Auto-restarts: Failed containers, Docker cleanup on high disk

# Service checks with auto-restart
check_service "API" "http://localhost/api/health"
check_service "Nginx" "http://localhost/"
check_service "Prometheus" "http://localhost:9090/-/healthy"
check_service "Grafana" "http://localhost:3000/api/health"

# Resource monitoring
if disk_usage > 85%: docker system prune -f
if free_memory < 100MB: docker compose restart
```

### Step 13 — Cron Job Setup

Created `scripts/setup_cron.sh`:

```bash
#!/bin/bash
# Configures three cron jobs:
# • Backup:       Every day at 2:00 AM
# • Health check: Every 5 minutes
# • Cleanup:      Every Sunday at 3:00 AM

crontab entries:
0 2 * * *    ~/gymsync/scripts/backup.sh
*/5 * * * *  ~/gymsync/scripts/health_check.sh
0 3 * * 0    sudo docker system prune -af
```

### Step 14 — CloudWatch Monitoring

**CloudWatch Agent** installed and configured to send custom metrics:

| Alarm | Metric | Threshold | Action |
|---|---|---|---|
| GymSync-HighCPU | EC2 CPUUtilization | > 80% for 5 min | SNS email |
| GymSync-HighMemory | CWAgent mem_used_percent | > 80% for 5 min | SNS email |
| GymSync-HighDisk | CWAgent disk_used_percent | > 80% for 5 min | SNS email |

SNS topic: `gymsync-alerts` — email subscription confirmed. Alerts arrive within ~60 seconds of threshold breach.

### Monitoring Architecture


---

## 7. Phase 3 — Full-Stack Application (React + Express)

Phase 3 was broken into 8 sub-phases (3A through 3H), building a complete full-stack application.

### Phase 3A — Backend REST API

Built with **Express.js** running on Node.js 22. The server provides:

- RESTful API endpoints for all CRUD operations
- JWT authentication with 24-hour token expiry
- Role-based access control middleware
- Prometheus metrics endpoint (`/api/metrics`)
- Health check endpoint (`/api/health`)
- Request logging with method, path, status, and duration

**Server structure:**
```
server/
├── index.js              # Main Express server + Prometheus metrics
├── db.js                 # SQLite schema (9 tables, WAL mode, foreign keys)
├── seed.js               # Database seeder with sample data
├── middleware/
│   ├── auth.js           # JWT authentication middleware
│   └── rbac.js           # Role-based authorization
└── routes/
    ├── auth.js           # Login/register endpoints
    ├── members.js        # Member CRUD with search/filter
    ├── branches.js       # Branch management
    ├── attendance.js     # Check-in/check-out system
    ├── equipment.js      # Equipment tracking + maintenance
    ├── revenue.js        # Revenue analytics by branch/period
    ├── reports.js        # Executive KPIs + branch comparison
    └── workflows.js      # Approval workflow CRUD
```

### Phase 3B — Authentication & RBAC

**JWT Authentication:**
- Login via `/api/auth/login` returns a JWT token
- Token contains: `{ id, email, role, branchId }`
- 24-hour expiry (configurable via `JWT_EXPIRY`)
- All protected routes require `Authorization: Bearer <token>` header

**Role-Based Access Control:**

| Role | Access Level |
|---|---|
| `admin` | All branches, all data, user management, approve workflows |
| `manager` | Own branch — members, revenue, equipment, approve workflows |
| `trainer` | Member profiles and attendance for own branch |
| `receptionist` | Check-in screen and member registration only |

**Implementation:**
```javascript
// middleware/rbac.js — restricts routes by role
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Usage in routes:
router.get('/executive', authorize('admin', 'manager'), (req, res) => { ... });
```

### Phase 3C — Frontend Dashboard (React + Vite)

Built with **React 18** and **Vite** as the build tool. The UI features:

- **Dark theme** with premium glassmorphism aesthetic
- **9 pages** with smooth animations and transitions
- **Custom SVG icons** (Lucide-style, no icon library dependency)
- **Real-time data** — gauges update every 2 seconds
- **Responsive design** — works on desktop and mobile
- **Google Fonts** — Inter for body text, JetBrains Mono for code/numbers

**Frontend structure:**
```
src/
├── App.jsx                    # Routes, auth protection, layout shell
├── main.jsx                   # React DOM entry point
├── index.css                  # Design system (CSS custom properties)
├── context/
│   └── AuthContext.jsx        # Authentication state management
├── utils/
│   └── api.js                 # Axios instance with JWT interceptor
├── data/
│   └── mockData.js            # Realistic sample data generator
├── components/
│   ├── Layout.jsx             # Sidebar + Header with navigation
│   ├── Charts.jsx             # Bar chart + Ring chart (SVG)
│   ├── Gauge.jsx              # Animated SVG gauge component
│   ├── MemberModal.jsx        # Member detail/edit modal
│   └── Toast.jsx              # Toast notification system
└── pages/
    ├── Login.jsx              # Authentication page
    ├── Overview.jsx           # Main dashboard with KPIs
    ├── Members.jsx            # Member management + search
    ├── Branches.jsx           # Multi-branch operations
    ├── Monitoring.jsx         # Live system monitoring
    ├── Activity.jsx           # Activity feed/audit log
    ├── Pricing.jsx            # Pricing + AWS cost breakdown
    ├── Workflows.jsx          # Approval workflows
    └── Reports.jsx            # Executive reporting portal
```

### Dashboard Pages — Detailed Breakdown

#### 1. Overview Dashboard (`/`)
- **KPI Cards** — Total Members, Monthly Revenue, Check-ins Today, Active Branches (with trend indicators)
- **Weekly Check-in Bar Chart** — SVG bar chart with animated bars growing on load
- **Plan Distribution Ring Chart** — SVG donut chart showing Basic/Standard/Premium split
- **Branch Performance Table** — Sortable table with city, members, revenue, occupancy
- **Live Activity Feed** — Real-time feed of member check-ins, payments, alerts

#### 2. Members Page (`/members`)
- **Search & Filter** — Real-time search across name, email, phone
- **Plan Filter** — Filter by Basic, Standard, Premium plans
- **Status Badges** — Active (green), At-Risk (orange), Frozen (blue), Inactive (gray)
- **Churn Risk** — Calculated from activity rate, displayed as percentage
- **Member Modal** — Click to view/edit full member details

#### 3. Branches Page (`/branches`)
- **Branch Cards** — Color-coded cards for each branch location
- **Per-Branch Stats** — Members, Revenue, Equipment count, Rating
- **City & Region** — Multi-city support (Mumbai, Delhi, Bangalore, Hyderabad)
- **Capacity Tracking** — Shows branch capacity vs current members

#### 4. Monitoring Page (`/monitoring`)
- **Live Gauges** — CPU, Memory, Disk usage (animated SVG, updates every 2 seconds)
- **Network I/O** — Incoming/outgoing bandwidth in MB/s
- **Docker Container Status** — 4 container cards with CPU%, memory bar, uptime
- **System Alerts** — Resolved, warning, critical, info alerts with timestamps
- **Server Information** — OS, instance type, region, IP, Docker version, backup status

#### 5. Activity Page (`/activity`)
- **Real-time Feed** — Chronological list of all system events
- **Event Types** — Check-ins, payments, membership changes, system events
- **Branch Filter** — Filter events by branch location
- **Timestamps** — Relative time (e.g., "3 minutes ago")

#### 6. Pricing Page (`/pricing`)
- **3-Tier Cards** — Starter ($0), Growth ($47), Enterprise ($180)
- **Feature Comparison** — 10 features with ✓/✗ per plan
- **AWS Cost Breakdown Table** — 10 AWS services with per-tier pricing
- **Services Covered** — EC2, EBS, RDS, S3, CloudWatch, Data Transfer, Route 53, Elastic IP, WAF

#### 7. Workflows Page (`/workflows`)
- **Create Requests** — Leave Request, Equipment Purchase, Member Complaint, Plan Change
- **Approval Chain** — Only admin/manager can approve/reject
- **Status Filter** — All, Pending, Approved, Rejected tabs
- **Requester Info** — Shows who created and who approved/rejected

#### 8. Reports Page (`/reports`)
- **Executive KPIs** — 8 metric cards (Total/Active/At-Risk members, Revenue, Growth, Churn, Branches, New)
- **Branch Comparison Table** — Side-by-side branch performance with revenue, attendance, ratings
- **Infrastructure Optimization** — 6 recommendations with impact level and estimated savings
- **Access Control** — Restricted to admin and manager roles only

#### 9. Login Page (`/login`)
- **JWT Authentication** — Email + password login
- **Remember Token** — Stored in localStorage
- **Auto-redirect** — Redirects to dashboard if already authenticated
- **Demo Credentials** — admin@gymsync.com / admin123

### Phase 3D — Attendance & Check-in System

- `/api/attendance` — GET (list with filters), POST (new check-in)
- Check-in/check-out with timestamps
- Branch-filtered attendance logs
- Used in Overview dashboard for daily check-in counts

### Phase 3E — Equipment Health Module

- `/api/equipment` — CRUD with maintenance status tracking
- Equipment types: cardio, strength, functional
- Status tracking: active, maintenance, retired
- Condition percentage and hours used
- Maintenance request integration with workflows

### Phase 3F — Revenue & Analytics

- `/api/revenue` — Revenue by branch, category, date range
- Categories: membership, day_pass, personal_training, supplements
- Monthly comparison with growth calculation
- Branch vs branch revenue comparison

### Phase 3G — Executive Reporting Portal

- `/api/reports/executive` — Aggregated KPIs across all branches
- `/api/reports/branch-comparison` — Per-branch metrics with revenue, attendance, equipment
- `/api/reports/member-growth` — Monthly new signups over 12 months
- `/api/reports/churn-analysis` — At-risk and churned member analysis
- **Access restricted to admin and manager roles**

### Phase 3H — Workflow & Approvals

- `/api/workflows` — CRUD with status filtering
- Workflow types: leave_request, equipment_purchase, member_complaint, plan_change
- Status lifecycle: pending → approved/rejected
- Approval chain: only admin/manager can approve or reject
- Audit trail: timestamps for creation and last update

---

## 8. Phase 4 — Production Deployment & CI/CD


### Step 15 — Dockerfiles

**API Dockerfile:**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server/ ./server/
RUN mkdir -p /app/data
EXPOSE 3001
CMD ["node", "server/index.js"]
```

**Nginx Dockerfile:**
```dockerfile
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/app.conf /etc/nginx/conf.d/
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 16 — GitHub Actions CI/CD Pipeline

Created `.github/workflows/deploy.yml`:

```yaml
name: Deploy to EC2
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to EC2
        run: |
          # rsync files to EC2 (excluding node_modules, .git, local DB)
          rsync -avz --delete \
            -e "ssh -i ~/.ssh/deploy_key" \
            --exclude='node_modules' --exclude='.git' --exclude='server/gymsync.db' \
            ./ $EC2_USER@$EC2_HOST:~/gymsync/

          # Rebuild and restart containers
          ssh $EC2_USER@$EC2_HOST "cd ~/gymsync && \
            docker compose down && \
            docker compose build --no-cache && \
            docker compose up -d"
      - name: Verify deployment
        run: |
          ssh $EC2_USER@$EC2_HOST "docker compose -f ~/gymsync/docker-compose.yml ps"
```

**Secrets configured in GitHub:**
- `EC2_HOST` — Elastic IP
- `EC2_USER` — ubuntu
- `SSH_PRIVATE_KEY` — gymsync-key.pem contents

### Step 17 — Deployment Script

Created `deploy.sh` for manual/first-time deployments:

```bash
#!/bin/bash
# Full deployment: Install Docker + Node.js → Clone repo → Build → Deploy
# 1. Install Docker, Node.js 22, Git (if not present)
# 2. Clone or pull from GitHub
# 3. npm install && npm run build
# 4. Create .env with secure JWT secret
# 5. docker compose build && up -d
# 6. Wait for health check
# 7. Seed database
# 8. Display status and URLs
```

### Step 18 — AMI Backup (Disaster Recovery)

Created a machine image for disaster recovery:

```
AMI ID:          ami-07101e70602524a82
AMI Name:        gymsync-production-backup
Instance:        i-00986d4453cf86141
Contains:        Full OS + Docker + all containers + database
Recovery time:   ~5 minutes (launch new instance from AMI)
```

This provides an **RTO of ~5 minutes** — just launch a new instance from the AMI and associate the Elastic IP.

---

## 9. Phase 5 — Full Observability Stack

### Step 19 — Prometheus

**Prometheus** scrapes metrics from 3 sources every 15 seconds:

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'gymsync-api'
    static_configs:
      - targets: ['gymsync-api:3001']
    metrics_path: '/api/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
```

**Application metrics exposed at `/api/metrics`:**
- `gymsync_http_requests_total` — Total HTTP requests (counter)
- `gymsync_http_request_duration_seconds` — Request latency (histogram)
- `process_heap_used_bytes` — Node.js heap memory usage
- `process_uptime_seconds` — Server uptime

### Step 20 — Grafana

**Grafana** provides visual dashboards with auto-provisioned data source:

| Panel | Metric Source | Description |
|---|---|---|
| CPU Usage | Node Exporter | Real-time CPU utilization percentage |
| Memory Usage | Node Exporter | RAM usage vs total |
| Disk I/O | Node Exporter | Read/write bytes per second |
| Network Traffic | Node Exporter | Incoming/outgoing bandwidth |
| Container CPU | cAdvisor | Per-container CPU usage |
| Container Memory | cAdvisor | Per-container memory allocation |
| HTTP Request Rate | Application | Requests per second to the API |
| Request Latency | Application | P50, P95, P99 latency |

**Access:** http://13.205.58.39:3000 — Login: `admin` / `gymsync2026`

### Step 21 — Node Exporter

**Node Exporter** runs as a Docker container and exposes system-level metrics:
- CPU, memory, disk, network statistics
- File descriptor usage
- System load averages
- Boot time and uptime

### Step 22 — cAdvisor

**cAdvisor** (Container Advisor) monitors Docker containers:
- Per-container CPU and memory usage
- Container restart counts
- Network I/O per container
- Filesystem usage per container

---

## 10. Phase 6 — Auto Scaling & High Availability

### Step 23 — Second Subnet Creation

AWS ALB requires subnets in **at least 2 different Availability Zones**. The original VPC had subnets in only 1 AZ, so a second public subnet was created:

```bash
# Create subnet in ap-south-1b
aws ec2 create-subnet \
  --vpc-id vpc-0395bd899a31f2d10 \
  --cidr-block 10.0.144.0/20 \
  --availability-zone ap-south-1b
# Result: subnet-0ffe42e0460b969d7

# Associate with public route table (Internet Gateway)
aws ec2 associate-route-table \
  --subnet-id subnet-0ffe42e0460b969d7 \
  --route-table-id <public-rtb-id>
```

### Step 24 — Launch Template

Created a launch template for the Auto Scaling Group:

```
Template ID:     lt-0bd1dc449bb98902a
Template Name:   gymsync-lt
AMI:             ami-07101e70602524a82 (our production backup)
Instance Type:   t3.micro
Security Group:  sg-0399b7fe122518c65
IAM Role:        dev
Key Pair:        gymsync-key
User Data:       Startup script to pull latest code and start Docker
```

### Step 25 — Target Group

Created an ALB target group for health-checked routing:

```
Target Group:    gymsync-tg
ARN:             arn:aws:elasticloadbalancing:ap-south-1:952834432861:targetgroup/gymsync-tg/845fe0ece3dc5a15
Protocol:        HTTP
Port:            80
Health check:    / (HTTP 200)
Registered:      i-00986d4453cf86141
```

### Step 26 — Application Load Balancer

Created an internet-facing ALB spanning 2 AZs:

```
ALB Name:        gymsync-alb
ARN:             arn:aws:elasticloadbalancing:ap-south-1:952834432861:loadbalancer/app/gymsync-alb/aec6c2ab4c40cc9f
DNS:             gymsync-alb-1436718464.ap-south-1.elb.amazonaws.com
Scheme:          internet-facing
Type:            application
Subnets:         subnet-0949dfddc28b2156f (1a) + subnet-0ffe42e0460b969d7 (1b)
Security Group:  sg-0399b7fe122518c65
Listener:        HTTP:80 → Forward to gymsync-tg
```

### Step 27 — Auto Scaling Group

```
ASG Name:        gymsync-asg
Min Capacity:    1
Max Capacity:    3
Desired:         1
Launch Template: gymsync-lt
Target Group:    gymsync-tg
```

### Step 28 — Scaling Policy

Created a target tracking scaling policy based on CPU utilization:

```
Policy Name:     gymsync-cpu-scaling
Policy Type:     TargetTrackingScaling
Metric:          ASGAverageCPUUtilization
Target Value:    70%
CloudWatch Alarms:
  - TargetTracking-gymsync-asg-AlarmHigh (scale out)
  - TargetTracking-gymsync-asg-AlarmLow (scale in)
```

**How it works:**
- When average CPU > 70% → ASG launches new instances (up to 3)
- When average CPU drops → ASG terminates extra instances (down to 1)
- Each new instance launches from the AMI with the full application stack

---

## 11. Real Issues Faced & How They Were Resolved

This section documents **every real problem** encountered during the entire project lifecycle.

---

### Issue #1 — EC2 Connection Failure (SSH Refused)

**What happened:**
- Downloaded `gymsync-key.pem` but SSH connection timed out
- EC2 Instance Connect showed: `"Instance is not in a public subnet"`

**Root cause:**
- The subnet's route table did not have a route to the Internet Gateway
- The instance had a public IP but no network path to/from the internet

**Fix:**
1. Verified route table: `VPC → Route Tables → Public subnet → 0.0.0.0/0 → igw-xxxxxxxx`
2. Enabled "Auto-assign public IP" on the subnet
3. Used **SSM Session Manager** as a workaround (requires `AmazonSSMManagedInstanceCore` IAM policy)

**Outcome:** Both SSH and SSM Session Manager now work. SSM became the primary access method.

---

### Issue #2 — S3 Access Denied from EC2

**What happened:**
```
aws s3 ls s3://gymsync-backups-gym
An error occurred (AccessDenied) when calling the ListObjectsV2 operation
```

**Root cause:** EC2 had no IAM role attached — no identity to authenticate with AWS services.

**Fix:**
1. Created IAM role `gymsync-ec2-s3-role` with `AmazonS3FullAccess`
2. Attached to EC2: Actions → Security → Modify IAM Role
3. Waited ~30 seconds for propagation

**Outcome:** EC2 can read/write S3 securely via IAM role — no keys on the server.

---

### Issue #3 — Backup Script Directory Missing

**What happened:**
```
bash: /opt/gymsync/scripts/backup.sh: No such file or directory
```

**Root cause:** The `/opt/gymsync/scripts/` directory hadn't been created yet.

**Fix:**
```bash
sudo mkdir -p /opt/gymsync/scripts /opt/gymsync/backups /var/log/gymsync
sudo chmod +x /opt/gymsync/scripts/backup.sh
```

---

### Issue #4 — Backup Script RDS Connection Failed

**What happened:** Backup log showed `FAILED — check RDS endpoint and credentials`

**Root causes:**
1. Log directory `/var/log/gymsync` didn't exist
2. Backup directory `/opt/gymsync/backups` didn't exist
3. RDS hostname was still the placeholder, not the real endpoint

**Fix:** Created directories + replaced placeholder with real RDS endpoint from AWS Console.

---

### Issue #5 — RDS Creation Refused (Multi-AZ Subnet Error)

**What happened:**
```
The DB subnet group doesn't meet Availability Zone (AZ) coverage requirement.
Current AZ coverage: ap-south-1a. Add subnets to cover at least 2 AZs.
```

**Root cause:** AWS RDS requires a DB Subnet Group spanning at least 2 AZs — even for Single-AZ deployments. The original VPC had both subnets in the same AZ.

**Fix:** Created a second private subnet in ap-south-1b, then created the DB Subnet Group spanning both AZs. Selected Single-AZ deployment to stay on free tier.

**Outcome:** RDS created successfully. Subnet group is ready for Multi-AZ upgrade without changes.

---

### Issue #6 — CloudWatch Agent Permission Denied

**What happened:**
```
Permission denied: cannot write to /etc/amazon-cloudwatch-agent.deb
```

**Root cause:** Tried to download the installer while in `/etc/` (protected system directory).

**Fix:** Changed to home directory (`cd ~`) first, then downloaded and installed.

---

### Issue #7 — Disk Metrics Not Visible in CloudWatch

**What happened:** `mem_used_percent` appeared but `disk_used_percent` was invisible in CloudWatch Console.

**Root cause:** Disk metrics are published with additional dimensions (`path`, `device`, `fstype`, `InstanceId`). Searching with wrong dimension filters hid them.

**Fix:** Found metric under `CWAgent → ImageId, InstanceId, InstanceType, device, fstype, path → disk_used_percent` with `path=/`.

---

### Issue #8 — Package-lock.json Sync Issue

**What happened:** `npm ci` on EC2 failed because `package-lock.json` was out of sync with `package.json`. New dependencies were added to `package.json` but `package-lock.json` wasn't regenerated.

**Root cause:** Running `npm install` locally after adding dependencies didn't commit the updated lockfile.

**Fix:**
```bash
# Local machine
rm -rf node_modules package-lock.json
npm install          # Regenerates fresh lockfile
git add package-lock.json && git commit && git push
```

Changed Dockerfile to use `npm install` instead of `npm ci` for more resilient builds.

---

### Issue #9 — NODE_ENV Warning During Build

**What happened:** During `npm run build`, Vite showed:
```
(!) "NODE_ENV" is set to "production" in the .env file. This breaks the build.
```

**Root cause:** The `.env` file contained `NODE_ENV=production`, which conflicts with Vite's build process (Vite sets its own NODE_ENV during build).

**Fix:** Removed `NODE_ENV` from `.env` file. The Express server uses `NODE_ENV=production` set in the Docker Compose environment section instead.

---

### Issue #10 — Nginx proxy_pass Stripping URI Path (Login Broken)

**What happened:** After deployment, login returned 404. Checking the API directly (`curl http://localhost:3001/api/health`) worked, but via Nginx (`curl http://localhost/api/health`) returned the React app HTML instead of JSON.

**Root cause:** The Nginx config used a variable for the backend URL:
```nginx
# BROKEN — strips URI path when using variable
set $backend "http://gymsync-api:3001";
proxy_pass $backend;
```

When Nginx uses a **variable** in `proxy_pass`, it does NOT append the request URI automatically. All requests to `/api/health`, `/api/auth/login`, etc. were forwarded as just `http://gymsync-api:3001/` — hitting the server root.

**Fix:**
```nginx
# FIXED — explicitly append $request_uri
set $backend "http://gymsync-api:3001";
proxy_pass $backend$request_uri;
```

**Outcome:** API calls now correctly forward the full path. Login, authentication, and all API endpoints work through Nginx.

> **Lesson Learned:** This is a well-known Nginx gotcha. When `proxy_pass` uses a variable, you MUST explicitly include `$request_uri`. Without a variable (`proxy_pass http://backend:3001/`), Nginx appends the URI automatically.

---

### Issue #11 — Docker Compose Bake Warning

**What happened:** Every `docker compose build` showed:
```
WARN[0000] Docker Compose is configured to build using Bake, but buildx isn't installed
```

**Root cause:** Docker Compose v2 tries to use BuildKit/Bake for builds, but the `docker-buildx-plugin` wasn't installed on the EC2 instance.

**Impact:** Warning only — standard `docker compose build` works correctly without Bake.

**Status:** Non-blocking. The warning can be suppressed by installing `docker-buildx-plugin` or ignored.

---

### Issue #12 — EC2 Instance Stuck in "Stopping" State

**What happened:** After stopping the EC2 instance from the AWS Console, clicking "Start instance" showed:
```
Failed to start the instance i-00986d4453cf86141
The instance is not in a state from which it can be started.
```

**Root cause:** The instance was still in the **"Stopping"** state — it takes 30-60 seconds for EC2 to fully stop an instance. During this transition, no state changes are allowed.

**Fix:** Waited ~45 seconds, refreshed the console page, and the state changed to "Stopped". Then "Start instance" worked immediately.

**Outcome:** Instance started successfully. Elastic IP (`13.205.58.39`) remained attached. Docker containers auto-restarted due to `restart: unless-stopped` policy.

---

### Issue #13 — ALB Creation Failed (Subnet AZ Error)

**What happened:**
```
An error occurred (InvalidConfigurationRequest) when calling the CreateLoadBalancer operation:
A load balancer cannot be attached to multiple subnets in the same Availability Zone
```

**Root cause:** Both subnets passed to the ALB `create-load-balancer` command were in the **same AZ** (ap-south-1b). ALB requires subnets in at least **2 different AZs**.

**Investigation:**
```bash
aws ec2 describe-subnets --filters "Name=vpc-id,Values=vpc-0395bd899a31f2d10" \
  --query 'Subnets[*].[SubnetId,AvailabilityZone,CidrBlock]' --output table
```

This revealed:
```
subnet-0949dfddc28b2156f  ap-south-1a  10.0.0.0/20     ← EC2 is here
subnet-0ffe42e0460b969d7  ap-south-1b  10.0.144.0/20   ← Created for ALB
subnet-01e1cbb75bec89c65  ap-south-1b  10.0.16.0/20
subnet-0b3baaae21c36202d  ap-south-1a  10.0.128.0/20
```

The original Phase 6 script used `subnet-01e1cbb75bec89c65` (1b) and `subnet-0ffe42e0460b969d7` (1b) — both in the same AZ!

**Fix:** Used the correct pair — one from each AZ:
```bash
# ap-south-1a + ap-south-1b
aws elbv2 create-load-balancer --name gymsync-alb \
  --subnets subnet-0949dfddc28b2156f subnet-0ffe42e0460b969d7 \
  --security-groups sg-0399b7fe122518c65 \
  --scheme internet-facing --type application
```

**Outcome:** ALB created successfully spanning both AZs.

---

### Issue #14 — ALB Listener Failed (Error in Variable)

**What happened:** The ALB was created, but the listener creation failed with:
```
Unknown options: occurred, (DuplicateLoadBalancerName), when, calling, the, CreateLoadBalancer, operation...
```

**Root cause:** The ALB creation command stored its error message (about duplicate name) into the `$ALB_ARN` variable. The listener creation then tried to use this error string as the ALB ARN, which AWS CLI interpreted as unknown options.

**Fix:** Retrieved the actual ALB ARN from AWS directly:
```bash
ALB_ARN=$(aws elbv2 describe-load-balancers --names gymsync-alb \
  --query 'LoadBalancers[0].LoadBalancerArn' --output text)
aws elbv2 create-listener --load-balancer-arn $ALB_ARN \
  --protocol HTTP --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN
```

**Outcome:** Listener created successfully, forwarding ALB traffic to the target group.

---

### Issue #15 — Database Lost After Docker Rebuild

**What happened:** After running `docker compose build --no-cache` and `docker compose up -d`, the application showed no data — all members, branches, and workflows were missing.

**Root cause:** The SQLite database file (`gymsync.db`) lives inside the Docker container at `/app/data/`. Using `--no-cache` rebuilds the container from scratch, creating a new empty database.

**Fix:** Re-seed the database after every rebuild:
```bash
sudo docker exec gymsync-api node server/seed.js
```

The seed script is idempotent — it checks if data exists before inserting:
```javascript
const existing = db.prepare("SELECT COUNT(*) as c FROM branches").get().c;
if (existing > 0) {
  console.log('✓ Database already seeded. Skipping.');
  process.exit(0);
}
```

**Long-term solution:** Docker volume `api-data` persists the database across container restarts. Only `--no-cache` rebuilds reset it.

---

## 12. Complete File Inventory

### Project Root

| File | Size | Purpose |
|---|---|---|
| `docker-compose.yml` | 4.2 KB | 6-service container orchestration |
| `Dockerfile` | 943 B | API container (Node.js 22 Alpine) |
| `Dockerfile.nginx` | 595 B | Web container (Nginx Alpine) |
| `deploy.sh` | 3.6 KB | Full EC2 deployment automation |
| `package.json` | 798 B | Node.js dependencies + scripts |
| `package-lock.json` | 126 KB | Dependency lockfile |
| `vite.config.js` | 267 B | Vite build configuration |
| `index.html` | 1.3 KB | HTML entry point with meta tags |
| `.gitignore` | 393 B | Git exclusion patterns |
| `.dockerignore` | 104 B | Docker build exclusions |
| `.env.example` | 754 B | Environment variable template |

### Frontend — Source (`src/`)

| File | Size | Purpose |
|---|---|---|
| `App.jsx` | 2.7 KB | Routes, auth protection, layout shell |
| `main.jsx` | ~300 B | React DOM render entry |
| `index.css` | ~25 KB | Complete design system |
| **Pages** | | |
| `pages/Login.jsx` | 4.3 KB | JWT authentication page |
| `pages/Overview.jsx` | 9.3 KB | Main dashboard with KPIs |
| `pages/Members.jsx` | 7.8 KB | Member management + search |
| `pages/Branches.jsx` | 7.7 KB | Multi-branch operations |
| `pages/Monitoring.jsx` | 9.0 KB | Live system monitoring |
| `pages/Activity.jsx` | 8.0 KB | Activity feed/audit log |
| `pages/Pricing.jsx` | 8.5 KB | Pricing + AWS cost breakdown |
| `pages/Workflows.jsx` | 8.8 KB | Approval workflow system |
| `pages/Reports.jsx` | ~6 KB | Executive reporting portal |
| **Components** | | |
| `components/Layout.jsx` | 8.9 KB | Sidebar + Header navigation |
| `components/Charts.jsx` | 17.5 KB | SVG Bar chart + Ring chart |
| `components/Gauge.jsx` | 3.4 KB | Animated SVG gauge |
| `components/MemberModal.jsx` | 5.1 KB | Member detail modal |
| `components/Toast.jsx` | 1.2 KB | Toast notification system |
| **Utilities** | | |
| `context/AuthContext.jsx` | ~2 KB | Auth state management |
| `utils/api.js` | ~1 KB | Axios + JWT interceptor |
| `data/mockData.js` | ~3 KB | Sample data generator |

### Backend — Server (`server/`)

| File | Size | Purpose |
|---|---|---|
| `index.js` | ~4 KB | Express server + Prometheus metrics |
| `db.js` | 4.5 KB | SQLite schema (9 tables, WAL mode) |
| `seed.js` | ~5 KB | Database seeder (idempotent) |
| **Routes** | | |
| `routes/auth.js` | 2.7 KB | Login + register |
| `routes/members.js` | 4.9 KB | Member CRUD + search |
| `routes/branches.js` | 2.5 KB | Branch CRUD |
| `routes/attendance.js` | 3.8 KB | Check-in/check-out |
| `routes/equipment.js` | 5.0 KB | Equipment + maintenance |
| `routes/revenue.js` | 4.5 KB | Revenue analytics |
| `routes/reports.js` | 3.9 KB | Executive reports (RBAC protected) |
| `routes/workflows.js` | 3.9 KB | Approval workflows |
| **Middleware** | | |
| `middleware/auth.js` | 693 B | JWT authentication |
| `middleware/rbac.js` | 377 B | Role-based authorization |

### Infrastructure & DevOps

| File | Purpose |
|---|---|
| `nginx/app.conf` | Nginx reverse proxy configuration |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD pipeline |
| `monitoring/prometheus.yml` | Prometheus scrape configuration |
| `monitoring/grafana/dashboards/infrastructure.json` | Grafana dashboard |

### Automation Scripts (`scripts/`)

| Script | Schedule | Purpose |
|---|---|---|
| `backup.sh` | Daily 2:00 AM | DB + volume + config backup → S3 |
| `health_check.sh` | Every 5 min | Service health + auto-recovery |
| `setup_cron.sh` | One-time | Configure all cron jobs |
| `phase6-autoscaling.sh` | One-time | ALB + ASG + scaling setup |

---

## 13. Database Schema Documentation

### SQLite Database (`gymsync.db`)

**Engine:** better-sqlite3 with WAL (Write-Ahead Logging) mode  
**Foreign keys:** Enabled via `PRAGMA foreign_keys = ON`

#### Table: `branches`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | Branch identifier |
| name | TEXT | NOT NULL | Branch display name |
| city | TEXT | NOT NULL | City location |
| region | TEXT | NOT NULL | Geographic region (West, South, North) |
| capacity | INTEGER | DEFAULT 500 | Maximum member capacity |
| address | TEXT | — | Street address |
| rating | REAL | DEFAULT 4.5 | Customer satisfaction rating |
| peak_hour | TEXT | DEFAULT '07:00 AM' | Busiest time of day |
| color | TEXT | DEFAULT '#3b82f6' | UI display color |
| open_since | TEXT | — | Branch opening date |

#### Table: `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | User identifier |
| name | TEXT | NOT NULL | Full name |
| email | TEXT | UNIQUE, NOT NULL | Login email |
| password_hash | TEXT | NOT NULL | bcrypt hashed password |
| role | TEXT | CHECK(admin/manager/trainer/receptionist) | Access role |
| branch_id | INTEGER | FK → branches(id) | Assigned branch |
| status | TEXT | DEFAULT 'active' | Account status |
| created_at | TEXT | DEFAULT datetime('now') | Registration timestamp |

#### Table: `members`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | Member identifier |
| name | TEXT | NOT NULL | Full name |
| email | TEXT | UNIQUE, NOT NULL | Contact email |
| phone | TEXT | — | Phone number |
| plan | TEXT | CHECK(basic/standard/premium) | Membership plan |
| branch_id | INTEGER | FK → branches(id), NOT NULL | Home branch |
| status | TEXT | CHECK(active/inactive/frozen/at-risk) | Membership status |
| join_date | TEXT | DEFAULT date('now') | Join date |
| churn_risk | REAL | DEFAULT 0 | Churn probability (0-1) |
| activity_rate | REAL | DEFAULT 0.5 | Visit frequency rate |
| created_at | TEXT | DEFAULT datetime('now') | Record timestamp |

#### Table: `attendance`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | Log identifier |
| member_id | INTEGER | FK → members(id), NOT NULL | Member who checked in |
| branch_id | INTEGER | FK → branches(id), NOT NULL | Branch location |
| check_in | TEXT | DEFAULT datetime('now') | Check-in timestamp |
| check_out | TEXT | — | Check-out timestamp |
| type | TEXT | DEFAULT 'regular' | Visit type |

#### Table: `equipment`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | Equipment identifier |
| name | TEXT | NOT NULL | Equipment name |
| type | TEXT | NOT NULL | Category (cardio/strength/functional) |
| branch_id | INTEGER | FK → branches(id), NOT NULL | Location |
| status | TEXT | CHECK(active/maintenance/retired) | Current status |
| condition_pct | INTEGER | DEFAULT 100 | Condition percentage |
| hours_used | INTEGER | DEFAULT 0 | Total usage hours |
| max_hours | INTEGER | DEFAULT 5000 | Max hours before service |
| purchase_date | TEXT | — | Purchase date |
| last_service | TEXT | — | Last maintenance date |

#### Table: `payments`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | Payment identifier |
| member_id | INTEGER | FK → members(id), NOT NULL | Payer |
| amount | REAL | NOT NULL | Payment amount |
| category | TEXT | NOT NULL | Revenue category |
| branch_id | INTEGER | FK → branches(id), NOT NULL | Branch |
| payment_date | TEXT | DEFAULT date('now') | Transaction date |
| method | TEXT | DEFAULT 'upi' | Payment method |
| status | TEXT | DEFAULT 'completed' | Payment status |

#### Table: `maintenance`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | Ticket identifier |
| equipment_id | INTEGER | FK → equipment(id), NOT NULL | Equipment |
| requested_by | INTEGER | — | Staff who raised request |
| assigned_to | INTEGER | — | Staff assigned to fix |
| priority | TEXT | CHECK(low/medium/high/critical) | Urgency level |
| status | TEXT | CHECK(pending/in_progress/completed/cancelled) | Ticket status |
| description | TEXT | — | Issue description |
| created_at | TEXT | DEFAULT datetime('now') | Raised at |
| resolved_at | TEXT | — | Resolved at |

#### Table: `workflows`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | Workflow identifier |
| type | TEXT | CHECK(leave_request/equipment_purchase/member_complaint/plan_change) | Request type |
| requester_id | INTEGER | FK → users(id), NOT NULL | Who submitted |
| approver_id | INTEGER | — | Who approved/rejected |
| status | TEXT | CHECK(pending/approved/rejected) | Current status |
| data_json | TEXT | — | Structured request data |
| notes | TEXT | — | Comments/description |
| created_at | TEXT | DEFAULT datetime('now') | Submission time |
| updated_at | TEXT | DEFAULT datetime('now') | Last update time |

#### Table: `activity_log`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | Log identifier |
| type | TEXT | NOT NULL | Event type |
| message | TEXT | NOT NULL | Event description |
| branch | TEXT | — | Branch context |
| user_id | INTEGER | — | Acting user |
| created_at | TEXT | DEFAULT datetime('now') | Event timestamp |

---

## 14. API Documentation

### Authentication

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/login` | POST | None | Login with email/password, returns JWT |
| `/api/auth/register` | POST | Admin only | Create new user account |

**Login Request:**
```json
POST /api/auth/login
{ "email": "admin@gymsync.com", "password": "admin123" }
```

**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "name": "Admin", "email": "admin@gymsync.com", "role": "admin" }
}
```

### Members

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/members` | GET | Token | List all members (search, filter by plan/status) |
| `/api/members/:id` | GET | Token | Get single member |
| `/api/members` | POST | Token | Create new member |
| `/api/members/:id` | PUT | Token | Update member |
| `/api/members/:id` | DELETE | Token | Delete member |

### Branches

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/branches` | GET | Token | List all branches with stats |
| `/api/branches/:id` | GET | Token | Get single branch |

### Attendance

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/attendance` | GET | Token | List check-ins (filter by branch/date) |
| `/api/attendance` | POST | Token | Record new check-in |

### Revenue

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/revenue` | GET | Token | Revenue analytics (by branch/period) |
| `/api/revenue/by-branch` | GET | Token | Branch-wise revenue comparison |

### Equipment

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/equipment` | GET | Token | List all equipment |
| `/api/equipment/:id` | PUT | Token | Update equipment status |
| `/api/equipment/maintenance` | POST | Token | Create maintenance ticket |

### Reports (Admin/Manager only)

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/reports/executive` | GET | Admin/Manager | Aggregated KPIs |
| `/api/reports/branch-comparison` | GET | Admin/Manager | Branch-by-branch metrics |
| `/api/reports/member-growth` | GET | Admin/Manager | Monthly signup trends |
| `/api/reports/churn-analysis` | GET | Admin/Manager | At-risk member analysis |

### Workflows

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/workflows` | GET | Token | List workflows (filter by status) |
| `/api/workflows` | POST | Token | Create new workflow request |
| `/api/workflows/:id/approve` | PUT | Admin/Manager | Approve a request |
| `/api/workflows/:id/reject` | PUT | Admin/Manager | Reject a request |

### System

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/health` | GET | None | Health check (returns uptime, status) |
| `/api/metrics` | GET | None | Prometheus metrics endpoint |

---

## 15. Pricing Strategy

### 3-Tier Pricing Model

| | Starter | Growth | Enterprise |
|---|---|---|---|
| **Price** | $0/mo | $47/mo | $180/mo |
| **Branches** | 1 | Up to 5 | Unlimited |
| **Members** | Up to 100 | Up to 2,500 | Unlimited |
| **Dashboard** | Basic | Full Analytics | Advanced + AI |
| **Backups** | Manual | Daily Automated | Real-time (RPO: 1hr) |
| **Monitoring** | None | Real-time | Full Observability |
| **Multi-branch** | No | Yes | Yes + Multi-region |
| **Support** | Community | Email (24h) | Priority (1h) |
| **Custom Domain** | No | Yes + SSL | Yes + API Access |
| **Account Manager** | No | No | Dedicated |
| **SLA** | None | None | 99.9% Uptime |

### AWS Cost Breakdown by Tier

| Service | Free Tier Limit | Starter ($0) | Growth ($47) | Enterprise ($180) |
|---|---|---|---|---|
| EC2 Instance | 750 hrs/mo | t2.micro (free) | t3.small ($15) | t3.medium ($30) |
| EBS Storage | 30GB free | 20GB (free) | 50GB ($5) | 100GB ($10) |
| RDS MySQL | 750 hrs/mo | db.t3.micro (free) | db.t3.small ($12) | db.t3.medium ($24) |
| RDS Storage | 20GB free | 20GB (free) | 50GB ($5) | 100GB ($10) |
| S3 Backups | 5GB free | 5GB (free) | 50GB ($2) | 200GB ($5) |
| CloudWatch | 10 metrics | Basic (free) | Enhanced ($3) | Full ($8) |
| Data Transfer | 1GB free | Minimal (free) | 50GB ($5) | 200GB ($18) |
| Route 53 | — | — | 1 domain ($0.50) | 3 domains ($1.50) |
| Elastic IP | Free (attached) | 1 (free) | 2 ($3.60) | 5 ($14.40) |
| WAF | — | — | — | Basic ($5) |
| **Total** | | **$0/mo** | **$47/mo** | **$180/mo** |

### Infrastructure Optimization Recommendations

| Recommendation | Impact | Est. Savings |
|---|---|---|
| Schedule RDS stop during off-hours (10PM–6AM) | High | $8.50/mo |
| Switch to Reserved Instances (1-year commitment) | High | $6.00/mo |
| Enable S3 Intelligent-Tiering for backups | Medium | $2.00/mo |
| Consider AWS Graviton (ARM) instances | Medium | $3.00/mo |
| Enable gzip compression on ALB | Low | $1.50/mo |
| Use CloudWatch Logs Insights vs full metrics | Low | $1.50/mo |
| **Total Potential Savings** | | **$22.50/mo** |

---

## 16. Completion Tracker

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | VPC, Subnets, EC2, Nginx, SSH, Security Groups, Git | ✅ Complete |
| **Phase 2** | Docker Compose, RDS MySQL, S3 Backups, CloudWatch, Cron | ✅ Complete |
| **Phase 3A** | Backend REST API (Express.js, 8 route files) | ✅ Complete |
| **Phase 3B** | JWT Authentication + RBAC (4 roles) | ✅ Complete |
| **Phase 3C** | Member Management CRUD + Search | ✅ Complete |
| **Phase 3D** | Attendance & Check-in System | ✅ Complete |
| **Phase 3E** | Equipment Health Module + Maintenance | ✅ Complete |
| **Phase 3F** | Revenue & Analytics Reporting | ✅ Complete |
| **Phase 3G** | Executive Reporting Portal (RBAC protected) | ✅ Complete |
| **Phase 3H** | Workflow & Approval System (4 types) | ✅ Complete |
| **Phase 4** | Dockerfiles, CI/CD Pipeline, AMI Backup, Deploy Script | ✅ Complete |
| **Phase 5** | Prometheus, Grafana, Node Exporter, cAdvisor | ✅ Complete |
| **Phase 6** | ALB (Multi-AZ), ASG (1-3), Scaling Policy (70% CPU) | ✅ Complete |
| **Issues** | 15 real issues documented with fixes | ✅ All Resolved |
| **Audit** | 22/22 PS requirements verified | ✅ 100% |

---

## 17. Infrastructure Summary

```
Cloud Provider      : AWS (ap-south-1 — Mumbai)
OS                  : Ubuntu 22.04 LTS
Instance type       : EC2 t3.micro (2 vCPU, 1GB RAM)
Instance ID         : i-00986d4453cf86141
Elastic IP          : 13.205.58.39
VPC                 : vpc-0395bd899a31f2d10 (10.0.0.0/16)
Security Group      : sg-0399b7fe122518c65

Frontend            : React 18 + Vite (9 pages, dark theme)
Backend             : Node.js 22 + Express.js (8 API route files)
Database            : SQLite (better-sqlite3, WAL mode, 9 tables)
Database (Managed)  : AWS RDS MySQL 8.4 (db.t3.micro, 7-day backups)
Web server          : Nginx Alpine (reverse proxy, static files)
Containerization    : Docker Compose (6 services)

Containers:
  1. gymsync-api         Node.js 22 API server (port 3001)
  2. gymsync-web         Nginx reverse proxy (port 80)
  3. gymsync-prometheus  Metrics collection (port 9090)
  4. gymsync-grafana     Dashboard visualization (port 3000)
  5. gymsync-node-exporter System metrics (port 9100)
  6. gymsync-cadvisor    Container metrics (port 8080)

Load Balancer       : gymsync-alb (ALB, Multi-AZ: 1a + 1b)
ALB DNS             : gymsync-alb-*.ap-south-1.elb.amazonaws.com
Auto Scaling        : gymsync-asg (Min: 1, Max: 3, Target CPU: 70%)
Launch Template     : gymsync-lt (from AMI ami-07101e70602524a82)
Target Group        : gymsync-tg (HTTP health check)

CI/CD               : GitHub Actions (push to main → build → deploy)
Backup schedule     : Daily at 2:00 AM IST (DB + volumes + configs → S3)
Health checks       : Every 5 minutes (auto-restart on failure)
Docker cleanup      : Every Sunday at 3:00 AM
Backup retention    : 7 days local, 30 days S3
RPO target          : 24 hours (daily backups)
RTO target          : ~5 minutes (launch from AMI + associate Elastic IP)

Monitoring stack    : Prometheus + Grafana + Node Exporter + cAdvisor
CloudWatch alarms   : CPU > 80%, Memory > 80%, Disk > 80% → SNS email
Application metrics : HTTP requests, latency, heap usage, uptime

Authentication      : JWT (24h expiry, bcrypt password hashing)
Roles               : admin, manager, trainer, receptionist
API endpoints       : 20+ across 8 route files
Frontend pages      : 9 (Login + 8 dashboard pages)

Estimated cost      : $0/month (AWS free tier)
After free tier     : $47/month (Growth plan)
Total issues faced  : 15 (all resolved and documented)
PS requirements met : 22/22 (100%)

Live URLs:
  🌐 App:        http://13.205.58.39
  ⚖️ ALB:        http://gymsync-alb-1436718464.ap-south-1.elb.amazonaws.com
  📊 Grafana:    http://13.205.58.39:3000 (admin / gymsync2026)
  📈 Prometheus: http://13.205.58.39:9090
  🔑 Login:      admin@gymsync.com / admin123
```

---

*GymSync Fitness Club Cloud — Complete Project Documentation*  
*All 6 Phases Complete · 22/22 PS Requirements · 15 Issues Resolved*  
*Last updated: June 19, 2026*
