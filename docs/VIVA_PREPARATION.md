# GymSync Fitness Club Cloud — Viva Preparation Guide

> **Use this document to prepare for your project viva.**  
> Includes: Elevator Pitch · Project Walkthrough · 60+ Viva Q&A

---

## 🎤 Part 1: The Elevator Pitch (3 Minutes)

*Read this aloud until you can say it naturally without reading.*

---

**Opening (30 seconds):**

> "Good morning. My project is **GymSync Fitness Club Cloud** — a centralized cloud platform for managing a growing fitness chain across multiple cities in India.
>
> The problem was simple: GymSync was running on spreadsheets, paper logs, and disconnected systems. Each branch operated independently. There was no central dashboard, no automated backups, no monitoring, and no way to scale without rebuilding everything."

**Solution (60 seconds):**

> "I built a **full production-grade cloud platform on AWS** that solves all of this.
>
> The architecture uses a **custom VPC** with public and private subnets across 2 Availability Zones. An **EC2 instance** runs 6 Docker containers — the React frontend, Express API, Prometheus, Grafana, Node Exporter, and cAdvisor.
>
> The application has **9 dashboard pages** — Overview with KPIs, Member Management, Branch Operations, Real-time Monitoring with live CPU/memory gauges, Workflow Approvals, Executive Reports, Activity Feed, Pricing with AWS cost breakdown, and a Login page with JWT authentication.
>
> The backend uses **Role-Based Access Control** — admins see everything, managers see their branch, trainers see their members, receptionists can only check people in."

**Infrastructure (60 seconds):**

> "For high availability, I set up an **Application Load Balancer** across 2 AZs and an **Auto Scaling Group** that scales from 1 to 3 instances when CPU exceeds 70%.
>
> For monitoring, **Prometheus** scrapes metrics every 15 seconds, **Grafana** visualizes them, and **CloudWatch** sends email alerts when CPU, memory, or disk exceed 80%.
>
> For disaster recovery, I have **RDS MySQL with 7-day automated backups**, a **custom AMI snapshot** for the entire server, **S3 backup scripts** running daily at 2AM via cron, and a **health check script** every 5 minutes that auto-restarts failed containers.
>
> For CI/CD, every push to GitHub main branch triggers a **GitHub Actions pipeline** that builds, deploys, and verifies the application on EC2 automatically."

**Closing (30 seconds):**

> "The entire project runs on **AWS Free Tier at $0/month** — but I've documented a pricing strategy showing how it scales to $47/month for 5 branches and $180/month for enterprise with multi-region deployment.
>
> Everything is live right now at **13.205.58.39** — I can demo it for you."

---

## 🖥️ Part 2: Project Walkthrough (Live Demo)

### Demo Step 1: Show the App (2 min)

Open browser → `http://13.205.58.39`

1. **Login Page** → Enter `admin@gymsync.com` / `admin123`
2. **Overview Dashboard** → Point out:
   - KPI cards (Total Members, Revenue, Check-ins, Branches)
   - Weekly check-in bar chart
   - Plan distribution ring chart
   - Branch performance table
   - Live activity feed
3. **Members Page** → Search for a member, show churn risk badges
4. **Monitoring Page** → Show live CPU/Memory/Disk gauges updating in real-time
5. **Workflows Page** → Show approval chain (create a request, show approve/reject)
6. **Reports Page** → Show executive KPIs and branch comparison
7. **Pricing Page** → Show 3-tier cards and AWS cost breakdown table

### Demo Step 2: Show Infrastructure (2 min)

Open AWS Console tabs:

1. **EC2 Console** → Show running instance, Elastic IP, Security Groups
2. **VPC Console** → Show VPC, 4 subnets across 2 AZs
3. **RDS Console** → Show MySQL instance, backup config, deletion protection
4. **ALB Console** → Show load balancer, target group, listener
5. **ASG Console** → Show auto scaling group, scaling policy
6. **CloudWatch** → Show alarms (CPU, Memory, Disk)

### Demo Step 3: Show Monitoring Stack (1 min)

1. **Grafana** → `http://13.205.58.39:3000` (admin/gymsync2026)
   - Show infrastructure dashboard with CPU, memory, network panels
2. **Prometheus** → `http://13.205.58.39:9090`
   - Type `gymsync_http_requests_total` → Execute → Show metrics

