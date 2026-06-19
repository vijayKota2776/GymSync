/* ==========================================================================
   GymSync — Seed Script
   Populates database with realistic Indian gym data
   Run: node server/seed.js
   ========================================================================== */
import db from './db.js';
import bcrypt from 'bcryptjs';

// Check if already seeded
const count = db.prepare('SELECT COUNT(*) as c FROM branches').get();
if (count.c > 0) {
  console.log('✓ Database already seeded. Skipping.');
  process.exit(0);
}

console.log('Seeding database...');
const salt = bcrypt.genSaltSync(10);

// ---------- Branches ----------
const insertBranch = db.prepare(`INSERT INTO branches (name, city, region, capacity, address, rating, peak_hour, color, open_since) VALUES (?,?,?,?,?,?,?,?,?)`);
insertBranch.run('GymSync Mumbai Central', 'Mumbai', 'Maharashtra', 500, 'Andheri West, Mumbai 400058', 4.6, '07:00 AM', '#3b82f6', '2022-01-15');
insertBranch.run('GymSync Pune Fitness Hub', 'Pune', 'Maharashtra', 350, 'Koregaon Park, Pune 411001', 4.4, '06:30 AM', '#22c55e', '2022-06-01');
insertBranch.run('GymSync Bangalore Elite', 'Bangalore', 'Karnataka', 400, 'Indiranagar, Bengaluru 560038', 4.3, '06:00 AM', '#a855f7', '2023-01-10');

// ---------- Staff Users ----------
const insertUser = db.prepare(`INSERT INTO users (name, email, password_hash, role, branch_id, status) VALUES (?,?,?,?,?,?)`);
const staff = [
  // Mumbai
  ['Rajesh Kapoor', 'admin@gymsync.com', 'admin123', 'admin', 1],
  ['Anita Desai', 'anita.desai@gymsync.com', 'password123', 'manager', 1],
  ['Vikram Malhotra', 'vikram.m@gymsync.com', 'password123', 'trainer', 1],
  ['Priya Nair', 'priya.nair@gymsync.com', 'password123', 'trainer', 1],
  ['Deepak Sharma', 'deepak.s@gymsync.com', 'password123', 'receptionist', 1],
  // Pune
  ['Sneha Joshi', 'sneha.joshi@gymsync.com', 'password123', 'manager', 2],
  ['Amit Kulkarni', 'amit.k@gymsync.com', 'password123', 'trainer', 2],
  ['Neha Patil', 'neha.patil@gymsync.com', 'password123', 'trainer', 2],
  ['Rahul Deshpande', 'rahul.d@gymsync.com', 'password123', 'receptionist', 2],
  ['Kavita Mehta', 'kavita.m@gymsync.com', 'password123', 'trainer', 2],
  // Bangalore
  ['Arun Kumar', 'arun.kumar@gymsync.com', 'password123', 'manager', 3],
  ['Lakshmi Rao', 'lakshmi.r@gymsync.com', 'password123', 'trainer', 3],
  ['Suresh Reddy', 'suresh.r@gymsync.com', 'password123', 'trainer', 3],
  ['Meera Iyer', 'meera.iyer@gymsync.com', 'password123', 'receptionist', 3],
  ['Karthik Shetty', 'karthik.s@gymsync.com', 'password123', 'trainer', 3],
];
for (const [name, email, pass, role, branch] of staff) {
  insertUser.run(name, email, bcrypt.hashSync(pass, salt), role, branch, 'active');
}

