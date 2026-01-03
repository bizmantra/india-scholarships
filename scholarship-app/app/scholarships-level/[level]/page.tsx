import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByLevel, getAllLevels } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import { slugify } from '@/lib/utils';

// Generate static params for all education levels
export function generateStaticParams() {
    const levels = getAllLevels();
    return levels.map((level) => ({
        level: slugify(level),
    }));
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ level: string }> }) {
    try {
        const resolvedParams = await params;
        const levels = getAllLevels();
        const originalLevel = levels.find(l => slugify(l) === resolvedParams.level) || resolvedParams.level;

        return {
            title: `${originalLevel} Scholarships - Complete List & Eligibility`,
            description: `Find all ${originalLevel} scholarships in India. Complete list with eligibility criteria, amounts, deadlines, and application process.`,
        };
    } catch (error) {
        return { title: 'Scholarships - Not Found' };
    }
}

export default async function LevelHubPage({ params }: { params: Promise<{ level: string }> }) {
    try {
        const resolvedParams = await params;
        const levelSlug = resolvedParams?.level;

        if (!levelSlug) return null;

        // Resolve original level name
        const levels = getAllLevels();
        const levelName = levels.find(l => slugify(l) === levelSlug) || levelSlug;

        // Get scholarships for this level
        const scholarships = getScholarshipsByLevel(levelName);

        if (scholarships.length === 0) {
            notFound();
        }

        return (
            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 w-full border-b bg-white">
                    <div className="container mx-auto flex h-14 items-center px-4">
                        <Link href="/" className="text-xl font-black text-blue-700 font-serif tracking-tight">
                            IndiaScholarships
                        </Link>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-4 py-6">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                        <Link href="/" className="hover:text-blue-700">Home</Link>
                        <span>/</span>
                        <Link href="/scholarships-by-education" className="hover:text-blue-700">Scholarships by Education</Link>
                        <span>/</span>
                        <span className="text-gray-900">{levelName}</span>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight font-serif">
                            {levelName} Scholarships 2026
                        </h1>
                        <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                            {scholarships.length} scholarship{scholarships.length !== 1 ? 's' : ''} available for <span className="font-semibold text-blue-700">{levelName}</span> students across India.
                        </p>
                    </div>

                    {/* Scholarships List */}
                    <div className="space-y-4">
                        {scholarships.map((scholarship: any) => (
                            <ScholarshipCard
                                key={scholarship.id}
                                scholarship={scholarship}
                                viewMode="list"
                            />
                        ))}
                    </div>

                    <hr className="my-8 border-gray-200" />

                    {/* Related Links */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Explore More Scholarships</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/scholarships-by-education" className="text-blue-700 hover:underline text-sm">
                                ← Back to All Education Levels
                            </Link>
                            <Link href="/state-scholarships" className="text-blue-700 hover:underline text-sm">
                                Browse by State →
                            </Link>
                            <Link href="/scholarships-by-category" className="text-blue-700 hover:underline text-sm">
                                Browse by Category →
                            </Link>
                            <Link href="/search" className="text-blue-700 hover:underline text-sm">
                                Search Scholarships →
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t bg-gray-50 py-8 mt-12">
                    <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                        <p>© 2025 IndiaScholarships. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        );
    } catch (error) {
        notFound();
    }
}
