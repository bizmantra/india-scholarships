/**
 * The Hermes bridge: lets Hermes Agent (a local assistant on the owner's Mac) put proposals into the agent inbox
 * and, when the owner approves in Hermes, decide them through the same decide() the Command Center uses.
 *
 * Hermes never gets database access. It gets two tokens for POST /api/hermes/bridge:
 *   HERMES_BRIDGE_PROPOSE_TOKEN  create proposals, list pending ones (given to the bots)
 *   HERMES_BRIDGE_DECIDE_TOKEN   approve / reject (used only by the owner's approval script)
 *
 * Limits, all enforced here (not by the caller):
 *   - off by default: agent_settings hermes-bridge/enabled must be true (the kill switch)
 *   - staging and local only, unless HERMES_BRIDGE_ALLOW_PRODUCTION=1 is set on purpose
 *   - proposals: only existing scholarships' fields that agents may change; the old value is read from the database
 *   - approvals: only hermes-* proposals; never risk 'high'; date and amount changes need an official source link
 *     and a quote; at most max_approvals_per_day per day; every approval is undoable from the Command Center
 */
import { getClient } from '@/lib/db';
import * as rules from '@/scripts/lib/agent-inbox';
import { decide, listProposals } from './inbox';
import { environment, inboxReady, rows } from './server';

export const BRIDGE_ACTOR = 'owner-via-hermes';
const AGENT_PREFIX = 'hermes-';
const DEFAULT_DAILY_CAP = 20;

export type BridgeRole = 'propose' | 'decide';

// Constant-time compare so a wrong token leaks nothing through timing
function same(a: string, b: string) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

export function roleForRequest(request: Request): BridgeRole | null {
    const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return null;
    const propose = process.env.HERMES_BRIDGE_PROPOSE_TOKEN;
    const decideToken = process.env.HERMES_BRIDGE_DECIDE_TOKEN;
    if (decideToken && same(token, decideToken)) return 'decide';
    if (propose && same(token, propose)) return 'propose';
    return null;
}

export function bridgeBlockedReason(): string | null {
    if (environment() === 'production' && process.env.HERMES_BRIDGE_ALLOW_PRODUCTION !== '1') {
        return 'The Hermes bridge is staging-only for now';
    }
    return null;
}

async function setting<T>(key: string, fallback: T): Promise<T> {
    const res = await getClient().execute({ sql: 'SELECT value_json FROM agent_settings WHERE agent = ? AND key = ?', args: ['hermes-bridge', key] });
    if (!res.rows.length) return fallback;
    try { return JSON.parse(String(res.rows[0].value_json)); } catch { return fallback; }
}

export async function bridgeEnabled() {
    return (await setting<boolean>('enabled', false)) === true;
}

const profileName = (v: unknown) => String(v || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);

export interface ProposeInput {
    profile: string;                 // which Hermes profile, e.g. "india-ops"
    scholarship_id: string;
    field: string;
    new_value: string;
    source: string;                  // official page the fact was seen on (full URL)
    quote?: string;                  // the sentence on that page that states the fact
    seen_on?: string;                // YYYY-MM-DD the page was read
    confidence?: 'high' | 'medium' | 'low';
}

export interface ProposeResult { status: string; id?: number; message?: string }

