/**
 * The backlog (Turso table backlog_tasks) plus a small side table with what the Backlog page adds:
 * a due date, a "where we left off" note, a waiting-on-you flag and the last time anyone touched an item.
 *
 * The side table lives only in Turso and is created on first use. It is deliberately NOT in the agent sync
 * (SYNCED_TABLES in scripts/push-to-turso.js), so syncing backlog_tasks never reads or clashes with it.
 */
import { getClient } from '@/lib/db';
import { rows } from './server';
import {
    BACKLOG_ASSIGNEES, BACKLOG_IMPACTS, BACKLOG_STATUSES, TEAM_IDS,
    type BacklogChange, type BacklogImpact, type BacklogItem, type BacklogStatus,
} from './backlog-types';

export * from './backlog-types';

// A problem with what was sent (the route answers these with HTTP 400)
export class BacklogInputError extends Error {}

// The backlog was reviewed item by item on this date, so every item that existed then counts as touched on it
const REVIEWED_ON = '2026-10-11 00:00:00';

// Columns added after the table first shipped; created on first use if the table predates them
const ADDED_COLUMNS = ['assignee TEXT', 'link TEXT'];

const DDL = `CREATE TABLE IF NOT EXISTS cc_backlog_meta (
    task_id TEXT PRIMARY KEY,
    due_date TEXT,
    note TEXT,
    waiting INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

type Raw = Record<string, string | number | null>;

let ready: Promise<void> | null = null;

function ensureTable(): Promise<void> {
    ready ??= (async () => {
        const client = getClient();
        const existed = Number((await client.execute("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name = 'cc_backlog_meta'")).rows[0].n) > 0;
        await client.execute(DDL);
        const have = new Set(rows<Raw>(await client.execute('PRAGMA table_info(cc_backlog_meta)')).map(r => String(r.name)));
        for (const column of ADDED_COLUMNS) {
            if (!have.has(column.split(' ')[0])) await client.execute(`ALTER TABLE cc_backlog_meta ADD COLUMN ${column}`);
        }
        // First creation: every existing item gets the review date as its last-touched time
        if (!existed) {
            await client.execute({
                sql: 'INSERT OR IGNORE INTO cc_backlog_meta (task_id, updated_at) SELECT id, ? FROM backlog_tasks',
                args: [REVIEWED_ON],
            });
        }
    })().catch(err => { ready = null; throw err; });
    return ready;
}

// Items added elsewhere (the old page, a script) get a meta row stamped "now" the first time they are seen
async function seedNewItems() {
    await getClient().execute(
        'INSERT OR IGNORE INTO cc_backlog_meta (task_id) SELECT id FROM backlog_tasks WHERE id NOT IN (SELECT task_id FROM cc_backlog_meta)'
    );
}

export async function listBacklog(): Promise<BacklogItem[]> {
    await ensureTable();
    await seedNewItems();
    const res = await getClient().execute(
        `SELECT t.id, t.category, t.title, t.description, t.impact, t.status, t.type,
                m.due_date, m.note, m.waiting, m.assignee, m.link, m.updated_at
         FROM backlog_tasks t JOIN cc_backlog_meta m ON m.task_id = t.id`
    );
    return rows<Raw>(res).map(r => ({
        id: String(r.id),
        category: String(r.category || 'dev'),
        title: String(r.title),
        description: String(r.description || ''),
        impact: BACKLOG_IMPACTS.find(i => i === r.impact) ?? 'Medium',
        status: BACKLOG_STATUSES.find(s => s === r.status) ?? 'Backlog',
        type: String(r.type || ''),
        due_date: r.due_date ? String(r.due_date) : null,
        note: r.note ? String(r.note) : null,
        waiting: Number(r.waiting) === 1,
        assignee: BACKLOG_ASSIGNEES.find(a => a === r.assignee) ?? null,
        link: r.link ? String(r.link) : null,
        updated_at: String(r.updated_at),
    }));
}

export async function updateBacklogItem(id: string, change: BacklogChange): Promise<void> {
    await ensureTable();
    if (change.status !== undefined && !BACKLOG_STATUSES.includes(change.status)) throw new BacklogInputError('Unknown status.');
    if (change.impact !== undefined && !BACKLOG_IMPACTS.includes(change.impact)) throw new BacklogInputError('Unknown impact.');
    if (change.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(change.due_date)) throw new BacklogInputError('Due date must look like 2026-11-30.');
    if (change.note && change.note.length > 500) throw new BacklogInputError('Keep the note under 500 characters.');
    if (change.assignee && !BACKLOG_ASSIGNEES.includes(change.assignee)) throw new BacklogInputError('Unknown assignee.');
    if (change.link) checkLink(change.link);
    if (change.category !== undefined && !TEAM_IDS.includes(change.category)) throw new BacklogInputError('Unknown team.');

    const client = getClient();
    const found = await client.execute({ sql: 'SELECT id FROM backlog_tasks WHERE id = ?', args: [id] });
    if (found.rows.length === 0) throw new BacklogInputError('Item not found.');

    const sets: string[] = [];
    const args: (string | null)[] = [];
    for (const key of ['status', 'impact', 'category'] as const) {
        if (change[key] !== undefined) { sets.push(`${key} = ?`); args.push(change[key]!); }
    }
    const batch = [];
    if (sets.length) batch.push({ sql: `UPDATE backlog_tasks SET ${sets.join(', ')} WHERE id = ?`, args: [...args, id] });

    const metaSets = ["updated_at = datetime('now')"];
    const metaArgs: (string | number | null)[] = [];
    if (change.due_date !== undefined) { metaSets.push('due_date = ?'); metaArgs.push(change.due_date || null); }
    if (change.note !== undefined) { metaSets.push('note = ?'); metaArgs.push(change.note?.trim() || null); }
    if (change.waiting !== undefined) { metaSets.push('waiting = ?'); metaArgs.push(change.waiting ? 1 : 0); }
    if (change.assignee !== undefined) { metaSets.push('assignee = ?'); metaArgs.push(change.assignee || null); }
    if (change.link !== undefined) { metaSets.push('link = ?'); metaArgs.push(change.link?.trim() || null); }
    batch.push({ sql: 'INSERT OR IGNORE INTO cc_backlog_meta (task_id) VALUES (?)', args: [id] });
    batch.push({ sql: `UPDATE cc_backlog_meta SET ${metaSets.join(', ')} WHERE task_id = ?`, args: [...metaArgs, id] });
    await client.batch(batch, 'write');
}

// A pull request address or a file path in the repo (plans/some-plan.md)
function checkLink(link: string) {
    const text = link.trim();
    if (text.length > 300) throw new BacklogInputError('Keep the link under 300 characters.');
    if (!/^https:\/\/\S+$/.test(text) && !/^[\w][\w./-]*$/.test(text)) throw new BacklogInputError('The link must be an https address or a file path.');
}

const PREFIXES: Record<string, string> = {
    dev: 'IS-', content: 'CNT-', 'study-abroad': 'SA-',
    'content-research': 'CR-', 'content-creation': 'CN-', data: 'DAT-', strategy: 'STR-', seo: 'SEO-', growth: 'GRO-',
};

export async function addBacklogItem(input: {
    category: string; title: string; description?: string; impact?: BacklogImpact; due_date?: string | null;
    status?: BacklogStatus; assignee?: BacklogChange['assignee']; link?: string | null;
}): Promise<string> {
    await ensureTable();
    const title = input.title?.trim();
    if (!title) throw new BacklogInputError('A title is needed.');
    if (!/^[a-z][a-z0-9-]*$/.test(input.category || '')) throw new BacklogInputError('Unknown tab.');
    const impact = input.impact ?? 'Medium';
    if (!BACKLOG_IMPACTS.includes(impact)) throw new BacklogInputError('Unknown impact.');
    if (input.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(input.due_date)) throw new BacklogInputError('Due date must look like 2026-11-30.');

    const status = input.status ?? 'Backlog';
    if (!BACKLOG_STATUSES.includes(status)) throw new BacklogInputError('Unknown status.');
    if (input.assignee && !BACKLOG_ASSIGNEES.includes(input.assignee)) throw new BacklogInputError('Unknown assignee.');
    if (input.link) checkLink(input.link);

    const prefix = PREFIXES[input.category] || `${input.category.toUpperCase()}-`;
    const client = getClient();
    const existing = await client.execute({ sql: 'SELECT id FROM backlog_tasks WHERE id LIKE ?', args: [`${prefix}%`] });
    const max = existing.rows.reduce((m: number, r: Record<string, unknown>) => Math.max(m, parseInt(String(r.id).slice(prefix.length)) || 0), 0);
    const id = `${prefix}${max + 1}`;
    await client.batch([
        {
            sql: 'INSERT INTO backlog_tasks (id, title, description, impact, status, type, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [id, title, input.description?.trim() || '', impact, status, '', input.category],
        },
        {
            sql: 'INSERT OR REPLACE INTO cc_backlog_meta (task_id, due_date, assignee, link) VALUES (?, ?, ?, ?)',
            args: [id, input.due_date || null, input.assignee || null, input.link?.trim() || null],
        },
    ], 'write');
    return id;
}
