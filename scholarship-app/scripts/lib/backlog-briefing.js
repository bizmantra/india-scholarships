/**
 * The backlog part of the morning briefing.
 *
 * Reads Turso directly (read-only): the due dates, notes and waiting flags live in cc_backlog_meta, which is
 * not in the local copy the briefing otherwise works on. The ordering matches the Backlog page
 * (lib/command-center/backlog-types.ts: sortByPriority, buildSections); keep the two in step.
 */
const { connect } = require('./turso-target');

const IMPACTS = ['Critical', 'High', 'Medium', 'Low'];
const DAY = 86400000;
const DUE_SOON_DAYS = 7;
const STALE_DAYS = { 'In Progress': 14, Backlog: 30 };
const TODAY_COUNT = 3;

const parseUtc = s => new Date(String(s).replace(' ', 'T') + 'Z').getTime();
const parseDay = s => new Date(`${s}T00:00:00Z`).getTime();

function daysUntil(due, now) {
    if (!due) return null;
    return Math.round((parseDay(due) - parseDay(new Date(now).toISOString().slice(0, 10))) / DAY);
}

function rankKey(item, now) {
    const left = daysUntil(item.due_date, now);
    const dueBucket = left === null ? 2 : left < 0 ? 0 : left <= DUE_SOON_DAYS ? 1 : 2;
    return [dueBucket, IMPACTS.indexOf(item.impact), item.status === 'In Progress' ? 0 : 1];
}

function sortByPriority(items, now) {
    return [...items].sort((a, b) => {
        const ka = rankKey(a, now);
        const kb = rankKey(b, now);
        for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
        return a.id.localeCompare(b.id, undefined, { numeric: true });
    });
}

// The Backlog page's review date: items it has no record of count as last touched then
const REVIEWED_ON = '2026-10-11 00:00:00';

// Open items from Turso with their due date, note, waiting flag and last-touched time.
// Before the Backlog page has been opened once there is no cc_backlog_meta table: the items still show, without dates or notes.
async function loadOpenItems(target) {
    const { client } = connect(target);
    const meta = await client.execute("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name = 'cc_backlog_meta'");
    const hasMeta = Number(meta.rows[0].n) > 0;
    const res = await client.execute(hasMeta
        ? `SELECT t.id, t.category, t.title, t.impact, t.status, m.due_date, m.note, m.waiting, m.updated_at
           FROM backlog_tasks t LEFT JOIN cc_backlog_meta m ON m.task_id = t.id
           WHERE t.status IN ('Backlog', 'In Progress')`
        : `SELECT id, category, title, impact, status, NULL AS due_date, NULL AS note, 0 AS waiting, NULL AS updated_at
           FROM backlog_tasks WHERE status IN ('Backlog', 'In Progress')`);
    return res.rows.map(r => ({
        id: String(r.id), category: String(r.category || ''), title: String(r.title),
        impact: IMPACTS.includes(r.impact) ? r.impact : 'Medium', status: String(r.status),
        due_date: r.due_date ? String(r.due_date) : null, note: r.note ? String(r.note) : null,
        waiting: Number(r.waiting) === 1, updated_at: r.updated_at ? String(r.updated_at) : REVIEWED_ON,
    }));
}

// What the briefing shows: the three to do today, what is waiting on the owner, what is due within a week (or overdue), what has gone quiet
function summarise(items, now = Date.now()) {
    const slim = i => ({ id: i.id, title: i.title, impact: i.impact, status: i.status, due_in: daysUntil(i.due_date, now), note: i.note });
    const ready = sortByPriority(items.filter(i => !i.waiting), now);
    const dueSoon = sortByPriority(items.filter(i => { const d = daysUntil(i.due_date, now); return d !== null && d <= DUE_SOON_DAYS; }), now);
    const stale = items
        .filter(i => Math.floor((now - parseUtc(i.updated_at)) / DAY) >= STALE_DAYS[i.status])
        .sort((a, b) => parseUtc(a.updated_at) - parseUtc(b.updated_at))
        .map(i => ({ ...slim(i), idle_days: Math.floor((now - parseUtc(i.updated_at)) / DAY) }));
    return {
        open: items.length,
        today: ready.slice(0, TODAY_COUNT).map(slim),
        waiting: sortByPriority(items.filter(i => i.waiting), now).map(slim),
        dueSoon: dueSoon.map(slim),
        stale: stale.filter(i => i.status === 'In Progress').slice(0, 5),
        staleCount: stale.length,
    };
}

// Never lets a backlog problem stop the briefing
async function backlogSection(target) {
    try {
        const items = await loadOpenItems(target);
        return summarise(items);
    } catch (error) {
        console.warn(`⚠️  Could not read the backlog: ${error.message}`);
        return null;
    }
}

module.exports = { backlogSection, summarise, loadOpenItems };
