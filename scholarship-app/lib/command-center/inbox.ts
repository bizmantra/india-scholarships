/**
 * The agent inbox as seen by the command center: reading pending proposals and deciding on them.
 *
 * decide() is the ONE approval action: chat cards, the list view and bulk commands all call it.
 * It writes Turso directly (small field updates, safe alongside agent runs thanks to the field-level
 * merge in push-to-turso.js), logs every change to scholarship_changelog so it can be undone, records
 * activity in agent_events, and refreshes the affected pages.
 *
 * The value rules (formats, allowed fields) are shared with the agents: scripts/lib/agent-inbox.js.
 * Study Abroad pages (kind 'sa_field_change') use scripts/lib/sa-inbox.js instead: they write the sa_*
 * tables, and their old/new values are kept in the approval event rather than scholarship_changelog.
 */
import { getClient, scholarshipsHasColumn } from '@/lib/db';
import * as rules from '@/scripts/lib/agent-inbox';
import * as sa from '@/scripts/lib/sa-inbox';
import { refreshScholarshipPages, refreshStudyAbroadPages } from './revalidate';
import { rows } from './server';

export interface Proposal {
    id: number;
    agent: string;
    kind: 'field_change' | 'new_scholarship' | 'sa_field_change' | 'sa_new_page';
    scholarship_id: string;
    scholarship_title: string;
    field: string | null;
    old_value: string | null;
    new_value: string | null;
    payload_json: string | null;
    category: string;
    risk: 'low' | 'normal' | 'high';
    source_citation: string | null;
    evidence_json: string | null;
    status: string;
    times_proposed: number;
    first_proposed_at: string;
    last_proposed_at: string;
    decided_by: string | null;
    decided_at: string | null;
    // Joined for display and urgency
    slug?: string | null;
    state?: string | null;
    live_deadline?: string | null;
    clicks?: number | null;
    days_to_deadline?: number | null;
    // For a deadline proposal: days from today to the PROPOSED date (the live deadline may be blank)
    proposed_days?: number | null;
}

export interface DecideResult {
    done: number[];
    skipped: { id: number; title: string; reason: string }[];
    refreshed: string[];
}

const LIST_SQL = `
    SELECT p.*, s.slug, s.state, s.deadline AS live_deadline, COALESCE(g.clicks, 0) AS clicks,
           CASE WHEN s.deadline GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
                THEN CAST(julianday(s.deadline) - julianday(date('now')) AS INTEGER) END AS days_to_deadline,
           CASE WHEN p.field = 'deadline' AND p.new_value GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
                THEN CAST(julianday(p.new_value) - julianday(date('now')) AS INTEGER) END AS proposed_days
    FROM agent_proposals p
    LEFT JOIN scholarships s ON s.id = p.scholarship_id
    LEFT JOIN gsc_traffic_cache g ON g.slug = s.slug`;

// Most urgent first: deadlines coming up soonest (within 60 days, using the live deadline, or the proposed date when
// the live one is blank), then ones that passed in the last 14 days, then pages with the most search traffic.
// Weak-evidence ("risky") items come after the others at the same urgency, so they no longer bury the good ones.
const URGENCY_ORDER = `
    ORDER BY CASE
               WHEN COALESCE(days_to_deadline, proposed_days) BETWEEN 0 AND 60 THEN COALESCE(days_to_deadline, proposed_days)
               WHEN COALESCE(days_to_deadline, proposed_days) BETWEEN -14 AND -1 THEN 100 - COALESCE(days_to_deadline, proposed_days)
               ELSE 999 END,
             CASE p.risk WHEN 'high' THEN 1 ELSE 0 END,
             clicks DESC, p.id`;

