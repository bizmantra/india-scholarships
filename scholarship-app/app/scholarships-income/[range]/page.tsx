import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByIncomeRange, getIncomeRanges } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// Generate static params for all income ranges
export function generateStaticParams() {
    const ranges = getIncomeRanges();
    return ranges.map((range) => ({
        range: range.slug,
    }));
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ range: string }> }) {
    try {
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
    } catch (error) {
        return { title: 'Scholarships - Not Found' };
    }
}

export default async function IncomeRangeHubPage({ params }: { params: Promise<{ range: string }> }) {
    try {
        const { range } = await params;

        if (!range) return notFound();

        const ranges = getIncomeRanges();
        const rangeData = ranges.find(r => r.slug === range);

        if (!rangeData) {
            notFound();
        }

        // Get scholarships for this income range
        const scholarships = getScholarshipsByIncomeRange(rangeData.min, rangeData.max);

        return (
            <div className="min-h-screen bg-white">
                <Header />

                <main className="max-w-5xl mx-auto px-4 py-8">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                        <Link href="/" className="hover:text-blue-700">Home</Link>
                        <span>/</span>
                        <Link href="/scholarships-by-income" className="hover:text-blue-700">Income Ranges</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{rangeData.label}</span>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                            Scholarships for Families {rangeData.label}
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                            Students from families with an annual income of <span className="font-semibold text-blue-700">{rangeData.label}</span> are eligible for the following {scholarships.length} scholarships.
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-green-50/50 rounded-[2rem] p-10 mb-16 border border-green-100 flex flex-col md:flex-row gap-10 items-center">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-green-900">Eligibility Boost</h2>
                            <p className="text-green-800 leading-relaxed mb-4">
                                Most scholarships for this income range are "Needs-Based", meaning they prioritize students from economically weaker backgrounds.
                                Ensure your **Income Certificate** is issued by a Tehsildar or Gazetted Officer for these schemes.
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm font-medium text-green-700">Verified for 2026-27 Session</span>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-green-100 min-w-[180px] text-center">
                            <span className="text-sm text-gray-500 font-medium block mb-1 uppercase tracking-tight">Available Funds</span>
                            <span className="text-5xl font-extrabold text-green-700">{scholarships.length}</span>
                        </div>
                    </div>

                    {/* Scholarships List */}
                    <div className="mb-20">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Matching Scholarships</h2>
                            <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{scholarships.length} results</div>
                        </div>
                        {scholarships.length > 0 ? (
                            <div className="space-y-6">
                                {scholarships.map((scholarship: any) => (
                                    <ScholarshipCard
                                        key={scholarship.id}
                                        scholarship={scholarship}
                                        viewMode="list"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-3xl p-12 text-center border border-dashed border-gray-200">
                                <div className="text-4xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No scholarships found</h3>
                                <p className="text-gray-600">We couldn't find any scholarships matching this specific income range at the moment.</p>
                                <Link href="/search" className="mt-6 inline-block text-blue-700 font-bold hover:underline">
                                    Try Search All →
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Internal Linking */}
                    <div className="mt-16 pt-10 border-t border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Other Categories</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/scholarships-by-income" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-blue-700">
                                ← Income Ranges
                            </Link>
                            <Link href="/state-scholarships" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-blue-700 text-center">
                                By State →
                            </Link>
                            <Link href="/scholarships-by-education" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-blue-700 text-center">
                                By Education →
                            </Link>
                            <Link href="/scholarships-by-category" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-blue-700 text-center">
                                By Category →
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
