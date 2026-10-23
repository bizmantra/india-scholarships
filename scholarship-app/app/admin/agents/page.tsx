'use client';

import React, { useEffect, useState } from 'react';
import { Activity, MessageSquare } from 'lucide-react';
import AskPanel from './AskPanel';
import ListView from './ListView';
import SidePanel from './SidePanel';
import { api, openingView, refreshActivity, refreshSummary, resumeRecentRuns } from './orchestrator';
import { post, store, type Status } from './store';

const ACTIVITY_KEY = 'cc-activity-open';

export default function AgentCenterPage() {
    // The activity panel is closed until asked for; the choice is remembered on this device
    const [activityOpen, setActivityOpen] = useState(false);

    useEffect(() => {
        try { setActivityOpen(localStorage.getItem(ACTIVITY_KEY) === '1'); } catch { /* storage blocked: stays closed */ }
    }, []);

    const toggleActivity = () => setActivityOpen(open => {
        try { localStorage.setItem(ACTIVITY_KEY, open ? '0' : '1'); } catch { /* not remembered; still switches */ }
        return !open;
    });

    // A link can open the Inbox for just one team: ?team=<id>
    useEffect(() => {
        const team = new URLSearchParams(window.location.search).get('team');
        if (team) store.set({ team });
    }, []);

    // First load: where we are, what's set up, what's waiting
    useEffect(() => {
        if (store.get().status) return; // the store survives page switches within /admin
        api<Status>('status')
            .then(s => {
                store.set({ status: s });
                if (!s.inboxReady) {
                    post({ type: 'text', tone: 'warn', text: 'The agent inbox is not set up on this database yet. The next Deadline Freshness run creates it (daily at 7 AM IST), or say "run the freshness check".' });
                    return;
                }
                openingView().then(() => resumeRecentRuns()).catch(() => undefined);
                refreshActivity();
            })
            .catch(e => post({ type: 'text', tone: 'bad', text: `Could not load the command center: ${e.message}` }));
    }, []);

    // Keep the activity feed and counts fresh while the page is open
    useEffect(() => {
        const timer = setInterval(() => {
            if (document.visibilityState !== 'visible' || !store.get().status?.inboxReady) return;
            refreshActivity();
            refreshSummary();
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    const headerButton = 'flex items-center gap-1.5 rounded-lg border border-cc-border px-3 py-1.5 text-xs font-bold hover:border-cc-border-strong hover:text-cc-text';

    return (
        <div className="flex flex-col gap-4 lg:h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-end gap-2">
                <button onClick={toggleActivity} aria-pressed={activityOpen} className={`${headerButton} ${activityOpen ? 'bg-cc-raised text-cc-text' : 'text-cc-muted'}`}>
                    <Activity className="h-3.5 w-3.5" />Activity
                </button>
                <button onClick={() => store.set({ askOpen: true })} className={`${headerButton} bg-blue-600 text-white hover:text-white`}>
                    <MessageSquare className="h-3.5 w-3.5" />Ask
                </button>
            </div>

            <div className={`grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] gap-4 ${activityOpen ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : ''}`}>
                <ListView />
                {activityOpen && (
                    <aside className="h-[420px] lg:h-auto lg:min-h-0">
                        <SidePanel />
                    </aside>
                )}
            </div>
            <AskPanel />
        </div>
    );
}