// ---------- Members ----------
const insertMember = db.prepare(`INSERT INTO members (name, email, phone, plan, branch_id, status, join_date, churn_risk, activity_rate) VALUES (?,?,?,?,?,?,?,?,?)`);
const memberData = [
  ['Aarav Patel', 'aarav.patel@email.com', '+91 98765 10001', 'premium', 1, 'active', '2023-03-15', 0.1, 0.92],
  ['Diya Sharma', 'diya.sharma@email.com', '+91 98765 10002', 'standard', 1, 'active', '2023-05-20', 0.15, 0.85],
  ['Vivaan Gupta', 'vivaan.gupta@email.com', '+91 98765 10003', 'premium', 1, 'active', '2023-01-10', 0.05, 0.95],
  ['Ananya Singh', 'ananya.singh@email.com', '+91 98765 10004', 'basic', 1, 'at-risk', '2023-08-01', 0.65, 0.3],
  ['Arjun Mehta', 'arjun.mehta@email.com', '+91 98765 10005', 'standard', 1, 'active', '2023-04-12', 0.2, 0.78],
  ['Ishita Kapoor', 'ishita.kapoor@email.com', '+91 98765 10006', 'premium', 1, 'active', '2023-02-28', 0.08, 0.88],
  ['Kabir Joshi', 'kabir.joshi@email.com', '+91 98765 10007', 'basic', 1, 'inactive', '2023-09-15', 0.85, 0.1],
  ['Sara Khan', 'sara.khan@email.com', '+91 98765 10008', 'standard', 1, 'active', '2023-06-03', 0.12, 0.82],
  ['Rohan Desai', 'rohan.desai@email.com', '+91 98765 10009', 'premium', 1, 'active', '2023-01-22', 0.06, 0.91],
  ['Tara Nair', 'tara.nair@email.com', '+91 98765 10010', 'basic', 1, 'active', '2023-07-18', 0.35, 0.55],
  ['Aditya Reddy', 'aditya.reddy@email.com', '+91 98765 10011', 'standard', 1, 'active', '2023-04-05', 0.18, 0.76],
  ['Mira Iyer', 'mira.iyer@email.com', '+91 98765 10012', 'premium', 1, 'active', '2023-03-01', 0.1, 0.87],
  ['Dev Malhotra', 'dev.malhotra@email.com', '+91 98765 10013', 'basic', 1, 'frozen', '2023-10-20', 0.7, 0.15],
  ['Riya Verma', 'riya.verma@email.com', '+91 98765 10014', 'standard', 1, 'active', '2023-05-11', 0.22, 0.72],
  ['Karan Sinha', 'karan.sinha@email.com', '+91 98765 10015', 'premium', 1, 'active', '2023-02-14', 0.04, 0.93],
  ['Nisha Thakur', 'nisha.thakur@email.com', '+91 98765 10016', 'basic', 1, 'active', '2023-08-25', 0.28, 0.62],
  ['Arnav Pillai', 'arnav.pillai@email.com', '+91 98765 10017', 'standard', 1, 'at-risk', '2023-06-30', 0.55, 0.38],
  // Pune members
  ['Prachi Kulkarni', 'prachi.k@email.com', '+91 98765 20001', 'premium', 2, 'active', '2023-04-10', 0.08, 0.9],
  ['Siddharth Patil', 'siddharth.p@email.com', '+91 98765 20002', 'standard', 2, 'active', '2023-05-22', 0.15, 0.8],
  ['Aditi Deshpande', 'aditi.d@email.com', '+91 98765 20003', 'basic', 2, 'active', '2023-07-14', 0.3, 0.58],
  ['Yash Bhosale', 'yash.b@email.com', '+91 98765 20004', 'premium', 2, 'active', '2023-03-08', 0.06, 0.92],
  ['Pooja Chavan', 'pooja.c@email.com', '+91 98765 20005', 'standard', 2, 'at-risk', '2023-08-19', 0.52, 0.35],
  ['Manish Jagtap', 'manish.j@email.com', '+91 98765 20006', 'basic', 2, 'inactive', '2023-10-01', 0.8, 0.12],
  ['Shruti Wagh', 'shruti.w@email.com', '+91 98765 20007', 'premium', 2, 'active', '2023-02-17', 0.07, 0.89],
  ['Rohit Gaikwad', 'rohit.g@email.com', '+91 98765 20008', 'standard', 2, 'active', '2023-06-25', 0.2, 0.74],
  ['Neelam More', 'neelam.m@email.com', '+91 98765 20009', 'basic', 2, 'active', '2023-09-05', 0.38, 0.5],
  ['Akash Khade', 'akash.k@email.com', '+91 98765 20010', 'premium', 2, 'active', '2023-01-30', 0.05, 0.94],
  ['Tanvi Shinde', 'tanvi.s@email.com', '+91 98765 20011', 'standard', 2, 'active', '2023-04-18', 0.16, 0.79],
  ['Vishal Sawant', 'vishal.s@email.com', '+91 98765 20012', 'basic', 2, 'frozen', '2023-11-02', 0.72, 0.18],
  ['Pallavi Pawar', 'pallavi.p@email.com', '+91 98765 20013', 'standard', 2, 'active', '2023-05-09', 0.19, 0.77],
  ['Nikhil Deshmukh', 'nikhil.d@email.com', '+91 98765 20014', 'premium', 2, 'active', '2023-03-20', 0.09, 0.86],
  ['Rutuja Kadam', 'rutuja.k@email.com', '+91 98765 20015', 'basic', 2, 'active', '2023-07-28', 0.32, 0.56],
  ['Omkar Joshi', 'omkar.j@email.com', '+91 98765 20016', 'standard', 2, 'at-risk', '2023-06-12', 0.48, 0.4],
  // Bangalore members
  ['Divya Rao', 'divya.rao@email.com', '+91 98765 30001', 'premium', 3, 'active', '2023-05-15', 0.07, 0.91],
  ['Harsha Hegde', 'harsha.h@email.com', '+91 98765 30002', 'standard', 3, 'active', '2023-06-20', 0.14, 0.81],
  ['Chaitra Shetty', 'chaitra.s@email.com', '+91 98765 30003', 'basic', 3, 'active', '2023-08-10', 0.25, 0.63],
  ['Manoj Gowda', 'manoj.g@email.com', '+91 98765 30004', 'premium', 3, 'active', '2023-03-25', 0.05, 0.93],
  ['Sowmya Prasad', 'sowmya.p@email.com', '+91 98765 30005', 'standard', 3, 'at-risk', '2023-09-08', 0.58, 0.32],
  ['Naveen Acharya', 'naveen.a@email.com', '+91 98765 30006', 'basic', 3, 'inactive', '2023-10-15', 0.82, 0.08],
  ['Rashmi Bhat', 'rashmi.b@email.com', '+91 98765 30007', 'premium', 3, 'active', '2023-02-05', 0.06, 0.9],
  ['Ganesh Naik', 'ganesh.n@email.com', '+91 98765 30008', 'standard', 3, 'active', '2023-07-01', 0.18, 0.75],
  ['Swathi Kumari', 'swathi.k@email.com', '+91 98765 30009', 'basic', 3, 'active', '2023-08-28', 0.34, 0.52],
  ['Prashanth Murthy', 'prashanth.m@email.com', '+91 98765 30010', 'premium', 3, 'active', '2023-01-18', 0.04, 0.95],
  ['Bhavya Nayak', 'bhavya.n@email.com', '+91 98765 30011', 'standard', 3, 'active', '2023-05-02', 0.17, 0.78],
  ['Raghav Iyengar', 'raghav.i@email.com', '+91 98765 30012', 'basic', 3, 'frozen', '2023-11-10', 0.68, 0.2],
  ['Deepika Srinivas', 'deepika.s@email.com', '+91 98765 30013', 'standard', 3, 'active', '2023-04-22', 0.21, 0.73],
  ['Vijay Shankar', 'vijay.s@email.com', '+91 98765 30014', 'premium', 3, 'active', '2023-03-12', 0.08, 0.88],
  ['Kavya Prabhu', 'kavya.p@email.com', '+91 98765 30015', 'basic', 3, 'active', '2023-09-20', 0.29, 0.6],
  ['Sunil Reddy', 'sunil.r@email.com', '+91 98765 30016', 'standard', 3, 'at-risk', '2023-07-15', 0.5, 0.42],
  ['Asha Hegde', 'asha.h@email.com', '+91 98765 30017', 'premium', 3, 'active', '2023-02-22', 0.03, 0.96],
];
for (const m of memberData) {
  insertMember.run(...m);
}