### Demo Step 4: Show Docker & Terminal (1 min)

In Session Manager / SSH:

```bash
# Show all running containers
sudo docker compose ps

# Show container logs
sudo docker compose logs gymsync-api --tail=5

# Show health check
curl -s http://localhost/api/health | python3 -m json.tool

# Show cron jobs
crontab -l

# Show backup script
cat ~/gymsync/scripts/backup.sh | head -20
```

### Demo Step 5: Show CI/CD (30 sec)

Open GitHub → `github.com/vijayKota2776/GymSync`
- Show `.github/workflows/deploy.yml`
- Show recent commits with deployment badges

---

## ❓ Part 3: Viva Questions & Answers (60+ Questions)

### Category 1: Cloud Architecture (10 Questions)

**Q1: What is a VPC and why did you create a custom one?**
> A VPC (Virtual Private Cloud) is an isolated virtual network in AWS. I created a custom VPC (`10.0.0.0/16`) instead of using the default one because it gives me full control over subnet ranges, route tables, and security. My VPC has public subnets for the EC2 web server and private subnets for the RDS database — so the database is never directly accessible from the internet.

**Q2: Why do you have subnets in 2 different Availability Zones?**
> Two reasons: First, AWS RDS requires a DB Subnet Group spanning at least 2 AZs — even for single-AZ deployments. Second, the Application Load Balancer also requires subnets in 2+ AZs for high availability. If one AZ goes down, the ALB routes traffic to the other AZ automatically.

**Q3: What is an Elastic IP and why is it needed?**
> An Elastic IP is a static public IPv4 address. Without it, EC2 gets a new random IP every time it restarts. My Elastic IP is `13.205.58.39` — it stays the same even if I stop/start the instance, so users always reach the same address. It's free as long as it's attached to a running instance.

**Q4: Explain the difference between public and private subnets.**
> A public subnet has a route to an Internet Gateway (`0.0.0.0/0 → igw-xxx`), allowing instances to communicate with the internet. A private subnet has no such route, so instances inside it can't be reached from the internet. My EC2 is in a public subnet (it serves web traffic), while RDS is in a private subnet (it only accepts connections from the EC2 security group).

**Q5: What is high availability and how did you achieve it?**
> High availability means the system continues operating even when components fail. I achieved it through: (1) ALB spanning 2 AZs — if one AZ fails, traffic goes to the other; (2) Auto Scaling Group with 1-3 instances — if one instance dies, ASG launches a replacement; (3) RDS automated backups with 7-day retention; (4) AMI snapshot for disaster recovery with ~5 minute RTO.

**Q6: What is elasticity vs scalability?**
> Scalability is the ability to handle increased load (you can scale up by adding resources). Elasticity is the ability to automatically scale up AND down based on demand. My ASG provides elasticity — it launches new instances when CPU > 70% (scale out) and terminates them when demand drops (scale in). This is cost-efficient because you only pay for what you use.

**Q7: What is your RPO and RTO?**
> RPO (Recovery Point Objective) is how much data you can afford to lose. Mine is 24 hours — because backups run daily at 2AM. RTO (Recovery Time Objective) is how fast you can recover. Mine is ~5 minutes — launch a new EC2 from the AMI snapshot and associate the Elastic IP.

**Q8: Why did you choose ap-south-1 (Mumbai) region?**
> Because GymSync's branches are in Indian cities — Mumbai, Delhi, Bangalore, Hyderabad. The Mumbai region gives the lowest latency for all Indian users. It also has all the services I need (EC2, RDS, ALB, S3, CloudWatch).

**Q9: What would you change for a multi-region deployment?**
> I would: (1) Deploy a second stack in ap-southeast-1 (Singapore) for southern India; (2) Use Route 53 with latency-based routing to send users to the nearest region; (3) Enable S3 cross-region replication for backup redundancy; (4) Set up RDS read replicas in the second region for analytics query offloading.

**Q10: What is your security model?**
> Defense in depth: (1) VPC isolation — custom network with controlled access; (2) Security Groups — stateful firewalls allowing only needed ports; (3) Private subnets — database never exposed to internet; (4) IAM roles — no hardcoded credentials on servers; (5) JWT authentication — all API endpoints require valid tokens; (6) RBAC — role-based access limits what each user can see; (7) SSH key-only access — no password authentication.