export async function inboxSummary() {
    const client = getClient();
    const byGroup = rows<{ category: string; risk: string; n: number; scholarships: number }>(await client.execute(`
        SELECT category, risk, COUNT(*) AS n, COUNT(DISTINCT scholarship_id) AS scholarships
        FROM agent_proposals WHERE status = 'pending' GROUP BY category, risk`));
    const total = byGroup.reduce((n, g) => n + Number(g.n), 0);
    const count = (category?: string, risk?: string) => byGroup
        .filter(g => (!category || g.category === category) && (!risk || g.risk === risk))
        .reduce((n, g) => n + Number(g.n), 0);
    // Pending items per agent, per category and risky: lets any team show counts that match its list
    const byAgent: Record<string, number> = {};
    const byAgentCategory: Record<string, Record<string, number>> = {};
    const byAgentRisky: Record<string, number> = {};
    for (const r of rows<{ agent: string; category: string; risk: string; n: number }>(await client.execute(
        "SELECT agent, category, risk, COUNT(*) AS n FROM agent_proposals WHERE status = 'pending' GROUP BY agent, category, risk"))) {
        const n = Number(r.n);
        byAgent[r.agent] = (byAgent[r.agent] ?? 0) + n;
        byAgentCategory[r.agent] = byAgentCategory[r.agent] ?? {};
        byAgentCategory[r.agent][r.category] = (byAgentCategory[r.agent][r.category] ?? 0) + n;
        if (r.risk === 'high') byAgentRisky[r.agent] = (byAgentRisky[r.agent] ?? 0) + n;
    }
    const approvedUnpublished = Number((await client.execute(
        "SELECT COUNT(*) AS n FROM agent_proposals WHERE kind = 'new_scholarship' AND status = 'approved'")).rows[0].n);
    return {
        total,
        groups: {
            date_change: count('date_change'),
            new_scholarship: count('new_scholarship'),
            amount_change: count('amount_change'),
            link_change: count('link_change'),
            missing_info: count('missing_info'),
            contact_change: count('contact_change'),
            wording: count('wording'),
            study_abroad: count(sa.CATEGORY),
        },
        risky: count(undefined, 'high'),
        riskyAmounts: count('amount_change', 'high'),
        approvedUnpublished,
        byAgent,
        byAgentCategory,
        byAgentRisky,
    };
}

export async function listProposals(opts: { category?: string; risk?: string; status?: string; ids?: number[]; agents?: string[]; notAgents?: string[]; agentPrefix?: string; limit?: number; offset?: number } = {}) {
    const where = ['p.status = ?'];
    const args: any[] = [opts.status || 'pending'];
    if (opts.category) { where.push('p.category = ?'); args.push(opts.category); }
    if (opts.risk) { where.push('p.risk = ?'); args.push(opts.risk); }
    if (opts.ids?.length) { where.push(`p.id IN (${opts.ids.map(() => '?').join(',')})`); args.push(...opts.ids); }
    if (opts.agents) {
        // A team with no agents matches nothing (instead of everything)
        where.push(opts.agents.length ? `p.agent IN (${opts.agents.map(() => '?').join(',')})` : '0 = 1');
        args.push(...opts.agents);
    }
    if (opts.agentPrefix) {
        // Escaped so a prefix cannot act as a wildcard
        where.push("p.agent LIKE ? ESCAPE '\\'");
        args.push(opts.agentPrefix.replace(/[\\%_]/g, c => '\\' + c) + '%');
    }
    if (opts.notAgents?.length) {
        // Items from agents that belong to no team (the "Other" filter)
        where.push(`p.agent NOT IN (${opts.notAgents.map(() => '?').join(',')})`);
        args.push(...opts.notAgents);
    }
    const limit = Math.min(Math.max(opts.limit || 50, 1), 1000);
    const res = await getClient().execute({
        sql: `SELECT * FROM (${LIST_SQL} WHERE ${where.join(' AND ')}) p ${URGENCY_ORDER} LIMIT ? OFFSET ?`,
        args: [...args, limit, opts.offset || 0],
    });
    const countRes = await getClient().execute({ sql: `SELECT COUNT(*) AS n FROM agent_proposals p WHERE ${where.join(' AND ')}`, args });
    return { items: rows<Proposal>(res), total: Number(countRes.rows[0].n) };
}

