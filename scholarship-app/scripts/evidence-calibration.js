/**
 * How well does the evidence score (scripts/lib/evidence.js) match your decisions in the inbox?
 *
 * Reads decided proposals that carry a score and reports, per score band, how many were approved vs rejected.
 * A useful score puts approvals in "strong" and rejections in "weak". Use it to tune the weights in evidence.js
 * and to decide when (if ever) strong proposals could be approved automatically.
 *
 * Usage (after `npm run db:pull`): node scripts/evidence-calibration.js
 */
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, '..', 'data', 'scholarships.db'), { readonly: true });
const rows = db.prepare(`SELECT status, field, evidence_json FROM agent_proposals
    WHERE kind = 'field_change' AND status IN ('approved', 'rejected', 'published') AND evidence_json IS NOT NULL`).all();

const bands = { strong: { approved: 0, rejected: 0 }, fair: { approved: 0, rejected: 0 }, weak: { approved: 0, rejected: 0 } };
const scores = { approved: [], rejected: [] };
let scored = 0;
for (const r of rows) {
    let e;
    try { e = JSON.parse(r.evidence_json); } catch { continue; }
    if (typeof e.score !== 'number') continue;
    scored++;
    const decision = r.status === 'rejected' ? 'rejected' : 'approved';
    bands[e.band || 'weak'][decision]++;
    scores[decision].push(e.score);
}
const mean = a => (a.length ? (a.reduce((s, x) => s + x, 0) / a.length).toFixed(1) : 'n/a');
console.log(`Decided proposals with an evidence score: ${scored} (of ${rows.length} decided with evidence)`);
if (scored < 30) console.log('Too few to draw conclusions yet. Come back after more inbox decisions.');
console.log(`Average score: approved ${mean(scores.approved)} (n=${scores.approved.length}) | rejected ${mean(scores.rejected)} (n=${scores.rejected.length})\n`);
console.log('band      approved  rejected  approval rate');
for (const [band, c] of Object.entries(bands)) {
    const n = c.approved + c.rejected;
    console.log(`${band.padEnd(9)} ${String(c.approved).padStart(8)}  ${String(c.rejected).padStart(8)}  ${n ? `${Math.round(100 * c.approved / n)}%` : '-'}`);
}
db.close();
