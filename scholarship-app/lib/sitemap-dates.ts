// Dates for <lastmod> in the sitemaps. Kept free of DB imports so it can be unit-tested.

/** Parse a database timestamp ("2026-11-28", "2026-11-28 10:15:06" or ISO) as UTC. Returns undefined when empty or invalid. */
export function parseDbDate(value: unknown): Date | undefined {
    if (value == null) return undefined;
    const text = String(value).trim();
    if (!text) return undefined;
    // SQLite's datetime('now') has no zone and a space instead of "T"; treat it as UTC like Turso does
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(text)
        ? `${text}T00:00:00Z`
        : /[zZ]|[+-]\d{2}:?\d{2}$/.test(text) ? text.replace(' ', 'T') : `${text.replace(' ', 'T')}Z`;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? undefined : d;
}

/** The latest valid date among the values, or undefined when none is valid. */
export function latestDate(values: unknown[]): Date | undefined {
    let latest: Date | undefined;
    for (const v of values) {
        const d = parseDbDate(v);
        if (d && (!latest || d > latest)) latest = d;
    }
    return latest;
}

/**
 * lastmod for a scholarship page. The scholarships table has no updated_at column, so use the last
 * verification date, then the creation date. Returns undefined when neither is set: a missing lastmod
 * is better than "now", which would change on every regeneration and teach Google to ignore lastmod.
 */
export function scholarshipLastModified(s: { updated_at?: unknown; last_verified?: unknown; created_at?: unknown }): Date | undefined {
    return latestDate([s.updated_at, s.last_verified, s.created_at]);
}
