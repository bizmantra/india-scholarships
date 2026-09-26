/**
 * The agent inbox as seen by the command center: reading pending proposals and deciding on them.
 *
 * decide() is the ONE approval action: chat cards, the list view and bulk commands all call it.
 * It writes Turso directly (small field updates, safe alongside agent runs thanks to the field-level
 * merge in push-to-turso.js), logs every change to scholarship_changelog so it can be undone, records
 * activity in agent_events, and refreshes the affected pages.
 *
 * The value rules (formats, allowed fields) are shared with the agents: scripts/lib/agent-inbox.js.
 */
import { getClient } from '@/lib/db';
import * as rules from '@/scripts/lib/agent-inbox';
import { refreshScholarshipPages } from './revalidate';
import { rows } from './server';

export interface Proposal {
    id: number;
    agent: string;
    kind: 'field_change' | 'new_scholarship';
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
}

export interface DecideResult {
    done: number[];
    skipped: { id: number; title: string; reason: string }[];
    refreshed: string[];
}

const LIST_SQL = `
    SELECT p.*, s.slug, s.state, s.deadline AS live_deadline, COALESCE(g.clicks, 0) AS clicks,
           CASE WHEN s.deadline GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
                THEN CAST(julianday(s.deadline) - julianday(date('now')) AS INTEGER) END AS days_to_deadline
    FROM agent_proposals p
    LEFT JOIN scholarships s ON s.id = p.scholarship_id
    LEFT JOIN gsc_traffic_cache g ON g.slug = s.slug`;

// Most urgent first: deadlines coming up soonest (within 60 days), then pages with the most search traffic
const URGENCY_ORDER = `
    ORDER BY CASE p.risk WHEN 'high' THEN 0 ELSE 1 END,
             CASE WHEN days_to_deadline BETWEEN -14 AND 60 THEN days_to_deadline ELSE 999 END,
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
    const approvedUnpublished = Number((await client.execute(
        "SELECT COUNT(*) AS n FROM agent_proposals WHERE kind = 'new_scholarship' AND status = 'approved'")).rows[0].n);
    return {
        total,
        groups: {
            date_change: count('date_change'),
            new_scholarship: count('new_scholarship'),
            amount_change: count('amount_change'),
            link_change: count('link_change'),
            contact_change: count('contact_change'),
            wording: count('wording'),
        },
        risky: count(undefined, 'high'),
        riskyAmounts: count('amount_change', 'high'),
        approvedUnpublished,
    };
}

export async function listProposals(opts: { category?: string; risk?: string; status?: string; ids?: number[]; limit?: number; offset?: number } = {}) {
    const where = ['p.status = ?'];
    const args: any[] = [opts.status || 'pending'];
    if (opts.category) { where.push('p.category = ?'); args.push(opts.category); }
    if (opts.risk) { where.push('p.risk = ?'); args.push(opts.risk); }
    if (opts.ids?.length) { where.push(`p.id IN (${opts.ids.map(() => '?').join(',')})`); args.push(...opts.ids); }
    const limit = Math.min(Math.max(opts.limit || 50, 1), 1000);
    const res = await getClient().execute({
        sql: `SELECT * FROM (${LIST_SQL} WHERE ${where.join(' AND ')}) p ${URGENCY_ORDER} LIMIT ? OFFSET ?`,
        args: [...args, limit, opts.offset || 0],
    });
    const countRes = await getClient().execute({ sql: `SELECT COUNT(*) AS n FROM agent_proposals p WHERE ${where.join(' AND ')}`, args });
    return { items: rows<Proposal>(res), total: Number(countRes.rows[0].n) };
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

    for (const p of items) {
        const id = Number(p.id);
        if (action === 'reject') {
            statements.push({
                sql: "UPDATE agent_proposals SET status = 'rejected', decided_by = ?, decided_at = datetime('now'), decision_note = ? WHERE id = ? AND status = 'pending'",
                args: [actor, opts.note || null, id],
            });
            if (perItemEvents) statements.push(event(p.agent, 'rejection', actor, p.kind === 'new_scholarship'
                ? `Rejected new scholarship "${p.scholarship_title}"`
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
                sql: `UPDATE scholarships SET ${field} = ?, verified_status = 'Verified', last_verified = datetime('now') WHERE id = ?`,
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
    result.refreshed = refreshScholarshipPages(touched);
    return result;
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
    const restored = rules.FIELD_TYPES[field as keyof typeof rules.FIELD_TYPES] === 'int' && previous !== '' ? Number(previous) : previous;
    await client.batch([
        { sql: `UPDATE scholarships SET ${field} = ? WHERE id = ?`, args: [restored, p.scholarship_id] },
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
