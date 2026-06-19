/* ==========================================================================
   GymSync — Database Setup (SQLite via better-sqlite3)
   Creates schema on first run, exports db instance
   ========================================================================== */
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'gymsync.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT NOT NULL,
    capacity INTEGER DEFAULT 500,
    address TEXT,
    rating REAL DEFAULT 4.5,
    peak_hour TEXT DEFAULT '07:00 AM',
    color TEXT DEFAULT '#3b82f6',
    open_since TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','manager','trainer','receptionist')),
    branch_id INTEGER,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    plan TEXT NOT NULL CHECK(plan IN ('basic','standard','premium')),
    branch_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive','frozen','at-risk')),
    join_date TEXT DEFAULT (date('now')),
    churn_risk REAL DEFAULT 0,
    activity_rate REAL DEFAULT 0.5,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    branch_id INTEGER NOT NULL,
    check_in TEXT DEFAULT (datetime('now')),
    check_out TEXT,
    type TEXT DEFAULT 'regular',
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    branch_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','maintenance','retired')),
    condition_pct INTEGER DEFAULT 100,
    hours_used INTEGER DEFAULT 0,
    max_hours INTEGER DEFAULT 5000,
    purchase_date TEXT,
    last_service TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    branch_id INTEGER NOT NULL,
    payment_date TEXT DEFAULT (date('now')),
    method TEXT DEFAULT 'upi',
    status TEXT DEFAULT 'completed',
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id INTEGER NOT NULL,
    requested_by INTEGER,
    assigned_to INTEGER,
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','critical')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','cancelled')),
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    resolved_at TEXT,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
  );

  CREATE TABLE IF NOT EXISTS workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('leave_request','equipment_purchase','member_complaint','plan_change')),
    requester_id INTEGER NOT NULL,
    approver_id INTEGER,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
    data_json TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (requester_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    branch TEXT,
    user_id INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

export default db;