// ---------- Equipment ----------
const insertEquip = db.prepare(`INSERT INTO equipment (name, type, branch_id, status, condition_pct, hours_used, max_hours, purchase_date, last_service) VALUES (?,?,?,?,?,?,?,?,?)`);
const equipmentData = [
  // Mumbai
  ['Treadmill Pro X1', 'cardio', 1, 'active', 85, 3200, 5000, '2022-02-01', '2024-01-15'],
  ['Treadmill Pro X2', 'cardio', 1, 'active', 78, 3600, 5000, '2022-02-01', '2024-02-10'],
  ['Treadmill Pro X3', 'cardio', 1, 'maintenance', 25, 4800, 5000, '2022-02-01', '2024-03-20'],
  ['Elliptical E500', 'cardio', 1, 'active', 90, 2100, 5000, '2022-06-15', '2024-01-05'],
  ['Spin Bike S200', 'cardio', 1, 'active', 92, 1800, 4000, '2022-08-01', '2024-02-20'],
  ['Lat Pulldown Machine', 'strength', 1, 'active', 88, 2800, 6000, '2022-03-10', '2024-01-25'],
  ['Leg Press LP400', 'strength', 1, 'active', 82, 3100, 6000, '2022-03-10', '2024-02-15'],
  ['Cable Crossover', 'strength', 1, 'active', 95, 1200, 6000, '2023-01-15', '2024-03-01'],
  ['Dumbbell Set (5-50kg)', 'free_weights', 1, 'active', 75, 0, 0, '2022-01-20', '2024-01-01'],
  ['Bench Press Station', 'strength', 1, 'active', 80, 2900, 6000, '2022-03-10', '2024-02-28'],
  ['Rowing Machine R200', 'cardio', 1, 'active', 88, 2400, 5000, '2022-09-01', '2024-01-18'],
  ['Smith Machine', 'strength', 1, 'active', 86, 2600, 6000, '2022-04-15', '2024-03-05'],
  // Pune
  ['Treadmill Pro X1', 'cardio', 2, 'active', 80, 3400, 5000, '2022-07-01', '2024-01-20'],
  ['Treadmill Pro X2', 'cardio', 2, 'active', 72, 3900, 5000, '2022-07-01', '2024-02-05'],
  ['Elliptical E500', 'cardio', 2, 'active', 88, 2300, 5000, '2022-09-15', '2024-01-12'],
  ['Spin Bike S200', 'cardio', 2, 'active', 91, 1600, 4000, '2022-10-01', '2024-02-25'],
  ['Leg Press LP400', 'strength', 2, 'active', 79, 3300, 6000, '2022-07-10', '2024-01-30'],
  ['Cable Crossover', 'strength', 2, 'active', 93, 1400, 6000, '2023-03-01', '2024-03-10'],
  ['Dumbbell Set (5-40kg)', 'free_weights', 2, 'active', 70, 0, 0, '2022-06-15', '2024-01-05'],
  ['Bench Press Station', 'strength', 2, 'maintenance', 22, 5500, 6000, '2022-07-10', '2024-02-12'],
  ['Rowing Machine R200', 'cardio', 2, 'active', 85, 2600, 5000, '2022-11-01', '2024-01-22'],
  ['Kettlebell Set', 'free_weights', 2, 'active', 82, 0, 0, '2023-01-10', '2024-02-08'],
  // Bangalore
  ['Treadmill Pro X1', 'cardio', 3, 'active', 92, 2100, 5000, '2023-02-01', '2024-02-15'],
  ['Treadmill Pro X2', 'cardio', 3, 'active', 88, 2500, 5000, '2023-02-01', '2024-03-01'],
  ['Elliptical E500', 'cardio', 3, 'active', 95, 1200, 5000, '2023-03-15', '2024-02-20'],
  ['Spin Bike S200', 'cardio', 3, 'active', 97, 800, 4000, '2023-04-01', '2024-03-10'],
  ['Lat Pulldown Machine', 'strength', 3, 'active', 94, 1500, 6000, '2023-02-10', '2024-02-25'],
  ['Leg Press LP400', 'strength', 3, 'active', 90, 1800, 6000, '2023-02-10', '2024-03-05'],
  ['Cable Crossover', 'strength', 3, 'active', 98, 600, 6000, '2023-06-01', '2024-03-15'],
  ['Dumbbell Set (5-50kg)', 'free_weights', 3, 'active', 88, 0, 0, '2023-01-15', '2024-01-15'],
  ['Smith Machine', 'strength', 3, 'maintenance', 18, 5200, 6000, '2023-02-10', '2024-01-10'],
  ['Battle Ropes', 'functional', 3, 'active', 85, 0, 0, '2023-05-01', '2024-02-01'],
  ['TRX Suspension Kit', 'functional', 3, 'active', 90, 0, 0, '2023-05-01', '2024-02-01'],
  ['Assault Bike', 'cardio', 3, 'active', 93, 1100, 4000, '2023-04-15', '2024-03-08'],
  ['Power Rack', 'strength', 3, 'active', 96, 900, 6000, '2023-03-01', '2024-02-18'],
];
for (const e of equipmentData) {
  insertEquip.run(...e);
}

