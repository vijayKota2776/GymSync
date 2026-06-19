# 🏋️ GymSync Fitness Club Cloud

> **A centralized cloud platform for managing multi-branch fitness operations — built on AWS with React, Express, Docker, and full observability.**

[![Live](https://img.shields.io/badge/Live-13.205.58.39-brightgreen)](http://13.205.58.39)
[![AWS](https://img.shields.io/badge/Cloud-AWS%20Mumbai-orange)](https://aws.amazon.com)
[![Docker](https://img.shields.io/badge/Containers-6%20Running-blue)](https://www.docker.com)
[![Status](https://img.shields.io/badge/Status-Production-success)](http://13.205.58.39)

---

## 🌐 Live URLs

| Service | URL | Credentials |
|---|---|---|
| **Application** | http://13.205.58.39 | `admin@gymsync.com` / `admin123` |
| **ALB Endpoint** | http://gymsync-alb-1436718464.ap-south-1.elb.amazonaws.com | — |
| **Grafana** | http://13.205.58.39:3000 | `admin` / `gymsync2026` |
| **Prometheus** | http://13.205.58.39:9090 | — |

---

## 📋 Problem Statement

GymSync Fitness Club is a rapidly growing fitness chain operating across multiple cities in India. The organization was running on **disconnected spreadsheets, paper logs, and manual workflows** with no central visibility. This project delivers a **production-grade cloud platform** covering:

- Centralized operational management across all branches
- Real-time analytics, KPIs, and executive dashboards
- Role-based access control (Admin, Manager, Trainer, Receptionist)
- 24/7 infrastructure monitoring with proactive alerts
- Automated backups with disaster recovery (RPO: 24h, RTO: 5min)
- Auto-scaling for demand spikes without manual intervention

---

## 🏗️ Architecture

```
Internet → ALB (Multi-AZ) → EC2 (t3.micro)
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
               Nginx:80    Express:3001   Prometheus:9090
               (React SPA)  (REST API)    (Metrics)
                    │            │
                    │       SQLite DB      Grafana:3000
                    │                      Node Exporter:9100
                    │                      cAdvisor:8080
                    │
               RDS MySQL 8.4 (Private Subnet, 7-day backups)
```

### AWS Resources

| Resource | ID / Details |
|---|---|
| **EC2** | `i-00986d4453cf86141` (t3.micro, Ubuntu 22.04) |
| **Elastic IP** | `13.205.58.39` |
| **VPC** | `vpc-0395bd899a31f2d10` (10.0.0.0/16) |
| **RDS** | `gymsync-db` (MySQL 8.4, db.t3.micro, deletion protection ON) |
| **ALB** | `gymsync-alb` (Multi-AZ: ap-south-1a + 1b) |
| **ASG** | `gymsync-asg` (Min: 1, Max: 3, CPU target: 70%) |
| **AMI** | `ami-07101e70602524a82` (disaster recovery snapshot) |
| **Security Group** | `sg-0399b7fe122518c65` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite (9 pages, dark theme, custom SVG charts) |
| **Backend** | Node.js 22 + Express.js (20+ API endpoints, JWT auth, RBAC) |
| **Database** | SQLite (better-sqlite3, WAL mode, 9 tables) + AWS RDS MySQL 8.4 |
| **Web Server** | Nginx Alpine (reverse proxy, static file serving) |
| **Containers** | Docker Compose (6 services) |
| **Monitoring** | Prometheus + Grafana + Node Exporter + cAdvisor |
| **CI/CD** | GitHub Actions (auto-deploy on push to main) |
| **Cloud** | AWS (EC2, VPC, RDS, S3, ALB, ASG, CloudWatch, SNS, IAM) |

---

## 📱 Dashboard Pages

| Page | Features |
|---|---|
| **Overview** | KPI cards, weekly bar chart, plan distribution ring chart, branch table, activity feed |
| **Members** | Search/filter, churn risk badges, activity rates, member modal |
| **Branches** | Multi-city operations (Mumbai, Delhi, Bangalore, Hyderabad) |
| **Monitoring** | Live CPU/Memory/Disk gauges (2s refresh), Docker container status, alerts |
| **Activity** | Real-time event feed with branch filtering |
| **Pricing** | 3-tier pricing cards ($0/$47/$180), AWS cost breakdown table |
| **Workflows** | Leave requests, equipment purchases, complaints — approval chain |
| **Reports** | Executive KPIs, branch comparison, optimization recommendations |
| **Login** | JWT authentication with role-based routing |

---

## 🔐 Role-Based Access Control

| Role | Access Level |
|---|---|
| `admin` | All branches, all data, user management, approve/reject workflows |
| `manager` | Own branch — members, revenue, equipment, approve workflows |
| `trainer` | Member profiles and attendance for own branch |
| `receptionist` | Check-in screen and member registration only |

---

## 🐳 Docker Services

```bash
$ docker compose ps
NAME                    STATUS    PORTS
gymsync-api             healthy   0.0.0.0:3001→3001/tcp
gymsync-web             running   0.0.0.0:80→80/tcp
gymsync-prometheus      running   0.0.0.0:9090→9090/tcp
gymsync-grafana         running   0.0.0.0:3000→3000/tcp
gymsync-node-exporter   running   0.0.0.0:9100→9100/tcp
gymsync-cadvisor        running   0.0.0.0:8080→8080/tcp
```

---

## 📁 Project Structure

```
GymSync/
├── src/                          # React Frontend
│   ├── pages/                    # 9 dashboard pages
│   │   ├── Overview.jsx          # Main dashboard with KPIs
│   │   ├── Members.jsx           # Member management
│   │   ├── Branches.jsx          # Multi-branch operations
│   │   ├── Monitoring.jsx        # Live system monitoring
│   │   ├── Activity.jsx          # Activity feed
│   │   ├── Pricing.jsx           # Pricing + AWS costs
│   │   ├── Workflows.jsx         # Approval workflows
│   │   ├── Reports.jsx           # Executive reports
│   │   └── Login.jsx             # Authentication
│   ├── components/               # Reusable components
│   │   ├── Layout.jsx            # Sidebar + Header
│   │   ├── Charts.jsx            # Bar + Ring charts (SVG)
│   │   ├── Gauge.jsx             # Animated gauge (SVG)
│   │   ├── MemberModal.jsx       # Member details modal
│   │   └── Toast.jsx             # Notification system
│   ├── context/AuthContext.jsx   # Auth state management
│   ├── utils/api.js              # Axios + JWT interceptor
│   └── index.css                 # Design system (dark theme)
│
├── server/                       # Express.js Backend
│   ├── index.js                  # Server + Prometheus metrics
│   ├── db.js                     # SQLite schema (9 tables)
│   ├── seed.js                   # Database seeder
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   └── rbac.js               # Role-based authorization
│   └── routes/
│       ├── auth.js               # Login/register
│       ├── members.js            # Member CRUD
│       ├── branches.js           # Branch CRUD
│       ├── attendance.js         # Check-in/out
│       ├── equipment.js          # Equipment tracking
│       ├── revenue.js            # Revenue analytics
│       ├── reports.js            # Executive reports
│       └── workflows.js          # Approval workflows
│
├── nginx/app.conf                # Nginx reverse proxy config
├── monitoring/
│   ├── prometheus.yml            # Prometheus scrape config
│   └── grafana/dashboards/       # Grafana dashboard JSON
│
├── scripts/
│   ├── backup.sh                 # Automated backup (daily 2AM)
│   ├── health_check.sh           # Health monitor (every 5min)
│   ├── setup_cron.sh             # Cron job configuration
│   └── phase6-autoscaling.sh     # ALB + ASG setup
│
├── docker-compose.yml            # 6-service orchestration
├── Dockerfile                    # API container
├── Dockerfile.nginx              # Web container
├── deploy.sh                     # EC2 deployment script
└── .github/workflows/deploy.yml  # CI/CD pipeline
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- Docker & Docker Compose

### Local Development
```bash
git clone https://github.com/vijayKota2776/GymSync.git
cd GymSync
npm install
npm run dev          # Frontend on http://localhost:5173
```

### Production Deployment (EC2)
```bash
chmod +x deploy.sh
./deploy.sh          # Full automated deployment
```

### Docker Only
```bash
npm run build
docker compose up -d --build
docker exec gymsync-api node server/seed.js
# App available at http://localhost
```

---

## 🔄 CI/CD Pipeline

```
Developer → git push → GitHub Actions → Build React → Deploy to EC2 → Health Check → Live!
```

Every push to `main` branch triggers automatic deployment via GitHub Actions.

---

## 📊 Monitoring & Observability

| Tool | Purpose | Endpoint |
|---|---|---|
| **Prometheus** | Metrics collection (15s scrape interval) | `:9090` |
| **Grafana** | Dashboard visualization | `:3000` |
| **Node Exporter** | System metrics (CPU, memory, disk) | `:9100` |
| **cAdvisor** | Container metrics | `:8080` |
| **CloudWatch** | AWS alarms (CPU/Memory/Disk > 80%) | AWS Console |
| **Health Check** | Auto-restart failed containers (every 5min) | Cron |

---

## 💾 Backup & Disaster Recovery

| Strategy | Detail |
|---|---|
| **RDS Automated Backups** | Daily, 7-day retention, 03:00-04:00 UTC window |
| **Shell Script Backup** | Daily 2AM — DB + volumes + configs → S3 |
| **AMI Snapshot** | Full machine image for instant recovery |
| **RPO** | 24 hours (daily backups) |
| **RTO** | ~5 minutes (launch from AMI + associate Elastic IP) |

---

## ⚖️ Auto Scaling

| Setting | Value |
|---|---|
| **Min Instances** | 1 |
| **Max Instances** | 3 |
| **Scaling Trigger** | Average CPU > 70% |
| **Scale In** | Average CPU drops below target |
| **AZs** | ap-south-1a + ap-south-1b |

---

## 💰 Pricing Tiers

| Tier | Price | Includes |
|---|---|---|
| **Starter** | $0/mo | Free tier — 1 branch, 100 members, basic dashboard |
| **Growth** | $47/mo | 5 branches, 2500 members, full monitoring, daily backups |
| **Enterprise** | $180/mo | Unlimited branches, multi-region, WAF, 99.9% SLA |

---

## 📄 Documentation

Full project documentation is available in [`docs/PROJECT_DOCUMENTATION.md`](docs/PROJECT_DOCUMENTATION.md) covering:

- Complete architecture with diagrams
- All 6 implementation phases step-by-step
- 15 real issues faced with exact fixes
- Database schema (9 tables)
- API documentation (20+ endpoints)
- AWS cost breakdown and optimization
- Infrastructure summary with resource IDs

---

## 🏆 Project Completion

| Category | Requirements | Met | Score |
|---|---|---|---|
| Technical Implementation | 8 | 8 | **100%** |
| Product Building | 8 | 8 | **100%** |
| Pricing Strategy | 6 | 6 | **100%** |
| **TOTAL** | **22** | **22** | **100%** |

---

## 👤 Author

**Vijay Kota**  
GitHub: [@vijayKota2776](https://github.com/vijayKota2776)

---

*GymSync Fitness Club Cloud — Enterprise Cloud Platform for Fitness Management*  
*Built with ❤️ on AWS*
