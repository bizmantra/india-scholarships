import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByLevel, getAllLevels, CANONICAL_LEVELS } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import { slugify } from '@/lib/utils';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// Generate static params for all education levels (Canonical + Raw)
export function generateStaticParams() {
    const rawLevels = getAllLevels();
    const canonicalSlugs = Object.keys(CANONICAL_LEVELS);

    const params = [
        ...canonicalSlugs.map(slug => ({ level: slug })),
        ...rawLevels.map(level => ({ level: slugify(level) }))
    ];

    return params;
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ level: string }> }) {
    try {
        const { level: levelSlug } = await params;

        // 1. Check if it's a canonical level
        const canonical = CANONICAL_LEVELS[levelSlug];
        if (canonical) {
            return {
                title: `${canonical.label} Scholarships - Complete List & Eligibility`,
                description: `Find all ${canonical.label} scholarships in India. Complete list with eligibility criteria, amounts, deadlines, and application process.`,
            };
        }

        // 2. Check if it's a raw level
        const rawLevels = getAllLevels();
        const rawLevel = rawLevels.find(l => slugify(l) === levelSlug);

        if (rawLevel) {
            return {
                title: `${rawLevel} Scholarships - Complete List`,
                description: `Browse scholarships for ${rawLevel} students in India.`,
            };
        }

        return { title: 'Scholarships - India' };
    } catch (error) {
        return { title: 'Scholarships - Not Found' };
    }
}

export default async function LevelHubPage({ params }: { params: Promise<{ level: string }> }) {
    try {
        const { level: levelSlug } = await params;

        if (!levelSlug) return notFound();

        // 1. Resolve Display Name and Data
        let displayName = '';
        let description = '';
        let scholarships = [];

        const canonical = CANONICAL_LEVELS[levelSlug];
        if (canonical) {
            displayName = canonical.label;
            description = canonical.description;
            scholarships = getScholarshipsByLevel(levelSlug);
        } else {
            const rawLevels = getAllLevels();
            const rawLevel = rawLevels.find(l => slugify(l) === levelSlug);
            if (!rawLevel) return notFound();

            displayName = rawLevel;
            description = `Scholarships specifically for ${rawLevel} students across India.`;
            scholarships = getScholarshipsByLevel(rawLevel);
        }

        if (scholarships.length === 0) {
            notFound();
        }

        return (
            <div className="min-h-screen bg-white">
                <Header />

                <main className="max-w-5xl mx-auto px-4 py-8">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                        <Link href="/" className="hover:text-blue-700">Home</Link>
                        <span>/</span>
                        <Link href="/scholarships-by-education" className="hover:text-blue-700">Education Levels</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{displayName}</span>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            {displayName} Scholarships 2026
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                            {scholarships.length} scholarship{scholarships.length !== 1 ? 's' : ''} found for <span className="font-semibold text-blue-700">{displayName}</span>. {description}
                        </p>
                    </div>

                    {/* Scholarships List */}
                    <div className="space-y-6">
                        {scholarships.map((scholarship: any) => (
                            <ScholarshipCard
                                key={scholarship.id}
                                scholarship={scholarship}
                                viewMode="list"
                            />
                        ))}
                    </div>

                    <div className="mt-16 pt-10 border-t border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Other Categories</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Link href="/scholarships-by-education" className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-blue-700">
                                ← Back to All Levels
                            </Link>
                            <Link href="/state-scholarships" className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-blue-700 text-center justify-center">
                                Browse by State →
                            </Link>
                            <Link href="/scholarships-by-category" className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-blue-700 text-center justify-center">
                                Browse by Category →
                            </Link>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        );
    } catch (error) {
        notFound();
    }
}
