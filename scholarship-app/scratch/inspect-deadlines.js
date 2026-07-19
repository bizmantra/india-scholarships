const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

const rows = db.prepare(`
  SELECT id, title, slug, deadline, verified_status, is_popular, is_featured, amount_annual
  FROM scholarships
`).all();

console.log(`Total scholarships in database: ${rows.length}`);

// Let's filter those with deadlines in July, August, September
const activeInNext3Months = rows.filter(r => {
  if (!r.deadline) return false;
  // deadlines are usually formatted as YYYY-MM-DD or text like '2026-07-31', '2026-08-31', '2026-09-30'
  // Let's see if the deadline matches 07, 08, 09
  return /202[56]-(07|08|09)-/.test(r.deadline) || /-(07|08|09)-/.test(r.deadline);
});

console.log(`\nScholarships with deadlines in July, August, September (next 3 months, based on deadline string): ${activeInNext3Months.length}`);
console.log("Top 15 active in next 3 months by annual amount:");
activeInNext3Months.sort((a,b) => (b.amount_annual || 0) - (a.amount_annual || 0));
activeInNext3Months.slice(0, 15).forEach(r => {
  console.log(`- ${r.title} (${r.id}): Deadline: ${r.deadline}, Amount: ${r.amount_annual}, Popular: ${r.is_popular}, Featured: ${r.is_featured}`);
});

// Let's check expired deadlines (e.g., before June 2026, or 2024/2025)
const expiredOrPast = rows.filter(r => {
  if (!r.deadline) return false;
  return r.deadline < '2026-07-01' && r.deadline !== 'NA' && r.deadline !== 'Not specified';
});
console.log(`\nScholarships with past/expired deadlines (before 2026-07-01): ${expiredOrPast.length}`);
console.log("Top 15 expired/past by annual amount:");
expiredOrPast.sort((a,b) => (b.amount_annual || 0) - (a.amount_annual || 0));
expiredOrPast.slice(0, 15).forEach(r => {
  console.log(`- ${r.title} (${r.id}): Deadline: ${r.deadline}, Amount: ${r.amount_annual}, Popular: ${r.is_popular}, Featured: ${r.is_featured}`);
});

// Let's count popular/featured scholarships
const popularCount = rows.filter(r => r.is_popular === 1).length;
const featuredCount = rows.filter(r => r.is_featured === 1).length;
console.log(`\nPopular scholarships: ${popularCount}`);
console.log(`Featured scholarships: ${featuredCount}`);

db.close();
