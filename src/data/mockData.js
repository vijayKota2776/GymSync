/* ==========================================================================
   GymSync — Mock Data Module
   Realistic datasets for the dashboard prototype
   ========================================================================== */

// ---------- Helpers ----------
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #3b82f6, #2563eb)',
  'linear-gradient(135deg, #a855f7, #7c3aed)',
  'linear-gradient(135deg, #22c55e, #16a34a)',
  'linear-gradient(135deg, #f97316, #ea580c)',
  'linear-gradient(135deg, #06b6d4, #0891b2)',
  'linear-gradient(135deg, #ef4444, #dc2626)',
  'linear-gradient(135deg, #eab308, #ca8a04)',
  'linear-gradient(135deg, #ec4899, #db2777)',
];

export function getAvatarGradient(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ---------- Members (50) ----------
const firstNames = ['Priya','Rahul','Anita','Vikram','Neha','Arjun','Kavitha','Rohan','Divya','Sanjay','Meera','Amit','Pooja','Karan','Sneha','Raj','Lakshmi','Deepak','Nisha','Varun','Shreya','Manish','Anjali','Suresh','Ritika','Aditya','Swati','Prakash','Tanvi','Gaurav','Pallavi','Vivek','Simran','Nikhil','Bhavna','Ashwin','Komal','Rajesh','Minal','Harish','Renu','Siddharth','Jaya','Mohit','Aparna','Kunal','Geeta','Tushar','Chitra','Akash'];
const lastNames = ['Sharma','Mehta','Desai','Singh','Patel','Reddy','Nair','Gupta','Kumar','Joshi','Kapoor','Iyer','Bhat','Rao','Mishra','Verma','Agarwal','Choudhary','Pillai','Saxena','Tiwari','Malhotra','Das','Shetty','Naik'];

function generateMembers() {
  const branches = ['Mumbai', 'Pune', 'Bangalore'];
  const plans = ['basic','basic','basic','basic','standard','standard','standard','premium','premium','premium'];
  const statuses = ['active','active','active','active','active','active','active','active','inactive','frozen'];
  const members = [];

  for (let i = 0; i < 50; i++) {
    const name = `${firstNames[i]} ${lastNames[i % lastNames.length]}`;
    const branch = branches[i % 3];
    const branchId = (i % 3) + 1;
    const plan = plans[i % plans.length];
    const status = statuses[i % statuses.length];

    const joinDate = new Date(2023 + Math.floor(i / 20), randomBetween(0, 11), randomBetween(1, 28));
    const daysAgo = status === 'active' ? randomBetween(0, 20) : status === 'inactive' ? randomBetween(60, 180) : randomBetween(30, 90);
    const lastCheckIn = new Date(Date.now() - daysAgo * 86400000);

    let churnRisk = 'low';
    if (daysAgo > 30) churnRisk = 'high';
    else if (daysAgo > 14) churnRisk = 'medium';

    const activityRate = Math.max(0, Math.min(100, 100 - daysAgo * 3 + randomBetween(-10, 10)));
    const totalCheckIns = status === 'active' ? randomBetween(80, 450) : randomBetween(5, 60);

    members.push({
      id: i + 1,
      name,
      email: `${firstNames[i].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@email.com`,
      phone: `+91 ${randomBetween(70000, 99999)}${randomBetween(10000, 99999)}`,
      plan,
      branch,
      branchId,
      status,
      joinDate: joinDate.toISOString(),
      lastCheckIn: lastCheckIn.toISOString(),
      totalCheckIns,
      churnRisk,
      activityRate,
      monthlyCheckIns: Array.from({ length: 6 }, () => status === 'active' ? randomBetween(8, 26) : randomBetween(0, 5)),
    });
  }
  return members;
}

export const members = generateMembers();

// ---------- Branches ----------
export const branches = [
  {
    id: 1, name: 'GymSync Mumbai Central', city: 'Mumbai', region: 'Maharashtra',
    manager: 'Rajesh Kapoor', capacity: 500, currentMembers: 1247,
    monthlyRevenue: 1850000, equipmentCount: 85, maintenancePending: 3,
    address: 'Level 2, Phoenix Mall, Lower Parel', openSince: '2022-03-15',
    rating: 4.6, checkInsToday: 187, peakHour: '7:00 AM',
    color: '#3b82f6'
  },
  {
    id: 2, name: 'GymSync Pune Fitness Hub', city: 'Pune', region: 'Maharashtra',
    manager: 'Sneha Joshi', capacity: 350, currentMembers: 892,
    monthlyRevenue: 1240000, equipmentCount: 62, maintenancePending: 1,
    address: '4th Floor, Seasons Mall, Magarpatta', openSince: '2023-01-10',
    rating: 4.4, checkInsToday: 98, peakHour: '6:30 AM',
    color: '#22c55e'
  },
  {
    id: 3, name: 'GymSync Bangalore Elite', city: 'Bangalore', region: 'Karnataka',
    manager: 'Arun Kumar', capacity: 400, currentMembers: 708,
    monthlyRevenue: 980000, equipmentCount: 55, maintenancePending: 5,
    address: '2nd Floor, Orion Mall, Rajajinagar', openSince: '2023-08-22',
    rating: 4.3, checkInsToday: 57, peakHour: '6:00 AM',
    color: '#a855f7'
  }
];

// ---------- Equipment ----------
const equipTypes = ['Treadmill','Elliptical','Stationary Bike','Rowing Machine','Leg Press','Bench Press','Cable Machine','Dumbbells Set','Smith Machine','Pull-up Station','Lat Pulldown','Chest Press'];

export const equipment = [];
let eqId = 1;
for (const branch of branches) {
  const count = branch.id === 1 ? 14 : branch.id === 2 ? 11 : 10;
  for (let j = 0; j < count; j++) {
    const type = equipTypes[j % equipTypes.length];
    const hoursUsed = randomBetween(100, 1800);
    const condition = Math.max(10, 100 - Math.floor(hoursUsed / 20));
    const statusOptions = hoursUsed > 1500 ? ['maintenance','retired'] : hoursUsed > 1000 ? ['operational','maintenance'] : ['operational'];
    equipment.push({
      id: eqId++,
      name: `${type} #${j + 1}`,
      type,
      branchId: branch.id,
      branch: branch.city,
      purchaseDate: `202${randomBetween(2, 4)}-${String(randomBetween(1, 12)).padStart(2, '0')}-15`,
      hoursUsed,
      maxHours: 2000,
      status: pickRandom(statusOptions),
      lastServiceDate: `2026-0${randomBetween(1, 5)}-${String(randomBetween(1, 28)).padStart(2, '0')}`,
      condition,
    });
  }
}

// ---------- Revenue ----------
export const revenue = {
  months: ['Jul 2025','Aug 2025','Sep 2025','Oct 2025','Nov 2025','Dec 2025','Jan 2026','Feb 2026','Mar 2026','Apr 2026','May 2026','Jun 2026'],
  mumbai:    [1650000,1700000,1720000,1780000,1750000,1800000,1790000,1820000,1830000,1810000,1840000,1850000],
  pune:      [1050000,1080000,1100000,1120000,1110000,1150000,1140000,1170000,1190000,1200000,1220000,1240000],
  bangalore: [ 800000, 830000, 860000, 880000, 890000, 910000, 920000, 940000, 950000, 960000, 970000, 980000],
  categories: { membership: 0.65, personalTraining: 0.18, dayPass: 0.08, supplements: 0.05, merchandise: 0.04 },
};

// ---------- Staff ----------
export const staff = [
  { id: 1, name:'Rajesh Kapoor', role:'manager', branch:'Mumbai', branchId:1, status:'active' },
  { id: 2, name:'Sneha Joshi', role:'manager', branch:'Pune', branchId:2, status:'active' },
  { id: 3, name:'Arun Kumar', role:'manager', branch:'Bangalore', branchId:3, status:'active' },
  { id: 4, name:'Vijay Kota', role:'admin', branch:'All', branchId:0, status:'active' },
  { id: 5, name:'Deepa Menon', role:'trainer', branch:'Mumbai', branchId:1, status:'active' },
  { id: 6, name:'Sunil Patil', role:'trainer', branch:'Mumbai', branchId:1, status:'on-leave' },
  { id: 7, name:'Ravi Shankar', role:'trainer', branch:'Pune', branchId:2, status:'active' },
  { id: 8, name:'Meena Reddy', role:'trainer', branch:'Bangalore', branchId:3, status:'active' },
  { id: 9, name:'Aisha Khan', role:'receptionist', branch:'Mumbai', branchId:1, status:'active' },
  { id: 10, name:'Preeti Nair', role:'receptionist', branch:'Pune', branchId:2, status:'active' },
  { id: 11, name:'Sundar Rajan', role:'receptionist', branch:'Bangalore', branchId:3, status:'active' },
  { id: 12, name:'Nitin Bose', role:'trainer', branch:'Mumbai', branchId:1, status:'active' },
  { id: 13, name:'Kavya Iyer', role:'trainer', branch:'Pune', branchId:2, status:'active' },
  { id: 14, name:'Ramesh Gupta', role:'trainer', branch:'Bangalore', branchId:3, status:'on-leave' },
  { id: 15, name:'Fatima Shaikh', role:'receptionist', branch:'Mumbai', branchId:1, status:'active' },
];

// ---------- Activity Generator ----------
const activityTemplates = {
  checkin: () => {
    const m = pickRandom(members);
    return { type: 'checkin', message: `<strong>${m.name}</strong> checked in at ${m.branch}`, branch: m.branch, icon: '→' };
  },
  payment: () => {
    const m = pickRandom(members);
    const amount = pickRandom([1999, 2999, 4999, 7999, 9999]);
    return { type: 'payment', message: `Payment received: <strong>₹${amount.toLocaleString('en-IN')}</strong> from ${m.name}`, branch: m.branch, icon: '₹' };
  },
  alert: () => {
    const msgs = [
      { msg: `CPU usage at <strong>${randomBetween(72, 88)}%</strong> on production server`, branch: 'System' },
      { msg: `High traffic detected at <strong>${pickRandom(['Mumbai','Pune','Bangalore'])}</strong> branch`, branch: pickRandom(['Mumbai','Pune','Bangalore']) },
      { msg: `Database connection pool at <strong>${randomBetween(75, 95)}%</strong> capacity`, branch: 'System' },
    ];
    const pick = pickRandom(msgs);
    return { type: 'alert', message: pick.msg, branch: pick.branch, icon: '⚠' };
  },
  maintenance: () => {
    const eq = pickRandom(equipment);
    const msgs = [
      `Equipment alert: <strong>${eq.name}</strong> at ${eq.branch} needs service`,
      `Maintenance completed: <strong>${eq.name}</strong> at ${eq.branch}`,
    ];
    return { type: 'maintenance', message: pickRandom(msgs), branch: eq.branch, icon: '🔧' };
  },
  member: () => {
    const m = pickRandom(members);
    const msgs = [
      `New member registered: <strong>${m.name}</strong> at ${m.branch}`,
      `<strong>${m.name}</strong> upgraded to <strong>${pickRandom(['standard','premium'])}</strong> plan`,
    ];
    return { type: 'member', message: pickRandom(msgs), branch: m.branch, icon: '👤' };
  },
};

export function generateActivity() {
  const types = ['checkin','checkin','checkin','payment','alert','maintenance','member','checkin','payment','member'];
  const type = pickRandom(types);
  const event = activityTemplates[type]();
  const minutesAgo = randomBetween(0, 5);
  return { ...event, time: new Date(Date.now() - minutesAgo * 60000), id: Date.now() + Math.random() };
}

export function generateInitialActivities(count = 15) {
  const activities = [];
  for (let i = 0; i < count; i++) {
    const event = generateActivity();
    event.time = new Date(Date.now() - i * randomBetween(120000, 600000));
    event.id = Date.now() + i + Math.random();
    activities.push(event);
  }
  return activities;
}

// ---------- Metrics Generator ----------
export function generateMetrics() {
  const t = Date.now() / 10000;
  return {
    cpu: Math.max(8, Math.min(92, 28 + Math.random() * 18 + Math.sin(t) * 10)),
    memory: Math.max(40, Math.min(90, 60 + Math.random() * 12 + Math.sin(t * 0.7) * 5)),
    disk: Math.max(55, Math.min(75, 62 + Math.random() * 3)),
    network: { in: randomFloat(1.5, 5.5), out: randomFloat(0.8, 3.2) },
    requests: randomBetween(100, 220),
    uptime: '14d 3h 27m',
  };
}

// ---------- Weekly Check-in Data ----------
export function getWeeklyCheckIns() {
  return {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'Mumbai', data: [65, 59, 80, 81, 56, 95, 72], color: '#3b82f6' },
      { label: 'Pune', data: [45, 42, 55, 52, 38, 68, 50], color: '#22c55e' },
      { label: 'Bangalore', data: [32, 28, 40, 38, 25, 52, 35], color: '#a855f7' },
    ],
  };
}

// ---------- Plan Distribution ----------
export function getPlanDistribution() {
  const basic = members.filter(m => m.plan === 'basic').length;
  const standard = members.filter(m => m.plan === 'standard').length;
  const premium = members.filter(m => m.plan === 'premium').length;
  return {
    labels: ['Basic', 'Standard', 'Premium'],
    values: [basic, standard, premium],
    colors: ['#94a3b8', '#3b82f6', '#a855f7'],
  };
}

// ---------- Utility Functions ----------
export function formatCurrency(num) {
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${num.toLocaleString('en-IN')}`;
  return `₹${num}`;
}

export function formatNumber(num) {
  return num.toLocaleString('en-IN');
}

export function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