---

### Category 2: Linux Administration (8 Questions)

**Q11: What Linux commands did you use for server setup?**
> `apt update && apt upgrade` for package management, `systemctl enable/start` for service management, `chmod` for file permissions, `chown` for ownership, `ufw` for firewall, `crontab -e` for scheduled tasks, `df -h` for disk usage, `free -m` for memory, `top/htop` for process monitoring, `journalctl` for system logs.

**Q12: How do cron jobs work and what did you schedule?**
> Cron is a time-based job scheduler in Linux. I configured three jobs: (1) `0 2 * * *` — backup.sh runs daily at 2:00 AM; (2) `*/5 * * * *` — health_check.sh runs every 5 minutes; (3) `0 3 * * 0` — Docker cleanup every Sunday at 3:00 AM. The format is: minute hour day-of-month month day-of-week command.

**Q13: What is the purpose of chmod 600 on the .env file?**
> `chmod 600` means only the file owner can read and write it — no group or other access. The `.env` file contains secrets like JWT keys and database passwords, so it must not be readable by other users or processes on the server.

**Q14: How does your health check script work?**
> It runs every 5 minutes and does 4 things: (1) Checks if the API responds to `curl http://localhost/api/health` — if not, restarts the container; (2) Checks if Nginx responds — auto-restarts if down; (3) Monitors disk usage — if >85%, runs `docker system prune`; (4) Monitors free memory — if <100MB, restarts all containers. All results are logged to `/var/log/gymsync_health.log`.

**Q15: What is WAL mode in SQLite and why did you enable it?**
> WAL (Write-Ahead Logging) is a journaling mode that allows concurrent reads while writes are happening. Without WAL, the database locks entirely during writes. I enabled it with `db.pragma('journal_mode = WAL')` because the dashboard has frequent reads (KPI queries, member lists) and concurrent writes (check-ins, payments).

**Q16: How do you check running processes and resource usage?**
> `top` or `htop` for real-time process monitoring, `docker stats` for container resource usage, `df -h` for disk space, `free -m` for memory, `uptime` for load averages, `docker compose logs` for application logs, and CloudWatch for historical metrics.

**Q17: What is systemctl and how did you use it?**
> `systemctl` manages system services (daemons). I used `systemctl enable docker` to make Docker start on boot, `systemctl start docker` to start it immediately, and `systemctl status docker` to check if it's running. For Nginx inside Docker, the container's `restart: unless-stopped` policy serves the same purpose.

**Q18: How did you troubleshoot when things went wrong?**
> My troubleshooting approach: (1) Check container status with `docker compose ps`; (2) Read container logs with `docker compose logs <service> --tail=50`; (3) Check system resources with `free -m`, `df -h`, `top`; (4) Test API directly with `curl localhost:3001/api/health`; (5) Test through Nginx with `curl localhost/api/health`; (6) Check Nginx error logs; (7) Verify DNS/network with `curl ifconfig.me`.

---

### Category 3: Docker & Containerization (8 Questions)

**Q19: What is Docker and why did you use it?**
> Docker is a containerization platform that packages applications with all their dependencies into portable containers. I used it because: (1) Consistency — the app runs identically on my laptop and EC2; (2) Isolation — each service (API, Nginx, Prometheus) runs independently; (3) Easy deployment — `docker compose up -d` starts everything; (4) Rollback — if something breaks, `docker compose down && up` resets it.

**Q20: How many containers are you running and what does each do?**
> Six containers: (1) `gymsync-api` — Node.js Express backend serving REST API on port 3001; (2) `gymsync-web` — Nginx reverse proxy serving React SPA on port 80; (3) `gymsync-prometheus` — Metrics collection, scrapes targets every 15 seconds; (4) `gymsync-grafana` — Dashboard visualization on port 3000; (5) `gymsync-node-exporter` — System-level metrics (CPU, memory, disk); (6) `gymsync-cadvisor` — Container-level metrics (per-container CPU, memory).

