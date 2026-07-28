import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import type { PillarMetadata } from '@/lib/pillars';

// Renders nothing when there's no matching pillar for this hub — graceful,
// since only one pillar exists so far and most hub pages won't match yet.
export default function PillarGuideCallout({ pillar }: { pillar: PillarMetadata | null }) {
    if (!pillar) return null;

    return (
        <Link
            href={`/guides/${pillar.slug}`}
            className="mb-8 flex items-center justify-between gap-4 py-3 border-t border-b border-gray-100 hover:text-google-blue transition-colors group"
        >
            <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-google-blue shrink-0" />
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Read the Full Guide</span>
                    <span className="text-sm font-bold text-google-blue">{pillar.title}</span>
                </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>
    );
}