// What the owner can read at a glance on a "Needs you" card
export interface Evidence { verdict?: string; reason?: string; score?: number; band?: string; source?: string; quote?: string; tier?: string }
export type NeedsItem = Proposal & { evidence: Evidence | null };

function evidenceOf(p: Proposal): Evidence | null {
    try {
        const e = JSON.parse(p.evidence_json || 'null');
        return e ? { verdict: e.verdict, reason: e.reason, score: e.score, band: e.band, source: e.source, quote: e.quote, tier: e.tier } : null;
    } catch { return null; }
}

/**
 * The few pending items worth a person's attention now, instead of the whole inbox:
 *   closing   deadline proposals whose proposed date is within the next 3 weeks (nearest first)
 *   weak      other deadline proposals with weak evidence, busiest pages first (check the source before approving)
 *   newFinds  scholarships the scout found
 * Everything else is counted, not listed.
 */
export async function needsYou() {
    const client = getClient();
    const run = async (where: string, order: string, limit: number) => {
        const res = await client.execute({ sql: `SELECT * FROM (${LIST_SQL} WHERE p.status = 'pending' AND ${where}) p ORDER BY ${order} LIMIT ${limit}`, args: [] });
        return rows<Proposal>(res).map(p => ({ ...p, evidence: evidenceOf(p) })) as NeedsItem[];
    };
    const closing = await run(
        "p.kind = 'field_change' AND p.field = 'deadline' AND p.new_value GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' AND CAST(julianday(p.new_value) - julianday(date('now')) AS INTEGER) BETWEEN 0 AND 21",
        'proposed_days ASC, clicks DESC', 30);
    const closingIds = closing.map(p => Number(p.id));
    const weak = await run(
        `p.kind = 'field_change' AND p.field = 'deadline' AND p.risk = 'high'${closingIds.length ? ` AND p.id NOT IN (${closingIds.join(',')})` : ''}`,
        'clicks DESC, p.id', 20);
    const newFinds = await run("p.kind = 'new_scholarship'", 'p.id DESC', 20);
    const shown = new Set([...closing, ...weak, ...newFinds].map(p => Number(p.id)));
    const total = Number((await client.execute("SELECT COUNT(*) AS n FROM agent_proposals WHERE status = 'pending'")).rows[0].n);
    return { closing, weak, newFinds, shown: shown.size, total, rest: total - shown.size };
}

// All pending ids in a group, for bulk commands ("approve all wording updates")
export async function pendingIds(category: string, risk?: string): Promise<number[]> {
    const res = await getClient().execute({
        sql: `SELECT id FROM agent_proposals WHERE status = 'pending' AND category = ? ${risk ? 'AND risk = ?' : ''} ORDER BY id`,
        args: risk ? [category, risk] : [category],
    });
    return res.rows.map((r: any) => Number(r.id));
}

const event = (agent: string, kind: string, actor: string, summary: string, details?: any) => ({
    sql: 'INSERT INTO agent_events (agent, kind, actor, summary, details_json) VALUES (?, ?, ?, ?, ?)',
    args: [agent, kind, actor, summary, details ? JSON.stringify(details) : null],
});

const shortValue = (v: any) => {
    const text = v === null || v === undefined || v === '' ? '(empty)' : String(v);
    return text.length > 60 ? `${text.slice(0, 57)}…` : text;
};

/**
 * Approve or reject proposals. Field changes are applied only if the live value is still the one the
 * agent saw (unless force is set), so an approval never silently overwrites a later manual edit.
 */
