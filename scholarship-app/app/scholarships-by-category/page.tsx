import Link from 'next/link';
import { getAllCategories, getScholarshipsByCategory } from '@/lib/db';
import { slugify } from '@/lib/utils';

export const metadata = {
    title: 'Scholarships by Category - SC, ST, OBC, EBC, Minority',
    description: 'Browse scholarships by caste category. Find SC, ST, OBC, EBC, and Minority scholarships with complete eligibility and application details.',
};

export default function ScholarshipsByCategoryPage() {
    const categories = getAllCategories();

    const categoryInfo: Record<string, { description: string; icon: string }> = {
        'SC': { description: 'Scheduled Caste scholarships for students from SC communities', icon: '👥' },
        'ST': { description: 'Scheduled Tribe scholarships for students from ST communities', icon: '🏔️' },
        'OBC': { description: 'Other Backward Classes scholarships for OBC students', icon: '📚' },
        'EBC': { description: 'Economically Backward Classes scholarships', icon: '💰' },
        'Minority': { description: 'Scholarships for minority community students', icon: '🕌' },
        'All': { description: 'Scholarships open to all categories without caste restrictions', icon: '🌟' },
    };

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
                    <span className="text-gray-900">Scholarships by Category</span>
                </nav>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Scholarships by Category
                    </h1>
                    <p className="text-lg text-gray-600">
                        Browse scholarships based on caste category. Find scholarships specifically designed for SC, ST, OBC, EBC, Minority, and general category students.
                    </p>
                </div>

                {/* Category Grid */}
                <div className="space-y-8 mb-12">
                    {categories.map((category) => {
                        const info = categoryInfo[category] || { description: `Scholarships for ${category} category`, icon: '📖' };
                        const slug = slugify(category);
                        const scholarships = getScholarshipsByCategory(category).slice(0, 3);

                        return (
                            <div key={category} className="border-2 rounded-lg p-6">
                                {/* Category Header */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="text-4xl">{info.icon}</div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            {category} Scholarships
                                        </h2>
                                        <p className="text-gray-600">
                                            {info.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Top Scholarships */}
                                {scholarships.length > 0 && (
                                    <div className="space-y-3 mb-4 pl-16">
                                        {scholarships.map((scholarship: any) => (
                                            <Link
                                                key={scholarship.id}
                                                href={`/scholarships/${scholarship.slug}`}
                                                className="block p-3 bg-gray-50 rounded hover:bg-blue-50 transition-colors"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                                            {scholarship.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-600">
                                                            {scholarship.state} • {scholarship.provider_type}
                                                        </p>
                                                    </div>
                                                    {scholarship.amount && (
                                                        <span className="text-sm font-medium text-green-700 ml-3">
                                                            ₹{scholarship.amount.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* View All Link */}
                                <div className="pl-16">
                                    <Link
                                        href={`/scholarships-for/${slug}`}
                                        className="text-blue-700 font-medium hover:underline text-sm"
                                    >
                                        View all {category} scholarships →
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Related Links */}
                <div className="border-t pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore More</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/state-scholarships" className="text-blue-700 hover:underline">
                            Browse by State →
                        </Link>
                        <Link href="/scholarships-by-education" className="text-blue-700 hover:underline">
                            Browse by Education Level →
                        </Link>
                        <Link href="/scholarships-by-income" className="text-blue-700 hover:underline">
                            Browse by Income Range →
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
