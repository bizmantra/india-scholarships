import { jobsLinkForLevel } from '@/lib/partner-links';

type Props = {
    /** the scholarship level as the database holds it, or a level hub's display name */
    level: unknown;
    /** where the box appears, so the two placements can be compared in analytics */
    campaign: 'level-hub' | 'scholarship-page';
    className?: string;
};

/**
 * One contextual link from a scholarship page to the Rozgaro jobs page for the same
 * qualification. Present only where a matching page exists (see lib/partner-links.ts);
 * server-rendered, so the link is in the HTML search engines see.
 */
export default function PartnerJobsBox({ level, campaign, className = '' }: Props) {
    const link = jobsLinkForLevel(level, campaign);
    if (!link) return null;
    return (
        <aside
            aria-label="Government jobs for your qualification"
            className={`rounded-3xl border border-blue-100 bg-blue-50/50 p-6 sm:p-8 ${className}`.trim()}
        >
            <p className="text-[10px] font-black uppercase tracking-wider text-google-blue mb-2">
                What next
            </p>
            <h2 className="text-lg font-bold text-gray-900 leading-snug mb-2">{link.heading}</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{link.body}</p>
            <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-google-blue hover:underline"
            >
                {link.cta} →
            </a>
            <p className="text-[11px] text-gray-400 mt-3">
                Rozgaro.in is the publisher&apos;s government-job tracker. It opens in a new tab.
            </p>
        </aside>
    );
}