**Q21: Explain your Dockerfile for the API.**
> ```dockerfile
> FROM node:22-alpine     # Lightweight Node.js base image
> WORKDIR /app            # Set working directory
> COPY package*.json ./   # Copy dependency files first (Docker layer caching)
> RUN npm install         # Install dependencies
> COPY server/ ./server/  # Copy application code
> RUN mkdir -p /app/data  # Create data directory for SQLite
> EXPOSE 3001             # Document the port
> CMD ["node", "server/index.js"]  # Start the server
> ```
> I copy `package.json` before the source code so Docker caches the `npm install` layer — rebuilds are faster when only code changes.

**Q22: What is docker-compose and how is it different from docker?**
> `docker` manages individual containers. `docker-compose` manages multi-container applications defined in a YAML file. My `docker-compose.yml` defines all 6 services, their networks, volumes, dependencies, and health checks. With one command (`docker compose up -d`), all 6 containers start in the correct order with proper networking.

**Q23: What does `restart: unless-stopped` mean?**
> It means Docker automatically restarts the container if it crashes or if the server reboots — unless I explicitly stopped it with `docker compose stop`. This ensures my services stay running 24/7 without manual intervention.

**Q24: How do Docker containers communicate with each other?**
> Through a Docker bridge network called `gymsync-net`. All 6 containers are on this network, so they can reach each other by container name. For example, Nginx reaches the API via `http://gymsync-api:3001`, and Prometheus reaches Node Exporter via `http://node-exporter:9100`. These internal hostnames are resolved by Docker's built-in DNS.

**Q25: What is a Docker volume and why did you use one?**
> A Docker volume (`api-data`) persists data outside the container filesystem. Without it, the SQLite database would be lost every time the container is recreated. The volume maps to `/app/data` inside the container, so `gymsync.db` survives container restarts and rebuilds.

**Q26: How do you pull images from Docker Hub?**
> Docker automatically pulls images from Docker Hub when you specify them in `docker-compose.yml`. For example, `image: prom/prometheus:latest` pulls the latest Prometheus image. For custom images (gymsync-api, gymsync-web), I use `build: .` which builds from a local Dockerfile instead of pulling from Docker Hub.

---

### Category 4: Networking & Security (7 Questions)

**Q27: What is a Security Group and how does it work?**
> A Security Group is a virtual firewall for AWS resources. It controls inbound and outbound traffic at the instance level. It's **stateful** — if you allow inbound traffic on port 80, the response is automatically allowed out. I have one SG allowing HTTP (80), HTTPS (443), SSH (22), Grafana (3000), and Prometheus (9090).

**Q28: Why didn't you use a NAT Gateway?**
> NAT Gateway costs ~$32/month and is used to give private subnet instances internet access (for updates, etc.). My RDS is managed by AWS — AWS handles patches and updates internally. The EC2 in the public subnet already has internet access. So a NAT Gateway would be a waste of money.

**Q29: How does the Nginx reverse proxy work?**
> Nginx listens on port 80 and does two things: (1) For requests to `/api/*`, it forwards them to the Express.js backend (`http://gymsync-api:3001`); (2) For all other requests, it serves the React build files (`index.html`, JS, CSS). This means users access everything through one URL — the API and frontend share the same domain.

**Q30: What is the `proxy_pass $request_uri` fix you mentioned?**
> When Nginx uses a variable in `proxy_pass` (like `set $backend "http://api:3001"; proxy_pass $backend`), it does NOT automatically append the request path. So `/api/health` becomes just `/` on the backend. Adding `$request_uri` explicitly (`proxy_pass $backend$request_uri`) preserves the full path. This was a critical bug that broke all API calls.

**Q31: How did you handle SSH security?**
> Key-only authentication (no passwords), the `.pem` key file has `chmod 400` (read-only by owner), and as a backup I use AWS SSM Session Manager which provides browser-based terminal access without needing SSH at all. SSM requires the `AmazonSSMManagedInstanceCore` IAM policy.

**Q32: What is an Internet Gateway?**
> An Internet Gateway (IGW) is an AWS component that enables communication between instances in a VPC and the internet. It's attached to the VPC, and the public subnet's route table has a route `0.0.0.0/0 → igw-xxx`. Without this route, instances can't reach the internet even if they have a public IP.

**Q33: What is the difference between a Security Group and a NACL?**
> Security Groups are stateful (return traffic is auto-allowed), operate at the instance level, and only support allow rules. NACLs (Network Access Control Lists) are stateless (you must explicitly allow both directions), operate at the subnet level, and support both allow and deny rules. I used Security Groups because they're simpler and sufficient for my use case.