export async function propose(input: ProposeInput): Promise<ProposeResult> {
    const client = getClient();
    const profile = profileName(input.profile);
    if (!profile) return { status: 'invalid', message: 'profile is required' };
    const agent = AGENT_PREFIX + profile;
    const field = String(input.field || '');
    const source = String(input.source || '').trim();
    if (!/^https?:\/\/\S+$/.test(source)) return { status: 'invalid', message: 'source must be a full web address' };

    const res = await client.execute({ sql: 'SELECT * FROM scholarships WHERE id = ?', args: [String(input.scholarship_id)] });
    if (!res.rows.length) return { status: 'invalid', message: 'No scholarship with that id' };
    const live: any = { ...res.rows[0] };
    if (!(field in live)) return { status: 'invalid', message: `Unknown field "${field}"` };

    const before = rules.normalizeValue(field, live[field]);
    const after = rules.normalizeValue(field, input.new_value);
    if (rules.sameValue(field, before, after)) return { status: 'unchanged' };
    if (rules.isUnconfirmed(field, after)) return { status: 'unconfirmed' };
    const bad = rules.validateValue(field, after);
    if (bad) return { status: 'invalid', message: bad };

    const rejected = await client.execute({
        sql: "SELECT 1 FROM agent_proposals WHERE kind = 'field_change' AND scholarship_id = ? AND field = ? AND status = 'rejected' AND new_value = ?",
        args: [live.id, field, after],
    });
    if (rejected.rows.length) return { status: 'rejected_before' };

    const evidence = JSON.stringify({
        verdict: input.confidence === 'low' ? 'uncertain' : 'official',
        source,
        quote: input.quote || null,
        seen_on: input.seen_on || null,
        confidence: input.confidence || null,
        proposed_by: agent,
    });
    // Without a quote the owner cannot check the claim from the card, so it is marked for a careful look
    const classified = rules.classify(field, before, after);
    const risk = !input.quote || input.confidence === 'low' ? 'high' : classified.risk;

    const pending = rows<{ id: number; new_value: string }>(await client.execute({
        sql: "SELECT id, new_value FROM agent_proposals WHERE kind = 'field_change' AND scholarship_id = ? AND field = ? AND status = 'pending' ORDER BY id DESC",
        args: [live.id, field],
    }));
    const same = pending.find(p => p.new_value === after);
    if (same) {
        await client.execute({
            sql: "UPDATE agent_proposals SET times_proposed = times_proposed + 1, last_proposed_at = datetime('now'), old_value = ?, source_citation = ?, evidence_json = ?, risk = ? WHERE id = ?",
            args: [before, source, evidence, risk, same.id],
        });
        return { status: 'repeat', id: same.id };
    }
    const statements: { sql: string; args: any[] }[] = pending.map(p => ({
        sql: "UPDATE agent_proposals SET status = 'superseded', decided_by = ?, decided_at = datetime('now'), decision_note = 'Replaced by a newer proposal' WHERE id = ?",
        args: [`agent:${agent}`, p.id],
    }));
    statements.push(
        {
            sql: `INSERT INTO agent_proposals (agent, kind, scholarship_id, scholarship_title, field, old_value, new_value, category, risk, source_citation, evidence_json)
                  VALUES (?, 'field_change', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [agent, live.id, live.title, field, before, after, classified.category, risk, source, evidence],
        },
        {
            sql: 'INSERT INTO agent_events (agent, kind, actor, summary, details_json) VALUES (?, ?, ?, ?, ?)',
            args: [agent, 'proposal', agent, `Proposed ${field} for "${live.title}"`, JSON.stringify({ field, source })],
        },
    );
    await client.batch(statements, 'write');
    const created = await client.execute({
        sql: "SELECT id FROM agent_proposals WHERE kind = 'field_change' AND scholarship_id = ? AND field = ? AND status = 'pending' ORDER BY id DESC LIMIT 1",
        args: [live.id, field],
    });
    return { status: pending.length ? 'superseded' : 'created', id: Number(created.rows[0]?.id) };
}

// What the owner may approve from Hermes. Anything else says why and must be approved in the Command Center.
export function approvalBlock(p: { agent: string; kind: string; category: string; risk: string; source_citation: string | null; evidence_json: string | null }): string | null {
    if (!p.agent.startsWith(AGENT_PREFIX)) return 'Only proposals made by Hermes can be approved from Hermes';
    if (p.kind !== 'field_change') return 'Only scholarship field changes can be approved from Hermes for now';
    if (p.risk === 'high') return 'High-risk change: approve it in the Command Center';
    if (p.category === 'date_change' || p.category === 'amount_change') {
        let quote: string | null = null;
        try { quote = JSON.parse(p.evidence_json || '{}').quote || null; } catch { /* no evidence */ }
        if (!p.source_citation || !quote) return 'Date and amount changes need a source link and a quote from the page';
    }
    return null;
}

export interface BridgeDecideResult {
    done: number[];
    blocked: { id: number; reason: string }[];
    skipped: { id: number; title: string; reason: string }[];
}

export async function decideFromHermes(ids: number[], action: 'approve' | 'reject', note?: string): Promise<BridgeDecideResult> {
    const out: BridgeDecideResult = { done: [], blocked: [], skipped: [] };
    const { items } = await listProposals({ ids, limit: 200 });
    const allowed: number[] = [];
    for (const p of items as any[]) {
        const why = action === 'approve' ? approvalBlock(p) : (p.agent.startsWith(AGENT_PREFIX) ? null : 'Only proposals made by Hermes can be rejected from Hermes');
        if (why) out.blocked.push({ id: Number(p.id), reason: why }); else allowed.push(Number(p.id));
    }
    if (action === 'approve' && allowed.length) {
        const cap = await setting<number>('max_approvals_per_day', DEFAULT_DAILY_CAP);
        const used = Number((await getClient().execute({
            // Counted from the proposals themselves: a bulk approval writes one summary event for many items
            sql: "SELECT COUNT(*) AS n FROM agent_proposals WHERE status = 'approved' AND decided_by = ? AND date(decided_at) = date('now')",
            args: [BRIDGE_ACTOR],
        })).rows[0].n);
        if (used + allowed.length > cap) {
            allowed.forEach(id => out.blocked.push({ id, reason: `Daily limit of ${cap} approvals from Hermes reached (${used} used)` }));
            return out;
        }
    }
    if (!allowed.length) return out;
    // force is never passed: if the page changed after the bot looked, the item is skipped and goes back for review
    const result = await decide(allowed, action, BRIDGE_ACTOR, { note: note ? `via Hermes: ${note}` : 'via Hermes' });
    out.done = result.done;
    out.skipped = result.skipped;
    return out;
}

export async function pendingForHermes(limit = 50) {
    const { items } = await listProposals({ status: 'pending', limit: 200 } as any);
    return (items as any[]).filter(p => String(p.agent).startsWith(AGENT_PREFIX)).slice(0, limit).map(p => ({
        id: Number(p.id), agent: p.agent, title: p.scholarship_title, field: p.field, old: p.old_value, new: p.new_value,
        category: p.category, risk: p.risk, source: p.source_citation, evidence: safeJson(p.evidence_json),
        can_approve_from_hermes: approvalBlock(p) === null, why_not: approvalBlock(p),
    }));
}

const safeJson = (s: string | null) => { try { return s ? JSON.parse(s) : null; } catch { return null; } };

export { inboxReady };
