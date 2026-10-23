// Names, shapes and the "what to do next" ordering for the backlog. Pure data and functions: safe to import in the browser.

export const BACKLOG_STATUSES = ['Backlog', 'In Progress', 'Done', 'Parked'] as const;
export type BacklogStatus = (typeof BACKLOG_STATUSES)[number];

export const BACKLOG_IMPACTS = ['Critical', 'High', 'Medium', 'Low'] as const;
export type BacklogImpact = (typeof BACKLOG_IMPACTS)[number];

export interface BacklogItem {
    id: string; // IS-12, CNT-7, …
    category: string; // dev, content, … (one tab each)
    title: string;
    description: string;
    impact: BacklogImpact;
    status: BacklogStatus;
    type: string;
    due_date: string | null; // YYYY-MM-DD
    note: string | null; // "where we left off"
    waiting: boolean; // waiting on the owner (a decision or an action)
    updated_at: string; // UTC, "YYYY-MM-DD HH:MM:SS": last time anyone touched it here
}

// What the Backlog page can change on an item
export interface BacklogChange {
    status?: BacklogStatus;
    impact?: BacklogImpact;
    due_date?: string | null;
    note?: string | null;
    waiting?: boolean;
}

export const CATEGORY_LABELS: Record<string, string> = { dev: 'Dev', content: 'Content' };
export const categoryLabel = (id: string) => CATEGORY_LABELS[id] || id.replace(/[-_]/g, ' ').replace(/^\w/, c => c.toUpperCase());

const STALE_DAYS = { 'In Progress': 14, Backlog: 30 } as const;
const DUE_SOON_DAYS = 7;
const DAY = 86400000;

const parseUtc = (s: string) => new Date(s.replace(' ', 'T') + 'Z').getTime();
const parseDay = (s: string) => new Date(`${s}T00:00:00Z`).getTime();

export const daysSince = (updated: string, now = Date.now()) => Math.max(0, Math.floor((now - parseUtc(updated)) / DAY));

// Whole days from today until the due date (negative = overdue); null when there is no date
export function daysUntil(due: string | null, now = Date.now()): number | null {
    if (!due) return null;
    const today = parseDay(new Date(now).toISOString().slice(0, 10));
    return Math.round((parseDay(due) - today) / DAY);
}

export function staleDays(item: BacklogItem, now = Date.now()): number | null {
    if (item.status !== 'Backlog' && item.status !== 'In Progress') return null;
    const d = daysSince(item.updated_at, now);
    return d >= STALE_DAYS[item.status] ? d : null;
}

// Overdue or due within a week first, then Critical → Low, then In Progress before not started.
// Ties keep item-number order, so adding a note to an item never moves it.
function rankKey(item: BacklogItem, now: number): [number, number, number] {
    const left = daysUntil(item.due_date, now);
    const dueBucket = left === null ? 2 : left < 0 ? 0 : left <= DUE_SOON_DAYS ? 1 : 2;
    return [dueBucket, BACKLOG_IMPACTS.indexOf(item.impact), item.status === 'In Progress' ? 0 : 1];
}

export function sortByPriority(items: BacklogItem[], now = Date.now()): BacklogItem[] {
    return [...items].sort((a, b) => {
        const ka = rankKey(a, now);
        const kb = rankKey(b, now);
        for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
        return a.id.localeCompare(b.id, undefined, { numeric: true });
    });
}

export interface BacklogSections {
    doNext: BacklogItem[];
    inProgress: BacklogItem[];
    waiting: BacklogItem[];
    later: BacklogItem[];
    parked: BacklogItem[];
    doneCount: number;
}

export const DO_NEXT_COUNT = 5;

// Each item appears once: waiting-on-you first, then the top few to do, then the rest by state
export function buildSections(items: BacklogItem[], now = Date.now()): BacklogSections {
    const open = items.filter(i => i.status === 'Backlog' || i.status === 'In Progress');
    const waiting = sortByPriority(open.filter(i => i.waiting), now);
    const ready = sortByPriority(open.filter(i => !i.waiting), now);
    const doNext = ready.slice(0, DO_NEXT_COUNT);
    const rest = ready.slice(DO_NEXT_COUNT);
    return {
        doNext,
        inProgress: rest.filter(i => i.status === 'In Progress'),
        waiting,
        later: rest.filter(i => i.status === 'Backlog'),
        parked: sortByPriority(items.filter(i => i.status === 'Parked'), now),
        doneCount: items.filter(i => i.status === 'Done').length,
    };
}

// The description without the "[date cleanup] …" notes that the 2026-10-11 cleanup appended
export const plainDescription = (text: string) => text.split(/(?:^|\n\n)\[\d{4}-\d{2}-\d{2} cleanup\]/)[0].trim();