// ---------- Attendance (last 30 days) ----------
const insertAtt = db.prepare(`INSERT INTO attendance (member_id, branch_id, check_in, check_out, type) VALUES (?,?,?,?,?)`);
const now = new Date();
for (let day = 0; day < 30; day++) {
  const d = new Date(now);
  d.setDate(d.getDate() - day);
  const dateStr = d.toISOString().slice(0, 10);
  // Random check-ins per day
  const checkIns = 5 + Math.floor(Math.random() * 8);
  for (let i = 0; i < checkIns; i++) {
    const memberId = 1 + Math.floor(Math.random() * 50);
    const branchId = memberId <= 17 ? 1 : memberId <= 33 ? 2 : 3;
    const hour = 5 + Math.floor(Math.random() * 14);
    const minute = Math.floor(Math.random() * 60);
    const checkIn = `${dateStr} ${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00`;
    const outHour = hour + 1 + Math.floor(Math.random() * 2);
    const checkOut = outHour < 22 ? `${dateStr} ${String(outHour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00` : null;
    insertAtt.run(memberId, branchId, checkIn, checkOut, 'regular');
  }
}

// ---------- Payments (last 6 months) ----------
const insertPay = db.prepare(`INSERT INTO payments (member_id, amount, category, branch_id, payment_date, method, status) VALUES (?,?,?,?,?,?,?)`);
const categories = ['membership', 'personal_training', 'day_pass', 'supplements', 'merchandise'];
const methods = ['upi', 'card', 'cash', 'netbanking'];
const planPrices = { basic: 1500, standard: 3000, premium: 5000 };
for (let m = 0; m < 6; m++) {
  const monthDate = new Date(now);
  monthDate.setMonth(monthDate.getMonth() - m);
  const dateStr = monthDate.toISOString().slice(0, 10);
  for (let i = 0; i < 18; i++) {
    const memberId = 1 + Math.floor(Math.random() * 50);
    const branchId = memberId <= 17 ? 1 : memberId <= 33 ? 2 : 3;
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const amount = cat === 'membership' ? planPrices[['basic','standard','premium'][Math.floor(Math.random()*3)]] :
                   cat === 'personal_training' ? 2000 + Math.floor(Math.random() * 3000) :
                   cat === 'day_pass' ? 200 + Math.floor(Math.random() * 300) :
                   500 + Math.floor(Math.random() * 2000);
    insertPay.run(memberId, amount, cat, branchId, dateStr, methods[Math.floor(Math.random()*methods.length)], 'completed');
  }
}

