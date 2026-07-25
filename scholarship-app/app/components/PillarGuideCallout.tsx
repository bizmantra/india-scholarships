import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import type { PillarMetadata } from '@/lib/pillars';

// Renders nothing when there's no matching pillar for this hub — graceful,
// since only one pillar exists so far and most hub pages won't match yet.
export default function PillarGuideCallout({ pillar }: { pillar: PillarMetadata | null }) {
    if (!pillar) return null;

    return (
        <Link
            href={`/pillars/${pillar.slug}`}
            className="mb-8 flex items-center justify-between gap-4 p-5 bg-indigo-50/60 border border-indigo-100 rounded-2xl hover:bg-indigo-100/50 transition-colors group"
        >
            <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">Read the Full Guide</span>
                    <span className="text-sm font-bold text-gray-900">{pillar.title}</span>
                </div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>
    );
}
