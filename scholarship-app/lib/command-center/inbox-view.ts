/**
 * Pure helpers for the Command Center inbox screens: team counts and the one-line wording of an item.
 * No imports on purpose, so the screens and the node:test tests can both load this file.
 */

export type Facets = { total: number; byCategory: Record<string, number>; risky: number };

// Pending counts for a set of agents (a team): total, per category and risky
export function facetsFor(
    byAgentCategory: Record<string, Record<string, number>>,
    byAgentRisky: Record<string, number>,
    agentIds: string[],
): Facets {
    const facets: Facets = { total: 0, byCategory: {}, risky: 0 };
    for (const id of agentIds) {
        for (const [category, n] of Object.entries(byAgentCategory[id] ?? {})) {
            facets.byCategory[category] = (facets.byCategory[category] ?? 0) + n;
            facets.total += n;
        }
        facets.risky += byAgentRisky[id] ?? 0;
    }
    return facets;
}

const VERDICT_WORDS: Record<string, string> = {
    verified: 'official source confirms it',
    agreed: 'two checks agree',
    secondary: 'only a listing site confirms it',
    uncertain: 'unsure',
};

// "Deadline Freshness: official source confirms it (nsp.gov.in)"
export function reasonLine(row: {
    agentLabel: string;
    kind: string;
    field: string | null;
    old_value: string | null;
    new_value: string | null;
    evidence_json: string | null;
    risk: string;
}): string {
    let evidence: { verdict?: string; source?: string } | null = null;
    try { evidence = row.evidence_json ? JSON.parse(row.evidence_json) : null; } catch { /* treated as no evidence */ }
    const verdict = evidence?.verdict;
    let text: string;
    if (verdict) {
        let host = '';
        try { host = new URL(evidence!.source || '').host.replace(/^www\./, ''); } catch { /* no source */ }
        text = `${VERDICT_WORDS[verdict] || 'unsure'}${host ? ` (${host})` : ''}`;
    } else {
        text = row.kind === 'new_scholarship' ? 'new scholarship found, no evidence recorded' : 'no evidence recorded';
    }
    return `${row.agentLabel}: ${text}${row.risk === 'high' ? ' · risky' : ''}`;
}

// "165 deadline changes, 24 Study Abroad changes, 10 more": the biggest groups, then the rest as a number
export function briefingLine(byCategory: Record<string, number>, labels: Record<string, string>, max = 2): string {
    const groups = Object.entries(byCategory).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
    const shown = groups.slice(0, max).map(([category, n]) => `${n.toLocaleString('en-IN')} ${labels[category] || category}`);
    const rest = groups.slice(max).reduce((n, [, c]) => n + c, 0);
    if (rest > 0) shown.push(`${rest.toLocaleString('en-IN')} more`);
    return shown.join(', ');
}
