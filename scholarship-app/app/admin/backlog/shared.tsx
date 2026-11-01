'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { daysUntil, type BacklogChange, type BacklogImpact, type BacklogItem } from '@/lib/command-center/backlog-types';
import { api } from '../agents/orchestrator';

export const IMPACT_STYLE: Record<BacklogImpact, string> = {
    Critical: 'bg-rose-500/10 border-rose-500/30 text-cc-bad',
    High: 'bg-amber-500/10 border-amber-500/30 text-cc-warn',
    Medium: 'bg-blue-500/10 border-blue-500/25 text-cc-link',
    Low: 'bg-cc-raised border-cc-border text-cc-muted',
};

export const Pill = ({ className, children }: { className: string; children: React.ReactNode }) => (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${className}`}>{children}</span>
);

export function dueLabel(due: string | null) {
    const left = daysUntil(due);
    if (left === null) return null;
    if (left < 0) return { text: `Overdue ${-left} d`, className: 'bg-rose-500/10 border-rose-500/30 text-cc-bad' };
    if (left === 0) return { text: 'Due today', className: 'bg-rose-500/10 border-rose-500/30 text-cc-bad' };
    return { text: `Due in ${left} d`, className: left <= 7 ? 'bg-amber-500/10 border-amber-500/30 text-cc-warn' : 'bg-cc-raised border-cc-border text-cc-muted' };
}

// Loads the backlog and saves changes to it; shared by the list and the board
export function useBacklog() {
    const [items, setItems] = useState<BacklogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            setItems((await api<{ items: BacklogItem[] }>('backlog')).items);
            setError('');
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);

    const change = useCallback(async (id: string, patch: BacklogChange) => {
        try {
            await api('backlog', { method: 'PATCH', body: JSON.stringify({ id, ...patch }) });
            setError('');
        } catch (e) {
            setError((e as Error).message);
        }
        await load();
    }, [load]);

    return { items, setItems, loading, error, setError, load, change };
}

// List | Board switch at the top of both pages
export function ViewToggle() {
    const onBoard = usePathname().startsWith('/admin/backlog/board');
    const style = (on: boolean) => `px-3 py-1.5 text-xs font-bold ${on ? 'bg-blue-600 text-white' : 'bg-cc-panel text-cc-text-2 hover:bg-cc-raised'}`;
    return (
        <div className="inline-flex shrink-0 overflow-hidden rounded-xl border border-cc-border">
            <Link href="/admin/backlog" className={style(!onBoard)}>List</Link>
            <Link href="/admin/backlog/board" className={style(onBoard)}>Board</Link>
        </div>
    );
}
