/**
 * Study Abroad rules for the Hermes bridge (spec D2), kept free of database and alias imports so they can be
 * unit-tested with `node --test lib/command-center/` (hermes-sa.test.ts).
 *
 * Two questions live here:
 *   saRisk()            how risky is a Study Abroad proposal Hermes wants to make?
 *   saApprovalBlock()   may the owner approve it from Hermes, or must it go to the Command Center?
 *
 * The rule of thumb: Hermes may *propose* anything an agent may propose, but it may only *approve* a plain
 * wording/source change. New pages, publishing, and anything marked high risk stay in the Command Center, where
 * the card shows the full diff.
 */

export type SaKind = 'sa_field_change' | 'sa_new_page';

export interface SaRiskInput {
    kind: SaKind;
    field?: string | null;
    /** The quote Hermes says it read on the official page, if any. */
    quote?: string | null;
    confidence?: 'high' | 'medium' | 'low' | null;
    /** What the server found when it re-read the page: 'found' | 'not_found' | 'unchecked'. */
    quoteCheck?: string | null;
}

/** 'high' means it must be approved in the Command Center; 'normal' may be approved from Hermes. */
export function saRisk(input: SaRiskInput): 'normal' | 'high' {
    if (input.kind === 'sa_new_page') return 'high';          // a whole new row: always a person's decision
    if (String(input.field || '') === 'status') return 'high'; // publishing is never a bridge decision
    if (!String(input.quote || '').trim()) return 'high';      // no quote means the owner cannot check the claim
    if (input.confidence === 'low') return 'high';
    if (input.quoteCheck === 'not_found') return 'high';       // the server could not find the quote on the page
    return 'normal';
}

export interface SaApprovableProposal {
    agent: string;
    kind: string;
    field?: string | null;
    risk: string;
    /** Prefix a Hermes proposal's agent name must carry. */
    agentPrefix: string;
}

/**
 * Why this proposal may not be approved from Hermes, or null when it may.
 * Only a plain Study Abroad field change that is not high risk qualifies.
 */
export function saApprovalBlock(p: SaApprovableProposal): string | null {
    if (!p.agent.startsWith(p.agentPrefix)) return 'Only proposals made by Hermes can be approved from Hermes';
    if (p.kind === 'sa_new_page') return 'New pages can only be approved in the Command Center';
    if (String(p.field || '') === 'status') return 'Publishing can only be approved in the Command Center';
    if (p.risk === 'high') return 'High-risk change: approve it in the Command Center';
    return null;
}

/**
 * Is the database this deployment talks to the production one?
 *
 * The bridge used to trust VERCEL_ENV alone, which is not the same thing: a Vercel *preview* answers
 * environment() === 'staging' while its TURSO_DATABASE_URL can still point at production (that is how the
 * Study Abroad queue turned out to be invisible in previews). Writing proposals into the production inbox from a
 * "staging" bridge is exactly what this must not do, so the database itself is checked too.
 *
 * Local copies and a URL that is the staging one (or is named as staging) are not production.
 */
export function isProductionDatabase(opts: { dbUrl?: string | null; stagingUrl?: string | null; useLocal?: boolean }): boolean {
    if (opts.useLocal) return false;
    const url = String(opts.dbUrl || '');
    if (!url) return false;                       // no remote URL: the app falls back to the local file
    const staging = String(opts.stagingUrl || '');
    if (staging && url === staging) return false;
    if (/-staging[.-]/.test(url)) return false;
    return true;
}
