/**
 * Turns what the owner types into a command. Deterministic patterns for now; an AI model can be
 * added later as a fallback for anything these do not match.
 */
export type Intent =
    | { type: 'waiting' }
    | { type: 'show'; category?: string; risk?: string; title: string }
    | { type: 'bulk'; action: 'approve' | 'reject'; category: string; risk?: string; label: string }
    | { type: 'run'; agent: string; state?: string }
    | { type: 'publish' }
    | { type: 'briefing' }
    | { type: 'traffic' }
    | { type: 'indexing' }
    | { type: 'today' }
    | { type: 'agents' }
    | { type: 'help' }
    | { type: 'unknown'; text: string };

const titleCase = (s: string) => s.trim().replace(/\s+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const GROUPS: { pattern: RegExp; category: string; label: string }[] = [
    { pattern: /wording|reword|description/, category: 'wording', label: 'wording updates' },
    { pattern: /deadline|date/, category: 'date_change', label: 'deadline changes' },
    { pattern: /amount|money|₹/, category: 'amount_change', label: 'amount changes' },
    { pattern: /link|url|website/, category: 'link_change', label: 'link changes' },
    { pattern: /missing|details|gaps?\b|documents?/, category: 'missing_info', label: 'missing details' },
    { pattern: /helpline|contact|phone/, category: 'contact_change', label: 'helpline updates' },
    { pattern: /new scholarship|scout|candidate|find/, category: 'new_scholarship', label: 'new scholarships' },
];

export function parseIntent(input: string): Intent {
    const text = input.toLowerCase().trim();
    if (!text) return { type: 'help' };

    // "run the scout for bihar", "run the freshness check", "run enrichment"
    const run = text.match(/^(?:please\s+)?(?:run|start|trigger)\s+(?:the\s+)?(scout publisher|publisher|scholarship scout|scout|freshness|deadline|enrichment|maintenance|fact check|morning briefing|briefing|quality fixer|quality|traffic watchdog|watchdog|traffic|indexing agent|indexing)\b(?:.*?\bfor\s+([a-z .&-]+))?/);
    if (run) {
        const name = run[1];
        const agent = /traffic|watchdog/.test(name) ? 'traffic-watchdog'
            : name.includes('indexing') ? 'indexing'
            : name.includes('quality') ? 'quality-fixer'
            : name.includes('briefing') ? 'morning-briefing'
            : name.includes('publisher') ? 'scout-publisher'
            : name.includes('scout') ? 'scholarship-scout'
            : name.includes('fact') ? 'fact-check'
            : /enrich|maintenance/.test(name) ? 'weekly-enrichment'
            : 'deadline-freshness';
        return { type: 'run', agent, state: run[2] ? titleCase(run[2]) : undefined };
    }
    if (/^publish\b/.test(text)) return { type: 'publish' };
    if (/briefing|brief me|good morning|morning update/.test(text)) return { type: 'briefing' };
    if (/traffic|visits|clicks|how is the site|how's the site|site health/.test(text)) return { type: 'traffic' };
    if (/index(ed|ing)?\b|google (see|found)|search engines?/.test(text)) return { type: 'indexing' };

    // "approve all wording updates", "reject all risky amount changes"
    const bulk = text.match(/^(approve|reject)\s+(?:all\s+)?(?:the\s+)?(.*)$/);
    if (bulk) {
        const group = GROUPS.find(g => g.pattern.test(bulk[2]));
        if (group) {
            const risky = /risky|big|large|swing/.test(bulk[2]);
            return { type: 'bulk', action: bulk[1] as 'approve' | 'reject', category: group.category, risk: risky ? 'high' : undefined, label: `${risky ? 'risky ' : ''}${group.label}` };
        }
    }

    if (/risk/.test(text)) return { type: 'show', risk: 'high', title: 'Risky changes' };
    if (/(what'?s|what is|anything)\s+(waiting|pending)|waiting on me|my inbox|to review|pending/.test(text)) return { type: 'waiting' };
    if (/today|what did|what have|activity|happened/.test(text)) return { type: 'today' };
    if (/agents|who does what|team/.test(text)) return { type: 'agents' };

    const show = GROUPS.find(g => g.pattern.test(text));
    if (show && /show|list|see|review|open/.test(text)) return { type: 'show', category: show.category, title: titleCase(show.label) };

    if (/help|what can you do|commands/.test(text)) return { type: 'help' };
    return { type: 'unknown', text: input };
}

export const SUGGESTIONS = [
    'Morning briefing',
    "What's waiting on me?",
    'How is traffic?',
    'Show risky changes',
    'Show deadline changes',
    'Show new scholarships',
    'Approve all wording updates',
    'Run the scout for Bihar',
    'Run the freshness check',
    'What did agents do today?',
];