// ---------- Maintenance ----------
const insertMaint = db.prepare(`INSERT INTO maintenance (equipment_id, requested_by, assigned_to, priority, status, description, created_at, resolved_at) VALUES (?,?,?,?,?,?,?,?)`);
insertMaint.run(3, 1, 3, 'high', 'in_progress', 'Belt worn out, needs replacement', '2024-03-18', null);
insertMaint.run(20, 6, 7, 'critical', 'pending', 'Frame crack detected during inspection', '2024-03-20', null);
insertMaint.run(31, 11, 12, 'high', 'pending', 'Motor overheating after 30 min use', '2024-03-19', null);
insertMaint.run(9, 1, 3, 'low', 'completed', 'Rubber coating peeling on 30kg dumbbells', '2024-02-15', '2024-02-18');
insertMaint.run(14, 6, 7, 'medium', 'completed', 'Display screen flickering', '2024-02-20', '2024-02-25');
insertMaint.run(1, 1, 4, 'medium', 'completed', 'Routine maintenance and belt tightening', '2024-01-10', '2024-01-15');

// ---------- Workflows ----------
const insertWf = db.prepare(`INSERT INTO workflows (type, requester_id, approver_id, status, data_json, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)`);
insertWf.run('leave_request', 3, null, 'pending', '{"start_date":"2024-04-01","end_date":"2024-04-05","reason":"Family event"}', 'Need 5 days off for sister wedding', '2024-03-18', '2024-03-18');
insertWf.run('equipment_purchase', 2, 1, 'approved', '{"item":"Concept2 RowErg","qty":2,"cost":95000}', 'Need 2 rowing machines for new HIIT classes', '2024-03-10', '2024-03-12');
insertWf.run('member_complaint', 5, null, 'pending', '{"member_id":4,"issue":"AC not working in evening slots"}', 'Multiple members complained about temperature', '2024-03-19', '2024-03-19');
insertWf.run('plan_change', 9, 6, 'approved', '{"member_id":20,"from":"basic","to":"premium"}', 'Member requested upgrade', '2024-03-15', '2024-03-16');
insertWf.run('leave_request', 12, null, 'pending', '{"start_date":"2024-04-10","end_date":"2024-04-12","reason":"Medical"}', 'Doctor appointment and recovery', '2024-03-20', '2024-03-20');

