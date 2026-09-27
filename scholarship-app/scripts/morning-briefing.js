/**
 * Morning Briefing
 *
 * A daily one-page summary for the owner: what needs a decision, what the agents did in the last
 * 24 hours, which scholarships close this week and which still show as open after their deadline.
 *
 * Read-only on scholarship data. It saves the briefing as an agent_events row (kind 'briefing', shown
 * in the Agent Center) and writes data/morning-briefing.html for the email step.
 * Runs on the local copy: pull → briefing → push (only the event row is new).
 *
 * Usage: node scripts/morning-briefing.js [--dry-run]
 *   GITHUB_TOKEN (set automatically in GitHub Actions) adds the list of agent runs.
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const inbox = require('./lib/agent-inbox');

const AGENT = 'morning-briefing';
const dryRun = process.argv.includes('--dry-run');
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = process.env.LOCAL_DB_PATH || path.join(DATA_DIR, 'scholarships.db');
const REPO = process.env.GITHUB_REPOSITORY || 'bizmantra/india-scholarships';
const SITE = process.env.SITE_URL || 'https://www.indiascholarships.in';

const CATEGORY_LABELS = {
    date_change: 'Deadline changes',
    new_scholarship: 'New scholarships',
    amount_change: 'Amount changes',
    link_change: 'Link changes',
    contact_change: 'Helpline updates',
    wording: 'Wording updates',
};

// Workflow file → agent label, for the runs list (maintenance workflows are left out)
const WORKFLOW_LABELS = {
    'daily-freshness-check.yml': 'Deadline Freshness',
    'weekly-enrichment.yml': 'Weekly Enrichment',
    'scholarship-scout.yml': 'Scholarship Scout',
    'publish-scout-approved.yml': 'Scout Publisher',
    'database-backup.yml': 'Database Backup',
};

const ACTIVE = "(s.status = 'Active' OR s.status IS NULL)";
const ISO_DEADLINE = "s.deadline GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'";

function inboxSection(db) {
    const groups = db.prepare(`SELECT category, risk, COUNT(*) AS n FROM agent_proposals WHERE status = 'pending' GROUP BY category, risk`).all();
    const count = (category, risk) => groups.filter(g => (!category || g.category === category) && (!risk || g.risk === risk)).reduce((n, g) => n + g.n, 0);
    const newToday = db.prepare(`SELECT COUNT(*) AS n FROM agent_proposals WHERE status = 'pending' AND first_proposed_at >= datetime('now', '-1 day')`).get().n;
    const approvedUnpublished = db.prepare(`SELECT COUNT(*) AS n FROM agent_proposals WHERE kind = 'new_scholarship' AND status = 'approved'`).get().n;
    // The decisions most worth making today: deadline changes and new scholarships, nearest deadline and most traffic first
    const urgent = db.prepare(`
        SELECT p.id, p.category, p.risk, p.scholarship_title AS title, p.field, p.old_value, p.new_value, s.slug, s.deadline,
               COALESCE(g.clicks, 0) AS clicks
        FROM agent_proposals p
        LEFT JOIN scholarships s ON s.id = p.scholarship_id
        LEFT JOIN gsc_traffic_cache g ON g.slug = s.slug
        WHERE p.status = 'pending' AND p.category IN ('date_change', 'new_scholarship') AND (p.field IS NULL OR p.field = 'deadline')
        ORDER BY CASE WHEN s.deadline >= date('now') THEN julianday(s.deadline) - julianday('now') ELSE 999 END, clicks DESC
        LIMIT 5`).all();
    return {
        total: count(),
        newToday,
        risky: count(undefined, 'high'),
        approvedUnpublished,
        groups: Object.fromEntries(Object.keys(CATEGORY_LABELS).map(c => [c, count(c)])),
        urgent,
    };
}

function decisionsSection(db) {
    const rows = db.prepare(`SELECT status, COUNT(*) AS n FROM agent_proposals
        WHERE decided_at >= datetime('now', '-1 day') AND decided_by NOT LIKE 'agent:%' AND decided_by NOT LIKE 'system:%'
        GROUP BY status`).all();
    const by = Object.fromEntries(rows.map(r => [r.status, r.n]));
    return { approved: (by.approved || 0) + (by.published || 0), rejected: by.rejected || 0 };
}

function deadlinesSection(db) {
    const closingSoon = db.prepare(`
        SELECT s.title, s.slug, s.deadline, COALESCE(g.clicks, 0) AS clicks
        FROM scholarships s LEFT JOIN gsc_traffic_cache g ON g.slug = s.slug
        WHERE ${ACTIVE} AND ${ISO_DEADLINE} AND s.deadline BETWEEN date('now') AND date('now', '+7 day')
        ORDER BY clicks DESC, s.deadline`).all();
    // Shown to students as open although the date has passed: the freshness check or a manual fix should look at these
    const pastButOpen = db.prepare(`
        SELECT s.title, s.slug, s.deadline, COALESCE(g.clicks, 0) AS clicks
        FROM scholarships s LEFT JOIN gsc_traffic_cache g ON g.slug = s.slug
        WHERE ${ACTIVE} AND COALESCE(s.always_open, 0) <> 1 AND ${ISO_DEADLINE} AND s.deadline < date('now')
        ORDER BY clicks DESC, s.deadline DESC`).all();
    return { closingSoon, pastButOpen };
}

async function runsSection(db) {
    const agentSummaries = db.prepare(`SELECT agent, kind, summary, created_at FROM agent_events
        WHERE created_at >= datetime('now', '-1 day') AND kind IN ('run_finished', 'run_warning') ORDER BY id`).all();
    let runs = null;
    if (process.env.GITHUB_TOKEN) {
        try {
            const since = new Date(Date.now() - 86400000).toISOString().slice(0, 19);
            const res = await fetch(`https://api.github.com/repos/${REPO}/actions/runs?per_page=100&created=%3E%3D${since}`, {
                headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' },
            });
            if (!res.ok) throw new Error(`GitHub said ${res.status}`);
            const data = await res.json();
            runs = data.workflow_runs
                .filter(r => ['schedule', 'workflow_dispatch'].includes(r.event))
                .map(r => ({ workflow: String(r.path).split('/').pop(), status: r.status, conclusion: r.conclusion, url: r.html_url, title: r.display_title }))
                .filter(r => WORKFLOW_LABELS[r.workflow])
                .map(r => ({ ...r, label: WORKFLOW_LABELS[r.workflow] }));
        } catch (error) {
            console.warn(`⚠️  Could not list GitHub runs: ${error.message}`);
        }
    }
    return { runs, agentSummaries };
}

function headline(b) {
    const parts = [];
    if (b.inbox.total) {
        const key = [
            b.inbox.groups.date_change && `${b.inbox.groups.date_change} deadline change(s)`,
            b.inbox.groups.new_scholarship && `${b.inbox.groups.new_scholarship} new scholarship(s)`,
        ].filter(Boolean).join(' and ');
        parts.push(`${b.inbox.total} item(s) wait for you${key ? `, including ${key}` : ''}.`);
    } else {
        parts.push('Nothing is waiting for you.');
    }
    const failed = (b.runs.runs || []).filter(r => r.status === 'completed' && r.conclusion !== 'success');
    if (b.runs.runs) parts.push(failed.length ? `${failed.length} agent run(s) failed.` : `${b.runs.runs.length} agent run(s), all fine.`);
    if (b.deadlines.pastButOpen.length) parts.push(`${b.deadlines.pastButOpen.length} scholarship(s) still show as open after their deadline.`);
    return parts.join(' ');
}

// ---------------- Email ----------------
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const row = (label, value, color = '#0f172a') =>
    `<tr><td style="padding:6px 0;color:#334155">${label}</td><td style="padding:6px 0;text-align:right;font-weight:700;color:${color}">${value}</td></tr>`;
const link = (slug, title) => slug ? `<a href="${SITE}/scholarships/${esc(slug)}" style="color:#1d4ed8;text-decoration:none">${esc(title)}</a>` : esc(title);

function renderHtml(b, target) {
    const section = (title, body) => `<h3 style="margin:24px 0 8px;font-size:15px;color:#0f172a">${title}</h3>${body}`;
    const table = rows => `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows.join('')}</table>`;
    const list = items => items.length ? `<ul style="margin:0;padding-left:18px;font-size:14px;color:#334155">${items.join('')}</ul>` : '<p style="font-size:14px;color:#64748b">None.</p>';

    const inboxRows = Object.entries(CATEGORY_LABELS).filter(([c]) => b.inbox.groups[c]).map(([c, label]) => row(label, b.inbox.groups[c]));
    if (b.inbox.risky) inboxRows.push(row('Risky (check first)', b.inbox.risky, '#be123c'));
    if (b.inbox.approvedUnpublished) inboxRows.push(row('Approved, not yet published', b.inbox.approvedUnpublished, '#047857'));

    const urgent = b.inbox.urgent.map(u => `<li style="margin:4px 0">${link(u.slug, u.title)}: ${u.category === 'new_scholarship'
        ? 'new scholarship'
        : `deadline ${esc(u.old_value || '(empty)')} → <b>${esc(u.new_value)}</b>`}${u.risk === 'high' ? ' <span style="color:#be123c">(risky)</span>' : ''}</li>`);

    const runs = b.runs.runs === null
        ? '<p style="font-size:14px;color:#64748b">Run list unavailable.</p>'
        : list(b.runs.runs.map(r => `<li style="margin:4px 0"><a href="${r.url}" style="color:#1d4ed8;text-decoration:none">${esc(r.label)}</a>: ${r.status === 'completed'
            ? (r.conclusion === 'success' ? '<span style="color:#047857">done</span>' : `<b style="color:#be123c">${esc(r.conclusion)}</b>`)
            : esc(String(r.status).replace('_', ' '))}</li>`));
    const agentNotes = list(b.runs.agentSummaries.map(e => `<li style="margin:4px 0">${esc(e.summary)}</li>`));

    const closing = list(b.deadlines.closingSoon.slice(0, 8).map(s => `<li style="margin:4px 0">${link(s.slug, s.title)}: ${esc(s.deadline)}${s.clicks ? ` · ${s.clicks} clicks` : ''}</li>`));
    const stale = list(b.deadlines.pastButOpen.slice(0, 8).map(s => `<li style="margin:4px 0">${link(s.slug, s.title)}: closed ${esc(s.deadline)}${s.clicks ? ` · ${s.clicks} clicks` : ''}</li>`));

    return `<!DOCTYPE html><html><body style="margin:0;background:#f4f6fb;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
<div style="background:#ffffff;border:1px solid #e2e6ef;border-radius:14px;padding:24px">
<p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#64748b">${target === 'staging' ? 'STAGING · ' : ''}Morning briefing · ${esc(b.date)}</p>
<p style="margin:8px 0 0;font-size:17px;line-height:1.5;color:#0f172a">${esc(b.headline)}</p>
<p style="margin:16px 0 0"><a href="${SITE}/admin/agents" style="display:inline-block;background:#2563eb;color:#ffffff;padding:10px 16px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">Open the Agent Center</a></p>
${section(`Needs you · ${b.inbox.total}${b.inbox.newToday ? ` (${b.inbox.newToday} new since yesterday)` : ''}`, inboxRows.length ? table(inboxRows) : '<p style="font-size:14px;color:#64748b">Nothing waiting.</p>')}
${b.inbox.urgent.length ? section('Decide first', list(urgent)) : ''}
${section('Your decisions (last 24 hours)', table([row('Approved', b.decisions.approved, '#047857'), row('Rejected', b.decisions.rejected)]))}
${section('Agent runs (last 24 hours)', runs)}
${b.runs.agentSummaries.length ? section('What the agents reported', agentNotes) : ''}
${section(`Closing in the next 7 days · ${b.deadlines.closingSoon.length}`, closing)}
${section(`Past deadline but still shown as open · ${b.deadlines.pastButOpen.length}`, stale + (b.deadlines.pastButOpen.length ? '<p style="font-size:13px;color:#64748b">Say "run the freshness check" in the Agent Center to re-check recent ones.</p>' : ''))}
</div></div></body></html>`;
}

async function run() {
    const db = new Database(DB_PATH);
    inbox.ensureAgentTables(db);
    if (inbox.skipIfDisabled(db, AGENT)) {
        db.close();
        if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'send=false\n');
        return;
    }

    const briefing = {
        date: new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' }),
        inbox: inboxSection(db),
        decisions: decisionsSection(db),
        runs: await runsSection(db),
        deadlines: deadlinesSection(db),
    };
    briefing.headline = headline(briefing);
    const target = process.env.DB_TARGET || 'production';

    // The event carries a compact copy for the Agent Center (lists trimmed)
    const compact = {
        ...briefing,
        deadlines: {
            closingSoonCount: briefing.deadlines.closingSoon.length,
            closingSoon: briefing.deadlines.closingSoon.slice(0, 8),
            pastButOpenCount: briefing.deadlines.pastButOpen.length,
            pastButOpen: briefing.deadlines.pastButOpen.slice(0, 8),
        },
    };
    fs.writeFileSync(path.join(DATA_DIR, 'morning-briefing.html'), renderHtml(briefing, target));
    fs.writeFileSync(path.join(DATA_DIR, 'morning-briefing.json'), JSON.stringify(compact, null, 2));
    console.log(`☀️  ${briefing.headline}`);

    if (!dryRun) inbox.logEvent(db, { agent: AGENT, kind: 'briefing', summary: briefing.headline, details: compact });
    db.close();
    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `send=true\nsubject=${target === 'staging' ? '[STAGING] ' : ''}Morning briefing · ${briefing.date}\n`);
    }
}

run().catch(error => {
    console.error(`❌ Briefing failed: ${error.message}`);
    process.exit(1);
});