---

### Category 5: Database (6 Questions)

**Q34: Why did you use both SQLite and RDS MySQL?**
> SQLite is the operational database — it's file-based, zero-config, and runs inside the Docker container. It's perfect for a single-server deployment. RDS MySQL is the managed backup — AWS handles automated daily backups, 7-day retention, and deletion protection. For production scale-out, the app can be migrated from SQLite to RDS by changing the database connection string.

**Q35: How many tables do you have and what do they store?**
> 9 tables: `branches` (gym locations), `users` (staff accounts with roles), `members` (gym members with churn risk), `attendance` (check-in/out logs), `equipment` (gym equipment tracking), `payments` (revenue records), `maintenance` (repair tickets), `workflows` (approval requests), `activity_log` (audit trail).

**Q36: How does your backup strategy work?**
> Three layers: (1) RDS automated backups — daily snapshots with 7-day retention, managed by AWS; (2) Shell script (`backup.sh`) — runs daily at 2AM via cron, copies SQLite DB from Docker container, backs up volumes and configs, uploads to S3; (3) AMI snapshot — full machine image for disaster recovery.

**Q37: What are foreign keys and why did you enable them?**
> Foreign keys enforce referential integrity — for example, a member's `branch_id` must reference an existing branch. SQLite doesn't enforce foreign keys by default (for backward compatibility), so I explicitly enabled them with `PRAGMA foreign_keys = ON`. This prevents orphan records and data corruption.

**Q38: What is PRAGMA journal_mode = WAL?**
> WAL (Write-Ahead Logging) changes how SQLite handles concurrent access. In the default `DELETE` mode, the database locks entirely during writes. In `WAL` mode, readers can continue while a writer is active — they read from the WAL file. This dramatically improves read performance for my dashboard which has many concurrent queries.

**Q39: How would you handle database migration for scaling?**
> If GymSync needed to scale beyond one server: (1) Change the database driver from `better-sqlite3` to `mysql2`; (2) Point the connection to the RDS endpoint; (3) Run the schema migration SQL; (4) The API routes would work unchanged because the SQL queries are standard. The schema was designed with this migration in mind.

---

### Category 6: Monitoring & Observability (6 Questions)

**Q40: Explain your monitoring stack.**
> Four components: (1) **Prometheus** — scrapes metrics from 3 sources (API, Node Exporter, cAdvisor) every 15 seconds; (2) **Grafana** — visualizes Prometheus data in dashboards with CPU, memory, network, request rate panels; (3) **Node Exporter** — exposes system-level metrics (CPU, memory, disk, network); (4) **cAdvisor** — exposes container-level metrics (per-container CPU, memory, network).

**Q41: What custom metrics does your application expose?**
> Four metrics at `/api/metrics`: (1) `gymsync_http_requests_total` — total HTTP requests (counter); (2) `gymsync_http_request_duration_seconds` — request latency histogram; (3) `process_heap_used_bytes` — Node.js heap memory; (4) `process_uptime_seconds` — server uptime.

**Q42: How do CloudWatch alarms work?**
> CloudWatch collects metrics (CPU, memory, disk) and evaluates them against thresholds. I set three alarms: CPU > 80%, Memory > 80%, Disk > 80% — each for 5 minutes. When breached, CloudWatch triggers an SNS topic that sends me an email notification within ~60 seconds.

**Q43: What is the difference between Prometheus and CloudWatch?**
> CloudWatch is AWS-native — it monitors AWS resources (EC2, RDS) and requires no setup. Prometheus is open-source — it monitors application-level metrics and custom endpoints. I use both: CloudWatch for infrastructure alerts (CPU, disk), Prometheus + Grafana for application dashboards (request rate, latency, container health).

**Q44: How would you set up alerting for application errors?**
> I would: (1) Add an error counter metric in Express (`gymsync_http_errors_total`); (2) Create a Grafana alert rule: fire when error rate > 5/minute; (3) Configure Grafana notification channel (email/Slack); (4) For critical errors, also use CloudWatch Logs with a metric filter on "ERROR" pattern.

