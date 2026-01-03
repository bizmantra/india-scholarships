import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByIncomeRange, getIncomeRanges } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';

// Generate static params for all income ranges
export function generateStaticParams() {
    const ranges = getIncomeRanges();
    return ranges.map((range) => ({
        range: range.slug,
    }));
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ range: string }> }) {
    const { range } = await params;
    const ranges = getIncomeRanges();
    const rangeData = ranges.find(r => r.slug === range);

    if (!rangeData) {
        return {
            title: 'Scholarships by Income - Not Found',
        };
    }

    return {
        title: `Scholarships for Income ${rangeData.label} - Complete List`,
        description: `Find all scholarships for families with income ${rangeData.label}. Complete list with eligibility criteria, amounts, and application process.`,
    };
}

export default async function IncomeRangeHubPage({ params }: { params: Promise<{ range: string }> }) {
    const resolvedParams = await params;
    const range = resolvedParams?.range;

    // During build, params might be empty for route generation - skip in that case
    if (!range) {
        return null;
    }

    const ranges = getIncomeRanges();
    const rangeData = ranges.find(r => r.slug === range);

    if (!rangeData) {
        notFound();
    }

    // Get scholarships for this income range
    const scholarships = getScholarshipsByIncomeRange(rangeData.min, rangeData.max);

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
                    <Link href="/scholarships-by-income" className="hover:text-blue-700">Scholarships by Income</Link>
                    <span>/</span>
                    <span className="text-gray-900">Income {rangeData.label}</span>
                </nav>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight font-serif">
                        Scholarships for Income {rangeData.label} 2026
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                        {scholarships.length} scholarship{scholarships.length !== 1 ? 's' : ''} available for families with annual income <span className="font-semibold text-blue-700">{rangeData.label}</span> across India.
                    </p>
                </div>

                {/* Scholarships List */}
                {scholarships.length > 0 ? (
                    <div className="space-y-4">
                        {scholarships.map((scholarship: any) => (
                            <ScholarshipCard
                                key={scholarship.id}
                                scholarship={scholarship}
                                viewMode="list"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No scholarships found for this income range.</p>
                    </div>
                )}

                <hr className="my-8 border-gray-200" />

                {/* Related Links */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Explore More Scholarships</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/scholarships-by-income" className="text-blue-700 hover:underline text-sm">
                            ← Back to All Income Ranges
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
}