// ---------- Activity Log ----------
const insertLog = db.prepare(`INSERT INTO activity_log (type, message, branch, user_id, created_at) VALUES (?,?,?,?,?)`);
const logEntries = [
  ['checkin', 'Aarav Patel checked in', 'Mumbai', null],
  ['payment', 'Payment of ₹5,000 received from Vivaan Gupta', 'Mumbai', null],
  ['alert', 'CPU spike to 78% — auto-resolved', 'System', null],
  ['member', 'New member registration: Karan Sinha', 'Mumbai', null],
  ['maintenance', 'Treadmill Pro X3 sent for maintenance', 'Mumbai', null],
  ['checkin', 'Prachi Kulkarni checked in', 'Pune', null],
  ['payment', 'Payment of ₹3,000 received from Siddharth Patil', 'Pune', null],
  ['checkin', 'Divya Rao checked in', 'Bangalore', null],
  ['alert', 'Backup completed successfully', 'System', null],
  ['member', 'Member plan upgrade: Aditi Deshpande (Basic → Standard)', 'Pune', null],
];
for (const [type, msg, branch, uid] of logEntries) {
  insertLog.run(type, msg, branch, uid, new Date(now.getTime() - Math.random() * 86400000 * 7).toISOString());
}

console.log('✓ Database seeded successfully!');
console.log(`  - 3 branches`);
console.log(`  - ${staff.length} staff users`);
console.log(`  - ${memberData.length} members`);
console.log(`  - ${equipmentData.length} equipment items`);
console.log(`  - 200+ attendance records`);
console.log(`  - 100+ payment records`);
console.log(`  - 6 maintenance records`);
console.log(`  - 5 workflow items`);
process.exit(0);