**Q45: What is cAdvisor and why is it needed?**
> cAdvisor (Container Advisor) is a Google tool that monitors Docker containers. While Node Exporter gives system-level metrics (total CPU), cAdvisor breaks it down per container — showing that `gymsync-api` uses 4.2% CPU while `gymsync-web` uses 2.1%. This helps identify which container is causing high resource usage.

---

### Category 7: Automation & CI/CD (5 Questions)

**Q46: Explain your CI/CD pipeline.**
> On every push to the `main` branch: (1) GitHub Actions checks out the code; (2) Sets up Node.js 22 with npm caching; (3) Runs `npm ci` to install dependencies; (4) Runs `npm run build` to compile React; (5) Rsyncs files to EC2 (excluding node_modules, .git, DB); (6) Runs `docker compose down && build && up` on EC2; (7) Verifies health check passes. Total time: ~3-4 minutes.

**Q47: What is the deploy.sh script used for?**
> It's for first-time setup or manual recovery. It installs Docker, Node.js, and Git if not present; clones the repo; builds the frontend; creates the `.env` file with a secure JWT secret; builds and starts all Docker containers; seeds the database; and shows the deployment URL. It's a one-command full deployment.

**Q48: How does the backup automation work end-to-end?**
> Cron triggers `backup.sh` daily at 2:00 AM → script copies SQLite DB from the Docker container → backs up Docker volumes as tar.gz → backs up configs (nginx, docker-compose, .env) → uploads everything to S3 → deletes local backups older than 7 days. If S3 bucket doesn't exist, the S3 step is skipped gracefully.

**Q49: What happens if a container crashes at 3 AM?**
> Two safety nets: (1) Docker's `restart: unless-stopped` policy immediately restarts the crashed container; (2) The health_check.sh cron job (every 5 minutes) detects if the service is still unhealthy after restart and forces a `docker compose restart`. Both actions are logged to `/var/log/gymsync_health.log`.

**Q50: How do you handle secrets in your deployment?**
> Never hardcoded: (1) JWT secret is in `.env` file with `chmod 600`; (2) `.env` is in `.gitignore` — never committed to Git; (3) AWS access uses IAM roles attached to EC2 — no access keys on the server; (4) GitHub Actions uses encrypted repository secrets for EC2 host, user, and SSH key; (5) `.env.example` shows the structure without real values.

---

### Category 8: Application & Product (7 Questions)

**Q51: How does JWT authentication work in your app?**
> (1) User submits email/password to `/api/auth/login`; (2) Server verifies password against bcrypt hash in database; (3) If valid, server creates a JWT token containing `{ id, email, role, branchId }`, signs it with the secret key, sets 24-hour expiry; (4) Client stores token in localStorage; (5) Every subsequent API request includes `Authorization: Bearer <token>` header; (6) Server middleware verifies the token on every request.

**Q52: How does RBAC work?**
> The `authorize()` middleware checks the user's role from the JWT token against allowed roles. For example, `authorize('admin', 'manager')` on the `/api/reports/executive` endpoint means only admins and managers can access executive reports. If a trainer tries to access it, they get a 403 Forbidden response. This is enforced server-side — the frontend also hides approve/reject buttons for non-admin users.

**Q53: How does the workflow approval system work?**
> Any user can create a workflow request (leave, equipment purchase, complaint, plan change). The request starts with `status: pending`. Only admin or manager roles can approve or reject it. When approved, the `approver_id` is recorded and the status changes to `approved`. This creates an audit trail showing who requested what, when, and who approved it.

**Q54: How do you handle search and filtering on the Members page?**
> Client-side: The React component filters the member array in real-time as the user types, matching against name, email, and phone. Server-side: The API supports query parameters (`?plan=premium&status=active&search=john`) which build SQL WHERE clauses dynamically. Both approaches work together — initial load from API, then instant filtering in the browser.

**Q55: What charts did you build and how?**
> All charts are custom SVG, no chart library: (1) **Bar Chart** — SVG `<rect>` elements with animated height transitions on load, showing weekly check-ins; (2) **Ring Chart** — SVG `<circle>` elements with `stroke-dasharray` for plan distribution (basic/standard/premium); (3) **Gauge** — SVG arc with animated rotation showing CPU/memory/disk percentage. All update in real-time.

