// Names, shapes and the "what to do next" ordering for the backlog. Pure data and functions: safe to import in the browser.

// Ready = queued for an agent; Review = an agent says it is finished and the owner has not looked yet
export const BACKLOG_STATUSES = ['Backlog', 'Ready', 'In Progress', 'Review', 'Done', 'Parked'] as const;
export type BacklogStatus = (typeof BACKLOG_STATUSES)[number];

export const BACKLOG_IMPACTS = ['Critical', 'High', 'Medium', 'Low'] as const;
export type BacklogImpact = (typeof BACKLOG_IMPACTS)[number];

// Statuses that still need work or a look (everything except Done and Parked)
export const OPEN_STATUSES: readonly BacklogStatus[] = ['Backlog', 'Ready', 'In Progress', 'Review'];
export const isOpen = (status: BacklogStatus) => OPEN_STATUSES.includes(status);

export const BACKLOG_ASSIGNEES = ['Owner', 'Claude', 'Antigravity', 'Codex'] as const;
export type BacklogAssignee = (typeof BACKLOG_ASSIGNEES)[number];

// The teams. A backlog item's `category` is one of these ids (older rows may still say 'content' or 'study-abroad')
export const TEAMS = [
    { id: 'dev', label: 'Dev' },
    { id: 'content-research', label: 'Content research' },
    { id: 'content-creation', label: 'Content creation' },
    { id: 'data', label: 'Data' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'seo', label: 'SEO' },
    { id: 'growth', label: 'Growth / Distribution' },
] as const;
export const TEAM_IDS: readonly string[] = TEAMS.map(t => t.id);

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
    assignee: BacklogAssignee | null; // who is meant to do it
    link: string | null; // the pull request URL or the plan file path
    updated_at: string; // UTC, "YYYY-MM-DD HH:MM:SS": last time anyone touched it here
}

// What the Backlog page can change on an item
export interface BacklogChange {
    status?: BacklogStatus;
    impact?: BacklogImpact;
    due_date?: string | null;
    note?: string | null;
    waiting?: boolean;
    assignee?: BacklogAssignee | null;
    link?: string | null;
    category?: string; // move the item to another team
}

export const CATEGORY_LABELS: Record<string, string> = { ...Object.fromEntries(TEAMS.map(t => [t.id, t.label])), content: 'Content (unsorted)' };
export const categoryLabel = (id: string) => CATEGORY_LABELS[id] || id.replace(/[-_]/g, ' ').replace(/^\w/, c => c.toUpperCase());

// Review is the shortest: the owner is the one holding it up
const STALE_DAYS = { Review: 7, 'In Progress': 14, Ready: 14, Backlog: 30 } as const;
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
    if (!isOpen(item.status)) return null;
    const d = daysSince(item.updated_at, now);
    return d >= STALE_DAYS[item.status as keyof typeof STALE_DAYS] ? d : null;
}

// Work already started comes before work queued, which comes before work not yet queued
const STARTED_RANK: Partial<Record<BacklogStatus, number>> = { 'In Progress': 0, Review: 0, Ready: 1, Backlog: 2 };

// Overdue or due within a week first, then Critical → Low, then In Progress before not started.
// Ties keep item-number order, so adding a note to an item never moves it.
function rankKey(item: BacklogItem, now: number): [number, number, number] {
    const left = daysUntil(item.due_date, now);
    const dueBucket = left === null ? 2 : left < 0 ? 0 : left <= DUE_SOON_DAYS ? 1 : 2;
    return [dueBucket, BACKLOG_IMPACTS.indexOf(item.impact), STARTED_RANK[item.status] ?? 3];
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
    const open = items.filter(i => isOpen(i.status));
    // An item in Review is by definition waiting on the owner
    const needsOwner = (i: BacklogItem) => i.waiting || i.status === 'Review';
    const waiting = sortByPriority(open.filter(needsOwner), now);
    const ready = sortByPriority(open.filter(i => !needsOwner(i)), now);
    const doNext = ready.slice(0, DO_NEXT_COUNT);
    const rest = ready.slice(DO_NEXT_COUNT);
    return {
        doNext,
        inProgress: rest.filter(i => i.status === 'In Progress'),
        waiting,
        later: rest.filter(i => i.status === 'Backlog' || i.status === 'Ready'),
        parked: sortByPriority(items.filter(i => i.status === 'Parked'), now),
        doneCount: items.filter(i => i.status === 'Done').length,
    };
}

// The description without the "[date cleanup] …" notes that the 2026-10-11 cleanup appended
export const plainDescription = (text: string) => text.split(/(?:^|\n\n)\[\d{4}-\d{2}-\d{2} cleanup\]/)[0].trim();

// ---- Board (kanban) ----

// Parked is not a normal column: the board shows it only when asked
export const BOARD_STATUSES: readonly BacklogStatus[] = ['Backlog', 'Ready', 'In Progress', 'Review', 'Done'];
export const DONE_VISIBLE_DAYS = 14;

export interface BoardFilters {
    team: string; // 'all' or a category
    assignee: string; // 'all', 'none' (nobody) or an assignee
    waitingOnly: boolean; // only items waiting on the owner (the flag, or in Review)
}

export const NO_FILTERS: BoardFilters = { team: 'all', assignee: 'all', waitingOnly: false };

export function matchesFilters(item: BacklogItem, f: BoardFilters): boolean {
    if (f.team !== 'all' && item.category !== f.team) return false;
    if (f.assignee === 'none' ? item.assignee !== null : f.assignee !== 'all' && item.assignee !== f.assignee) return false;
    if (f.waitingOnly && !(item.waiting || item.status === 'Review')) return false;
    return true;
}

// The cards in each column. Open columns follow the Backlog order; Done shows what finished in the last two weeks, newest first.
export function boardColumns(items: BacklogItem[], f: BoardFilters, now = Date.now()): Record<BacklogStatus, BacklogItem[]> {
    const kept = items.filter(i => matchesFilters(i, f));
    const column = (status: BacklogStatus) => kept.filter(i => i.status === status);
    return {
        Backlog: sortByPriority(column('Backlog'), now),
        Ready: sortByPriority(column('Ready'), now),
        'In Progress': sortByPriority(column('In Progress'), now),
        Review: sortByPriority(column('Review'), now),
        Done: column('Done')
            .filter(i => daysSince(i.updated_at, now) <= DONE_VISIBLE_DAYS)
            .sort((a, b) => parseUtc(b.updated_at) - parseUtc(a.updated_at) || a.id.localeCompare(b.id, undefined, { numeric: true })),
        Parked: sortByPriority(column('Parked'), now),
    };
}

// What moving a card to a column changes: finished or parked work is no longer waiting on the owner
export function moveChange(to: BacklogStatus): BacklogChange {
    return to === 'Done' || to === 'Parked' ? { status: to, waiting: false } : { status: to };
}
