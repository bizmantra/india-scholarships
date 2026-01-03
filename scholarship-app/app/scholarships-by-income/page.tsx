import Link from 'next/link';
import { getIncomeRanges } from '@/lib/db';

export const metadata = {
    title: 'Scholarships by Income Range - Find Based on Family Income',
    description: 'Browse scholarships by family income range. Find scholarships that match your family income eligibility criteria.',
};

export default function ScholarshipsByIncomePage() {
    const incomeRanges = getIncomeRanges();

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white">
                <div className="container mx-auto flex h-14 items-center px-4">
                    <Link href="/" className="text-xl font-bold text-blue-700">
                        IndiaScholarships
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900">Scholarships by Income</span>
                </nav>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Scholarships by Income Range
                    </h1>
                    <p className="text-lg text-gray-600">
                        Find scholarships based on your family's annual income. Many scholarships have income eligibility criteria to support students from economically weaker sections.
                    </p>
                </div>

                {/* Income Ranges Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {incomeRanges.map((range) => {
                        return (
                            <Link
                                key={range.slug}
                                href={`/scholarships-income/${range.slug}`}
                                className="block p-6 border-2 rounded-lg hover:border-blue-700 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">💰</div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            {range.label}
                                        </h2>
                                        <p className="text-gray-600 mb-3">
                                            {range.count} scholarship{range.count !== 1 ? 's' : ''} available for families with income in this range
                                        </p>
                                        <span className="text-blue-700 font-medium hover:underline">
                                            View scholarships →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">💡 Income Verification</h3>
                    <p className="text-sm text-gray-700">
                        Most scholarships require income certificates issued by competent authorities. Make sure to have your family's income certificate ready when applying.
                    </p>
                </div>

                {/* Related Links */}
                <div className="border-t pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore More</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/scholarships-by-category" className="text-blue-700 hover:underline">
                            Browse by Category →
                        </Link>
                        <Link href="/state-scholarships" className="text-blue-700 hover:underline">
                            Browse by State →
                        </Link>
                        <Link href="/scholarships-by-education" className="text-blue-700 hover:underline">
                            Browse by Education Level →
                        </Link>
                        <Link href="/search" className="text-blue-700 hover:underline">
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