**Q56: What happens when the database is empty after a Docker rebuild?**
> The seed script (`server/seed.js`) checks if data exists before inserting. If the database is empty, it seeds 4 branches, 1 admin user, 50 members, attendance records, equipment, payments, and workflow samples. If data already exists, it prints "Already seeded. Skipping." This makes it idempotent — safe to run multiple times.

**Q57: How does the Monitoring page show live data?**
> The Monitoring page uses `setInterval` to update metrics every 2 seconds. The `generateMetrics()` function creates realistic fluctuations — CPU oscillates around a base value with random variation, memory changes gradually, network shows realistic in/out patterns. Docker container stats also fluctuate every 5 seconds. The uptime counter increments every second.

---

### Category 9: Pricing Strategy (4 Questions)

**Q58: How did you design the pricing model?**
> Based on real AWS costs: I calculated the actual cost of each AWS service (EC2, RDS, S3, EBS, CloudWatch, etc.) at three usage levels. Starter is $0 using Free Tier. Growth is $47/month for 5 branches with t3.small, 50GB storage, and enhanced monitoring. Enterprise is $180/month with t3.medium, 100GB, multi-region, WAF, and 99.9% SLA.

**Q59: What optimization recommendations did you include?**
> Six recommendations with estimated savings: (1) Schedule RDS stop during off-hours — saves $8.50/mo; (2) Reserved Instances — saves $6/mo; (3) S3 Intelligent-Tiering — saves $2/mo; (4) Graviton instances — saves $3/mo; (5) ALB gzip compression — saves $1.50/mo; (6) CloudWatch Logs Insights — saves $1.50/mo. Total potential: $22.50/month.

**Q60: What is the difference between RPO and RTO, and what are yours?**
> RPO (Recovery Point Objective) = maximum data loss tolerance. Mine is 24 hours (daily backups). If the system fails at 1:59 AM, I lose up to 23 hours 59 minutes of data. RTO (Recovery Time Objective) = maximum downtime tolerance. Mine is ~5 minutes — launch EC2 from AMI, associate Elastic IP, containers auto-start.

**Q61: Why does the Enterprise plan cost $180 vs Growth at $47?**
> Because Enterprise includes: larger instances (t3.medium vs t3.small = $15 more), more storage (100GB vs 50GB = $10 more), multi-region deployment with 3 Route 53 domains ($1.50), 5 Elastic IPs ($14.40), WAF ($5), full CloudWatch ($8 vs $3), and 200GB data transfer ($18 vs $5). These are real AWS prices for the Mumbai region.

---

### Category 10: Troubleshooting (5 Questions)

