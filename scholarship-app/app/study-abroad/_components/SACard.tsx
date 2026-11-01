// Result card for universities, guides, programs and tools, styled like the main site's ScholarshipCard
import Link from 'next/link';

export interface CardProps {
    href: string; title: string; subtitle?: string | null; figure?: string | null; figureNote?: string | null;
    detail?: string | null; badge?: string | null; cta?: string;
}

export default function SACard({ href, title, subtitle, figure, figureNote, detail, badge, cta = 'View Details →' }: CardProps) {
    return (
        <Link href={href} className="group flex flex-col bg-white border border-slate-200 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 p-6 transition-all duration-300 h-full justify-between">
            <div className="flex justify-between items-start gap-3 mb-2">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand transition-colors leading-snug">{title}</h3>
                {badge && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 text-emerald-700 bg-emerald-50">{badge}</span>}
            </div>
            {subtitle && <p className="text-xs text-slate-500 mb-3 line-clamp-3">{subtitle}</p>}
            {(figure || figureNote) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mb-3">
                    {figure && <span className="font-extrabold text-google-green text-sm">{figure}</span>}
                    {figureNote && <span className="text-slate-600">{figureNote}</span>}
                </div>
            )}
            {detail && <div className="bg-surface-gray border border-slate-100 rounded-lg px-3 py-2 text-xs text-slate-600 mb-3">{detail}</div>}
            <span className="mt-auto inline-flex items-center justify-center gap-1 bg-brand group-hover:bg-brand-dark text-white text-xs font-bold rounded-xl px-4 py-2.5 transition-colors">{cta}</span>
        </Link>
    );
}

export function CardGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>;
}