export async function decide(ids: number[], action: 'approve' | 'reject', actor: string, opts: { force?: boolean; note?: string } = {}): Promise<DecideResult> {
    const client = getClient();
    const { items } = await listProposals({ ids, limit: 1000 });
    const result: DecideResult = { done: [], skipped: [], refreshed: [] };
    const statements: { sql: string; args: any[] }[] = [];
    // Older databases may not have the deadline_status column yet
    const hasDeadlineStatus = await scholarshipsHasColumn('deadline_status');
    const touched: { slug: string; state?: string | null }[] = [];
    const perItemEvents = items.length <= 3;

    // Current values of every affected scholarship, read once (not one request per item)
    const liveById = new Map<string, any>();
    const scholarshipIds = [...new Set(items.filter(p => p.kind === 'field_change').map(p => p.scholarship_id))];
    for (let i = 0; i < scholarshipIds.length; i += 200) {
        const chunk = scholarshipIds.slice(i, i + 200);
        const res = await client.execute({ sql: `SELECT * FROM scholarships WHERE id IN (${chunk.map(() => '?').join(',')})`, args: chunk });
        res.rows.forEach((r: any) => liveById.set(String(r.id), r));
    }

    const missing = ids.filter(id => !items.some(p => Number(p.id) === id));
    missing.forEach(id => result.skipped.push({ id, title: `#${id}`, reason: 'Already decided or no longer pending' }));

    // Current rows of every affected Study Abroad page, read once per table
    const saLive = new Map<string, any>();
    const saTargets = items.filter(p => p.kind === sa.KIND || p.kind === sa.NEW_KIND).map(p => sa.parseTargetId(p.scholarship_id)).filter(Boolean) as { table: string; key: string }[];
    for (const table of [...new Set(saTargets.map(t => t.table))]) {
        const target = (sa.TARGETS as Record<string, { key: string }>)[table];
        if (!target) continue;
        const keys = [...new Set(saTargets.filter(t => t.table === table).map(t => t.key))];
        for (let i = 0; i < keys.length; i += 200) {
            const chunk = keys.slice(i, i + 200);
            const res = await client.execute({ sql: `SELECT * FROM ${table} WHERE ${target.key} IN (${chunk.map(() => '?').join(',')})`, args: chunk });
            res.rows.forEach((r: any) => saLive.set(sa.targetId(table, String(r[target.key])), r));
        }
    }
    const saTouched: { table: string; row: any }[] = [];

    for (const p of items) {
        const id = Number(p.id);
        if (action === 'approve' && p.kind === sa.NEW_KIND) {
            const target = sa.parseTargetId(p.scholarship_id);
            if (!target || !(sa.TARGETS as Record<string, { key: string }>)[target.table]) {
                result.skipped.push({ id, title: p.scholarship_title, reason: 'Invalid target page' });
                continue;
            }
            const liveRow = saLive.get(p.scholarship_id);
            if (liveRow) {
                result.skipped.push({ id, title: p.scholarship_title, reason: `Page already exists in ${target.table}` });
                continue;
            }
            let rowData: Record<string, unknown>;
            try {
                rowData = JSON.parse(p.new_value || '{}');
            } catch {
                result.skipped.push({ id, title: p.scholarship_title, reason: 'Proposal payload is not valid JSON' });
                continue;
            }

            // For sa_programs, check university_slug exists
            let universityExists = true;
            if (target.table === 'sa_programs' && rowData.university_slug) {
                const uRes = await client.execute({ sql: 'SELECT 1 FROM sa_universities WHERE slug = ?', args: [String(rowData.university_slug)] });
                universityExists = !!uRes.rows[0];
            }

            const validationError = sa.validateNewRow(target.table, rowData, {
                universityExists: () => universityExists,
            });
            if (validationError) {
                result.skipped.push({ id, title: p.scholarship_title, reason: validationError });
                continue;
            }

            // Status is forced to draft on insert, ignoring any status in payload
            const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
            const keyCol = (sa.TARGETS as Record<string, { key: string }>)[target.table].key;
            const toInsert: Record<string, unknown> = {
                ...rowData,
                [keyCol]: target.key,
                status: 'draft',
                created_at: nowIso,
                updated_at: nowIso,
            };

            const cols = Object.keys(toInsert);
            const args = cols.map(c => sa.storedSaValue(target.table, c, toInsert[c]));

            statements.push(
                {
                    sql: `INSERT INTO ${target.table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
                    args,
                },
                {
                    sql: "UPDATE agent_proposals SET status = 'approved', decided_by = ?, decided_at = datetime('now') WHERE id = ? AND status = 'pending'",
                    args: [actor, id],
                },
                event(p.agent, 'approval', actor, `Approved new page for "${p.scholarship_title}" (Study Abroad, draft)`, {
                    proposal_id: id, table: target.table, key: target.key, kind: sa.NEW_KIND, updated_at: nowIso,
                }),
            );
            saTouched.push({ table: target.table, row: toInsert });
            saLive.set(p.scholarship_id, toInsert);
            result.done.push(id);
            continue;
        }

        if (action === 'approve' && p.kind === sa.KIND) {
            const target = sa.parseTargetId(p.scholarship_id);
            const field = String(p.field);
            const liveRow = saLive.get(p.scholarship_id);
            if (!target || !liveRow) { result.skipped.push({ id, title: p.scholarship_title, reason: 'Page no longer exists' }); continue; }
            const formatError = sa.validateSaValue(target.table, field, p.new_value, { source: p.source_citation });
            if (formatError) { result.skipped.push({ id, title: p.scholarship_title, reason: `${sa.LABELS[field as keyof typeof sa.LABELS] || field}: ${formatError}` }); continue; }
            const liveValue = liveRow[field];
            if (!opts.force && !sa.sameSaValue(liveValue, p.old_value)) {
                result.skipped.push({ id, title: p.scholarship_title, reason: `${sa.LABELS[field as keyof typeof sa.LABELS] || field} was changed to "${shortValue(liveValue)}" after this was proposed. Review it again.` });
                continue;
            }

            // Publish gate: validate whole row when publishing
            if (field === 'status' && p.new_value === 'published') {
                let universityExists = true;
                if (target.table === 'sa_programs' && liveRow.university_slug) {
                    const uRes = await client.execute({ sql: 'SELECT 1 FROM sa_universities WHERE slug = ?', args: [liveRow.university_slug] });
                    universityExists = !!uRes.rows[0];
                }
                const publishError = sa.validatePublishRow(target.table, { ...liveRow, status: 'published' }, {
                    universityExists: () => universityExists,
                });
                if (publishError) {
                    result.skipped.push({ id, title: p.scholarship_title, reason: publishError });
                    continue;
                }
            }

            const keyCol = (sa.TARGETS as Record<string, { key: string }>)[target.table].key;
            const hasUpdatedAt = 'updated_at' in liveRow;
            statements.push(
                {
                    sql: `UPDATE ${target.table} SET ${field} = ?${hasUpdatedAt ? ", updated_at = datetime('now')" : ''} WHERE ${keyCol} = ?`,
                    args: [sa.storedSaValue(target.table, field, p.new_value), target.key],
                },
                {
                    sql: "UPDATE agent_proposals SET status = 'approved', decided_by = ?, decided_at = datetime('now') WHERE id = ? AND status = 'pending'",
                    args: [actor, id],
                },
                // Always one event per Study Abroad approval: undo reads the previous value from it
                event(p.agent, 'approval', actor, `Approved ${field} for "${p.scholarship_title}" (Study Abroad)`, {
                    proposal_id: id, table: target.table, key: target.key, field, old: liveValue ?? null, new: p.new_value, source_citation: p.source_citation,
                }),
            );
            saTouched.push({ table: target.table, row: liveRow });
            result.done.push(id);
            continue;
        }
        if (action === 'reject') {
            statements.push({
                sql: "UPDATE agent_proposals SET status = 'rejected', decided_by = ?, decided_at = datetime('now'), decision_note = ? WHERE id = ? AND status = 'pending'",
                args: [actor, opts.note || null, id],
            });
            if (perItemEvents) statements.push(event(p.agent, 'rejection', actor, p.kind === 'new_scholarship'
                ? `Rejected new scholarship "${p.scholarship_title}"`
                : p.kind === sa.NEW_KIND
                    ? `Rejected new page "${p.scholarship_title}" (Study Abroad)`
                    : `Rejected ${p.field} for "${p.scholarship_title}": ${shortValue(p.new_value)}`, { proposal_id: id }));
            result.done.push(id);
            continue;
        }

        if (p.kind === 'new_scholarship') {
            statements.push({
                sql: "UPDATE agent_proposals SET status = 'approved', decided_by = ?, decided_at = datetime('now') WHERE id = ? AND status = 'pending'",
                args: [actor, id],
            });
            if (perItemEvents) statements.push(event(p.agent, 'approval', actor,
                `Approved new scholarship "${p.scholarship_title}" (goes live when the Scout Publisher runs)`, { proposal_id: id }));
            result.done.push(id);
            continue;
        }

        // Field change: check the value and that the page still shows what the agent saw
        const field = String(p.field);
        const formatError = rules.validateValue(field, p.new_value);
        if (formatError) { result.skipped.push({ id, title: p.scholarship_title, reason: `${field}: ${formatError}` }); continue; }
        const liveRow = liveById.get(String(p.scholarship_id));
        if (!liveRow || !p.slug) { result.skipped.push({ id, title: p.scholarship_title, reason: 'Scholarship no longer exists' }); continue; }
        const liveValue = liveRow[field];
        if (!opts.force && !rules.sameValue(field, liveValue, p.old_value)) {
            result.skipped.push({ id, title: p.scholarship_title, reason: `${field} was changed to "${shortValue(liveValue)}" after the agent looked. Review it again.` });
            continue;
        }
        statements.push(
            {
                // An approved deadline has a source behind it, so it stops being an estimate ("expected") or unknown
                sql: `UPDATE scholarships SET ${field} = ?, verified_status = 'Verified', last_verified = datetime('now')${field === 'deadline' && hasDeadlineStatus ? ", deadline_status = 'confirmed'" : ''} WHERE id = ?`,
                args: [rules.storedValue(field, p.new_value), p.scholarship_id],
            },
            {
                sql: "INSERT INTO scholarship_changelog (scholarship_id, scholarship_title, action_type, details) VALUES (?, ?, 'reviewed_applied', ?)",
                args: [p.scholarship_id, p.scholarship_title, JSON.stringify({
                    changes: [{ field, old: liveValue ?? '', new: p.new_value }],
                    source_citation: p.source_citation,
                    approved_by: actor,
                    proposal_id: id,
                })],
            },
            {
                sql: "UPDATE agent_proposals SET status = 'approved', decided_by = ?, decided_at = datetime('now') WHERE id = ? AND status = 'pending'",
                args: [actor, id],
            },
        );
        if (perItemEvents) statements.push(event(p.agent, 'approval', actor,
            `Approved ${field} for "${p.scholarship_title}": ${shortValue(liveValue)} → ${shortValue(p.new_value)}`, { proposal_id: id }));
        touched.push({ slug: p.slug, state: p.state });
        result.done.push(id);
    }

    if (!perItemEvents && result.done.length > 0) {
        const categories = [...new Set(items.filter(p => result.done.includes(Number(p.id))).map(p => p.category))].join(', ');
        statements.push(event('command-center', action === 'approve' ? 'approval' : 'rejection', actor,
            `${action === 'approve' ? 'Approved' : 'Rejected'} ${result.done.length} item(s) (${categories})` +
            (result.skipped.length ? `; ${result.skipped.length} skipped` : ''), { proposal_ids: result.done }));
    }

    // Each batch is one transaction; chunks keep requests small
    for (let i = 0; i < statements.length; i += 120) {
        await client.batch(statements.slice(i, i + 120), 'write');
    }
    result.refreshed = [...refreshScholarshipPages(touched), ...refreshStudyAbroadPages(saTouched)];
    return result;
}

/** Undo an approved Study Abroad change, if the page still shows the approved value. */
async function undoStudyAbroad(p: Proposal, actor: string): Promise<{ ok: boolean; message: string }> {
    const client = getClient();
    const target = sa.parseTargetId(p.scholarship_id);
    const field = String(p.field);
    if (!target || !sa.fieldType(target.table, field)) return { ok: false, message: `Cannot undo changes to ${field}.` };
    const log = await client.execute({
        sql: `SELECT details_json FROM agent_events WHERE kind = 'approval' AND json_extract(details_json, '$.proposal_id') = ?
              ORDER BY id DESC LIMIT 1`,
        args: [Number(p.id)],
    });
    if (!log.rows[0]) return { ok: false, message: 'No record of this approval was found, so it cannot be undone automatically.' };
    const previous = JSON.parse(String(log.rows[0].details_json)).old ?? null;
    const keyCol = (sa.TARGETS as Record<string, { key: string }>)[target.table].key;
    const live = await client.execute({ sql: `SELECT * FROM ${target.table} WHERE ${keyCol} = ?`, args: [target.key] });
    const row: any = live.rows[0];
    if (!row) return { ok: false, message: 'The page no longer exists.' };
    if (!sa.sameSaValue(row[field], p.new_value)) return { ok: false, message: `${field} has changed again since the approval, so it was left as it is.` };
    await client.batch([
        { sql: `UPDATE ${target.table} SET ${field} = ?${'updated_at' in row ? ", updated_at = datetime('now')" : ''} WHERE ${keyCol} = ?`, args: [previous, target.key] },
        { sql: "UPDATE agent_proposals SET status = 'rejected', decided_by = ?, decided_at = datetime('now'), decision_note = 'Undone after approval' WHERE id = ?", args: [actor, Number(p.id)] },
        event(p.agent, 'undo', actor, `Undid ${field} for "${p.scholarship_title}" (Study Abroad)`, { proposal_id: Number(p.id), table: target.table, key: target.key, field }),
    ], 'write');
    refreshStudyAbroadPages([{ table: target.table, row }]);
    return { ok: true, message: `${sa.LABELS[field as keyof typeof sa.LABELS] || field} for "${p.scholarship_title}" is back to the previous version.` };
}

/** Undo an approved Study Abroad new page creation: deletes the row only if still draft and untouched. */
async function undoSaNewPage(p: Proposal, actor: string): Promise<{ ok: boolean; message: string }> {
    const client = getClient();
    const target = sa.parseTargetId(p.scholarship_id);
    if (!target) return { ok: false, message: 'Cannot undo: invalid target page.' };
    const meta = (sa.TARGETS as Record<string, { key: string }>)[target.table];
    if (!meta) return { ok: false, message: `Cannot undo: unknown table ${target.table}.` };

    const log = await client.execute({
        sql: `SELECT details_json FROM agent_events WHERE kind = 'approval' AND json_extract(details_json, '$.proposal_id') = ?
              ORDER BY id DESC LIMIT 1`,
        args: [Number(p.id)],
    });
    if (!log.rows[0]) return { ok: false, message: 'No record of this approval was found, so it cannot be undone automatically.' };

    let savedUpdatedAt: string | null = null;
    try {
        const details = JSON.parse(String(log.rows[0].details_json));
        savedUpdatedAt = details.updated_at ?? null;
    } catch { /* ignore */ }

    const live = await client.execute({ sql: `SELECT * FROM ${target.table} WHERE ${meta.key} = ?`, args: [target.key] });
    const row = live.rows[0] as Record<string, unknown> | undefined;
    if (!row) return { ok: false, message: 'The page no longer exists.' };
    if (row.status !== 'draft') {
        return { ok: false, message: 'The page is no longer draft, so it cannot be undone.' };
    }
    if (savedUpdatedAt && row.updated_at && row.updated_at !== savedUpdatedAt) {
        return { ok: false, message: 'page has changed since' };
    }

    await client.batch([
        { sql: `DELETE FROM ${target.table} WHERE ${meta.key} = ?`, args: [target.key] },
        { sql: "UPDATE agent_proposals SET status = 'rejected', decided_by = ?, decided_at = datetime('now'), decision_note = 'Undone after approval' WHERE id = ?", args: [actor, Number(p.id)] },
        event(p.agent, 'undo', actor, `Undid new page "${p.scholarship_title}" (Study Abroad)`, { proposal_id: Number(p.id), table: target.table, key: target.key }),
    ], 'write');
    refreshStudyAbroadPages([{ table: target.table, row }]);
    return { ok: true, message: `New page "${p.scholarship_title}" has been deleted.` };
}

/**
 * Undo an approval. A field change is reverted only if the page still shows the approved value.
 * The proposal is then marked rejected, so the agent will not propose that value again.
 * An approved scout find that is not yet published goes back to pending.
 */
export async function undo(id: number, actor: string): Promise<{ ok: boolean; message: string }> {
    const client = getClient();
    const { items } = await listProposals({ ids: [id], status: 'approved' });
    const p = items[0];
    if (!p) return { ok: false, message: 'Only approved items can be undone.' };
    if (p.kind === sa.KIND) return undoStudyAbroad(p, actor);
    if (p.kind === sa.NEW_KIND) return undoSaNewPage(p, actor);

    if (p.kind === 'new_scholarship') {
        await client.batch([
            { sql: "UPDATE agent_proposals SET status = 'pending', decided_by = NULL, decided_at = NULL WHERE id = ? AND status = 'approved'", args: [id] },
            event(p.agent, 'undo', actor, `Undid approval of new scholarship "${p.scholarship_title}"`, { proposal_id: id }),
        ], 'write');
        return { ok: true, message: `"${p.scholarship_title}" is back in your inbox.` };
    }

    const field = String(p.field);
    if (!rules.FIELD_TYPES[field as keyof typeof rules.FIELD_TYPES]) return { ok: false, message: `Cannot undo changes to ${field}.` };
    const log = await client.execute({
        sql: `SELECT id, details FROM scholarship_changelog WHERE action_type = 'reviewed_applied'
              AND json_extract(details, '$.proposal_id') = ? ORDER BY id DESC LIMIT 1`,
        args: [id],
    });
    if (!log.rows[0]) return { ok: false, message: 'No record of this approval was found, so it cannot be undone automatically.' };
    const previous = JSON.parse(String(log.rows[0].details)).changes?.[0]?.old ?? '';
    const live = await client.execute({ sql: `SELECT ${field} AS value FROM scholarships WHERE id = ?`, args: [p.scholarship_id] });
    if (!rules.sameValue(field, live.rows[0]?.value, p.new_value)) {
        return { ok: false, message: `${field} has changed again since the approval, so it was left as it is.` };
    }
    const hasDeadlineStatus = await scholarshipsHasColumn('deadline_status');
    const restored = rules.FIELD_TYPES[field as keyof typeof rules.FIELD_TYPES] === 'int' && previous !== '' ? Number(previous) : previous;
    await client.batch([
        {
            // Back to a non-date value: go back to "expected" if an estimate is on file, otherwise "unknown"
            sql: `UPDATE scholarships SET ${field} = ?${field === 'deadline' && hasDeadlineStatus && !/^\d{4}-\d{2}-\d{2}$/.test(String(restored))
                ? ", deadline_status = CASE WHEN deadline_expected IS NOT NULL AND deadline_expected <> '' THEN 'expected' ELSE 'unknown' END"
                : ''} WHERE id = ?`,
            args: [restored, p.scholarship_id],
        },
        {
            sql: "INSERT INTO scholarship_changelog (scholarship_id, scholarship_title, action_type, details) VALUES (?, ?, 'undo', ?)",
            args: [p.scholarship_id, p.scholarship_title, JSON.stringify({ changes: [{ field, old: p.new_value, new: previous }], undone_by: actor, proposal_id: id })],
        },
        { sql: "UPDATE agent_proposals SET status = 'rejected', decided_by = ?, decided_at = datetime('now'), decision_note = 'Undone after approval' WHERE id = ?", args: [actor, id] },
        event(p.agent, 'undo', actor, `Undid ${field} for "${p.scholarship_title}": back to ${shortValue(previous)}`, { proposal_id: id }),
    ], 'write');
    refreshScholarshipPages([{ slug: String(p.slug), state: p.state }]);
    return { ok: true, message: `${field} for "${p.scholarship_title}" is back to ${shortValue(previous)}.` };
}