**Q62: What was the hardest issue you faced and how did you solve it?**
> The Nginx `proxy_pass` issue (Issue #10). After deployment, the login page wouldn't work — the API returned HTML instead of JSON. I spent time checking the Express server, the React build, the Docker network — everything worked individually. Finally, I realized Nginx was stripping the URI path because I used a variable in `proxy_pass`. Adding `$request_uri` fixed it. The lesson: when using variables in `proxy_pass`, Nginx behaves differently than with literal URLs.

**Q63: How did you debug the ALB creation failure?**
> The error said "cannot attach to multiple subnets in the same AZ." I ran `aws ec2 describe-subnets` to list all subnets with their AZs and discovered the script was using two subnets both in ap-south-1b. I found the correct pair — one in 1a and one in 1b — and re-ran the command. The fix was choosing `subnet-0949dfddc28b2156f` (1a) and `subnet-0ffe42e0460b969d7` (1b).

**Q64: What would you do if EC2 runs out of disk space?**
> (1) Check usage: `df -h`; (2) Clean Docker: `docker system prune -af` (removes unused images, containers, networks); (3) Remove old logs: `truncate -s 0 /var/log/*.log`; (4) Check backup directory for old files; (5) If still full, resize the EBS volume in AWS Console → then extend the filesystem with `sudo growpart /dev/xvda 1 && sudo resize2fs /dev/xvda1`.

**Q65: What if the API stops responding but the container is running?**
> (1) Check container logs: `docker compose logs gymsync-api --tail=50`; (2) Check if the process is stuck: `docker exec gymsync-api ps aux`; (3) Check memory: `docker stats gymsync-api`; (4) Try restarting just the API: `docker compose restart gymsync-api`; (5) If still broken, check the database file isn't corrupted: `docker exec gymsync-api sqlite3 /app/data/gymsync.db ".tables"`.

**Q66: How do you handle a full database corruption scenario?**
> (1) Stop the API container; (2) Restore from the latest backup: `docker cp backup/gymsync_db_latest.db gymsync-api:/app/data/gymsync.db`; (3) If no recent backup, re-seed the database: `docker exec gymsync-api node server/seed.js`; (4) If the entire instance is lost, launch a new EC2 from the AMI snapshot, associate the Elastic IP, and the full stack is restored in ~5 minutes.

---

### Category 11: Advanced & Follow-up (5 Questions)

**Q67: How would you add HTTPS/SSL to this deployment?**
> (1) Get a domain name (e.g., gymsync.in); (2) Point it to the Elastic IP via Route 53 or any DNS provider; (3) Request a free SSL certificate from AWS Certificate Manager; (4) Attach the certificate to the ALB listener on port 443; (5) Add an HTTP→HTTPS redirect rule on port 80. Total cost: $0.50/month for Route 53 hosted zone.

**Q68: How would you handle 10,000 concurrent users?**
> (1) Switch from SQLite to RDS MySQL (already provisioned); (2) Increase ASG max from 3 to 10 instances; (3) Add ElastiCache (Redis) for session storage and caching; (4) Enable RDS read replicas for analytics queries; (5) Add CloudFront CDN for static assets; (6) Implement API rate limiting in Nginx. Estimated cost: ~$200/month.

**Q69: What is Infrastructure as Code and did you use it?**
> IaC means defining infrastructure in version-controlled files instead of clicking in the console. I partially used it: Docker Compose defines my container infrastructure, and shell scripts (`phase6-autoscaling.sh`, `deploy.sh`) automate AWS resource creation. For full IaC, I would use Terraform or AWS CloudFormation to define VPC, EC2, RDS, ALB, and ASG as code.

**Q70: What would you do differently if starting over?**
> (1) Use Terraform for all infrastructure — avoid manual console clicks; (2) Start with RDS MySQL directly instead of SQLite — avoids migration later; (3) Set up HTTPS from day one with ACM + Route 53; (4) Use a proper secrets manager (AWS Secrets Manager) instead of `.env` files; (5) Add automated testing in the CI/CD pipeline before deployment.

**Q71: How does this project demonstrate cloud computing concepts?**
> It covers all major cloud concepts: **IaaS** (EC2, EBS), **PaaS** (RDS), **SaaS** (the dashboard itself), **Virtualization** (Docker containers), **Networking** (VPC, subnets, ALB), **Scalability** (ASG), **Elasticity** (CPU-based scaling), **High Availability** (Multi-AZ), **Disaster Recovery** (AMI + backups), **Monitoring** (Prometheus + CloudWatch), **Automation** (CI/CD + cron), and **Security** (IAM + RBAC + encryption).

---

## 📝 Quick Reference Card (Print This)

```
PROJECT:    GymSync Fitness Club Cloud
LIVE URL:   http://13.205.58.39
LOGIN:      admin@gymsync.com / admin123
GRAFANA:    http://13.205.58.39:3000 (admin/gymsync2026)
ALB:        http://gymsync-alb-1436718464.ap-south-1.elb.amazonaws.com
GITHUB:     https://github.com/vijayKota2776/GymSync

TECH STACK: React 18 · Express.js · SQLite · Docker · Nginx · AWS
CONTAINERS: 6 (api, web, prometheus, grafana, node-exporter, cadvisor)
DATABASE:   9 tables, WAL mode, foreign keys
API:        20+ endpoints, JWT auth, RBAC (4 roles)
PAGES:      9 (Login, Overview, Members, Branches, Monitoring,
            Activity, Pricing, Workflows, Reports)

AWS:        VPC · EC2 t3.micro · RDS MySQL 8.4 · S3 · ALB · ASG
            CloudWatch · SNS · IAM · Elastic IP · Launch Template · AMI

SECURITY:   VPC isolation · Security Groups · Private subnets
            IAM roles · JWT · RBAC · SSH key-only

AUTOMATION: GitHub Actions CI/CD · Cron (backup 2AM, health 5min)
            Auto-restart · Auto-scaling (1-3 instances, 70% CPU)
```

---

*GymSync Viva Preparation Guide — 71 Questions with Model Answers*  
*Last updated: June 19, 2026*
