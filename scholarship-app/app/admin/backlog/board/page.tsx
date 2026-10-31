'use client';

import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DndContext, DragOverlay, MouseSensor, TouchSensor, pointerWithin, rectIntersection, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import type { CollisionDetection, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Loader2 } from 'lucide-react';
import {
    BACKLOG_ASSIGNEES, BACKLOG_STATUSES, BOARD_STATUSES, boardColumns, categoryLabel, DONE_VISIBLE_DAYS, isOpen, moveChange, NO_FILTERS, staleDays, TEAMS, TEAM_IDS,
    type BacklogAssignee, type BacklogChange, type BacklogItem, type BacklogStatus, type BoardFilters,
} from '@/lib/command-center/backlog-types';
import { api } from '../../agents/orchestrator';
import { dueLabel, IMPACT_STYLE, Pill, useBacklog, ViewToggle } from '../shared';

const COLUMN_HINT: Partial<Record<BacklogStatus, string>> = {
    Ready: 'Queued for an agent',
    Review: 'Finished, waiting for you',
    Done: `Last ${DONE_VISIBLE_DAYS} days`,
    Parked: 'On hold on purpose',
};

const CARDS_PER_COLUMN = 30;

// Dropping on a column uses where the pointer is; the card's box is the fallback (keyboard, touch edge cases)
const collision: CollisionDetection = args => {
    const within = pointerWithin(args);
    return within.length ? within : rectIntersection(args);
};

const select = 'rounded-lg border border-cc-border bg-cc-bg px-2 py-1 text-xs text-cc-text';

function CardBody({ item }: { item: BacklogItem }) {
    const due = dueLabel(item.due_date);
    const stale = staleDays(item);
    return (
        <>
            <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-cc-faint">{item.id}</span>
                <Pill className={IMPACT_STYLE[item.impact]}>{item.impact}</Pill>
                {item.waiting && item.status !== 'Review' && <Pill className="bg-amber-500/10 border-amber-500/30 text-cc-warn">Waiting on you</Pill>}
                {due && item.status !== 'Done' && <Pill className={due.className}>{due.text}</Pill>}
                {stale !== null && <Pill className="bg-cc-raised border-cc-border text-cc-muted">Quiet {stale} d</Pill>}
            </div>
            <div className="mt-1 line-clamp-3 text-sm font-bold text-cc-text">{item.title}</div>
            {item.note && <div className="mt-1 line-clamp-2 text-xs text-cc-text-2">{item.note}</div>}
            {item.link && <div className="mt-1 truncate text-xs text-cc-link">{item.link}</div>}
        </>
    );
}

function BoardCard({ item, onChange }: { item: BacklogItem; onChange: (id: string, change: BacklogChange) => void }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });
    return (
        <div ref={setNodeRef} className={`rounded-xl border border-cc-border bg-cc-panel ${isDragging ? 'opacity-40' : ''}`}>
            {/* Only this part starts a drag, so the menus below stay usable by mouse, touch and keyboard */}
            <div {...listeners} {...attributes} className="cursor-grab p-3 pb-2 active:cursor-grabbing" aria-label={`Drag ${item.id}`}>
                <CardBody item={item} />
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-cc-border px-3 py-2">
                <label className="flex items-center gap-1 text-[11px] text-cc-muted">Move to
                    <select
                        aria-label={`Move ${item.id} to`}
                        value={item.status}
                        onChange={e => onChange(item.id, moveChange(e.target.value as BacklogStatus))}
                        className={select}
                    >
                        {BACKLOG_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </label>
                <label className="flex items-center gap-1 text-[11px] text-cc-muted">For
                    <select
                        aria-label={`Assign ${item.id}`}
                        value={item.assignee || ''}
                        onChange={e => onChange(item.id, { assignee: (e.target.value || null) as BacklogAssignee | null })}
                        className={select}
                    >
                        <option value="">Nobody</option>
                        {BACKLOG_ASSIGNEES.map(a => <option key={a}>{a}</option>)}
                    </select>
                </label>
            </div>
        </div>
    );
}

