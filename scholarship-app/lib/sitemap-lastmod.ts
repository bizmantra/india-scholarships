// <lastmod> for the children listed in /sitemap.xml (the sitemap index). One cheap MAX() query each; any
// failure returns undefined so the index is still served, just without a date.
import { getClient } from '@/lib/db';
import { LAUNCHED_COUNTRIES } from '@/lib/study-abroad/countries';
import { latestDate } from '@/lib/sitemap-dates';

async function maxOf(sql: string, args: string[] = []): Promise<unknown[]> {
    try {
        const res = await getClient().execute({ sql, args });
        return res.rows.flatMap((r: Record<string, unknown>) => Object.values(r));
    } catch {
        return [];
    }
}

/** Newest verification or creation date of any scholarship. */
export async function scholarshipsSitemapLastModified(): Promise<Date | undefined> {
    return latestDate(await maxOf('SELECT MAX(last_verified) AS a, MAX(created_at) AS b FROM scholarships'));
}

/** Newest change to a published Study Abroad page in a launched country. */
export async function studyAbroadSitemapLastModified(): Promise<Date | undefined> {
    const marks = LAUNCHED_COUNTRIES.map(() => '?').join(',');
    const values = await Promise.all(['sa_universities', 'sa_guides', 'sa_programs'].map(table =>
        maxOf(`SELECT MAX(updated_at) AS a, MAX(checked_at) AS b FROM ${table} WHERE status = 'published' AND country IN (${marks})`, [...LAUNCHED_COUNTRIES])));
    return latestDate(values.flat());
}