function Column({ status, items, onChange }: { status: BacklogStatus; items: BacklogItem[]; onChange: (id: string, change: BacklogChange) => void }) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const [all, setAll] = useState(false);
    const shown = all ? items : items.slice(0, CARDS_PER_COLUMN);
    return (
        <section className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-cc-raised/40 ${isOver ? 'border-blue-500' : 'border-cc-border'}`}>
            <header className="px-3 pb-1 pt-3">
                <h2 className="text-sm font-bold text-cc-text">{status} <span className="text-cc-faint">({items.length})</span></h2>
                {COLUMN_HINT[status] && <p className="text-[11px] text-cc-muted">{COLUMN_HINT[status]}</p>}
            </header>
            <div ref={setNodeRef} className="min-h-24 flex-1 space-y-2 p-2">
                {shown.map(i => <BoardCard key={i.id} item={i} onChange={onChange} />)}
                {items.length > shown.length && (
                    <button onClick={() => setAll(true)} className="w-full rounded-lg border border-cc-border bg-cc-panel py-1.5 text-xs font-bold text-cc-text-2">
                        Show {items.length - shown.length} more
                    </button>
                )}
                {items.length === 0 && <p className="px-1 py-3 text-center text-xs text-cc-faint">Nothing here</p>}
            </div>
        </section>
    );
}

// The backlog as columns. Drag a card to another column, or use its "Move to" menu (works on phones and with a keyboard)
function BacklogBoard() {
    const { items, setItems, loading, error, setError, load } = useBacklog();
    // A team page links here with ?team=<id>
    const startTeam = useSearchParams().get('team');
    const [filters, setFilters] = useState<BoardFilters>({ ...NO_FILTERS, team: startTeam || 'all' });
    const [showParked, setShowParked] = useState(false);
    const [dragging, setDragging] = useState<BacklogItem | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
        // A short press starts a drag, so scrolling the board with a finger still works
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    );

    // Shows the change at once, saves it, and puts the card back if saving fails
    const apply = useCallback(async (id: string, change: BacklogChange) => {
        const before = items.find(i => i.id === id);
        if (!before) return;
        if (change.status === 'Done' && before.status !== 'Done' && !window.confirm(`Mark ${id} as done?`)) return;
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        setItems(cur => cur.map(i => (i.id === id ? { ...i, ...change, updated_at: now } : i)));
        try {
            await api('backlog', { method: 'PATCH', body: JSON.stringify({ id, ...change }) });
            setError('');
        } catch (e) {
            setItems(cur => cur.map(i => (i.id === id ? before : i)));
            setError((e as Error).message);
        }
        await load();
    }, [items, setItems, setError, load]);

    const onDragStart = (e: DragStartEvent) => setDragging(items.find(i => i.id === e.active.id) ?? null);
    const onDragEnd = (e: DragEndEvent) => {
        setDragging(null);
        const to = e.over?.id as BacklogStatus | undefined;
        const item = items.find(i => i.id === e.active.id);
        if (!item || !to || to === item.status || !BACKLOG_STATUSES.includes(to)) return;
        void apply(item.id, moveChange(to));
    };

    const columns = useMemo(() => boardColumns(items, filters), [items, filters]);
    const shownStatuses = showParked ? [...BOARD_STATUSES, 'Parked' as BacklogStatus] : BOARD_STATUSES;

    // Teams in their fixed order, then any older category (content, study-abroad, ...) that still has open items
    const teams = useMemo(() => {
        const older = [...new Set(items.filter(i => isOpen(i.status) && !TEAM_IDS.includes(i.category)).map(i => i.category))].sort();
        return [...TEAMS.map(t => t.id as string), ...older];
    }, [items]);
    const openIn = (team: string) => items.filter(i => (team === 'all' || i.category === team) && isOpen(i.status)).length;
    const set = (patch: Partial<BoardFilters>) => setFilters(f => ({ ...f, ...patch }));

    return (
        <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-black text-cc-text">Backlog board</h1>
                    <p className="text-sm text-cc-muted">Drag a card to another column, or use its Move to menu. Moving a card to Done asks first.</p>
                </div>
                <ViewToggle />
            </div>

            <div className="flex flex-wrap gap-1.5">
                {['all', ...teams].map(t => (
                    <button
                        key={t}
                        onClick={() => set({ team: t })}
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${filters.team === t ? 'border-blue-600 bg-blue-600 text-white' : 'border-cc-border bg-cc-panel text-cc-text-2 hover:border-cc-border-strong'}`}
                    >
                        {t === 'all' ? 'All' : categoryLabel(t)} <span className="opacity-70">{openIn(t)}</span>
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-cc-muted">
                <label className="flex items-center gap-1.5">Assigned to
                    <select value={filters.assignee} onChange={e => set({ assignee: e.target.value })} className={select}>
                        <option value="all">Anyone</option>
                        <option value="none">Nobody</option>
                        {BACKLOG_ASSIGNEES.map(a => <option key={a}>{a}</option>)}
                    </select>
                </label>
                <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={filters.waitingOnly} onChange={e => set({ waitingOnly: e.target.checked })} /> Waiting on me
                </label>
                <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={showParked} onChange={e => setShowParked(e.target.checked)} /> Show Parked ({columns.Parked.length})
                </label>
            </div>

            {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-cc-bad">{error}</p>}

            {loading ? (
                <div className="flex items-center gap-2 text-sm text-cc-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading the board…</div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={collision} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
                    {/* Only the board scrolls sideways, never the page */}
                    <div className="flex items-start gap-3 overflow-x-auto pb-3">
                        {shownStatuses.map(s => <Column key={s} status={s} items={columns[s]} onChange={apply} />)}
                    </div>
                    <DragOverlay>
                        {dragging && (
                            <div className="w-72 rounded-xl border border-blue-500 bg-cc-panel p-3 shadow-xl">
                                <CardBody item={dragging} />
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
}

export default function BacklogBoardPage() {
    return (
        <Suspense fallback={null}>
            <BacklogBoard />
        </Suspense>
    );
}
