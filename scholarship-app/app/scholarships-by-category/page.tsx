import Link from 'next/link';
import { getAllCategories, getScholarshipsByCategory } from '@/lib/db';
import { slugify } from '@/lib/utils';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Scholarships by Category - SC, ST, OBC, EBC, Minority',
    description: 'Browse scholarships by caste category. Find SC, ST, OBC, EBC, and Minority scholarships with complete eligibility and application details.',
};

export default function ScholarshipsByCategoryPage() {
    const categories = getAllCategories();

    const categoryInfo: Record<string, { description: string; icon: string }> = {
        'SC': { description: 'Scholarships for students from Scheduled Caste communities.', icon: '👥' },
        'ST': { description: 'Scholarships for students from Scheduled Tribe communities.', icon: '🏔️' },
        'OBC': { description: 'Other Backward Classes scholarships for OBC students.', icon: '📚' },
        'EBC': { description: 'Economically Backward Classes scholarships.', icon: '💰' },
        'Minority': { description: 'Scholarships for minority community students.', icon: '🕌' },
        'General': { description: 'Scholarships open to all categories without caste restrictions.', icon: '🌟' },
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Scholarships by Category</span>
                </nav>

                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Scholarships by Category 2026
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                        Find scholarships specifically tailored to your social and economic category. Verified opportunities for SC, ST, OBC, and more.
                    </p>
                </div>

                {/* Category Grid */}
                <section className="space-y-6 mb-20">
                    {categories.map((category) => {
                        const info = categoryInfo[category] || { description: `Verified scholarships for ${category} category students.`, icon: '📖' };
                        const slug = slugify(category);
                        const scholarships = getScholarshipsByCategory(category).slice(0, 3);

                        return (
                            <div key={category} className="group flex flex-col md:flex-row gap-6 p-8 bg-white border border-gray-100 rounded-3xl hover:border-blue-600 hover:shadow-xl transition-all duration-300">
                                <div className="text-5xl md:pt-2">{info.icon}</div>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                {category} Category
                                            </h2>
                                            <p className="text-gray-600">{info.description}</p>
                                        </div>
                                        <Link
                                            href={`/scholarships-for/${slug}`}
                                            className="mt-4 md:mt-0 text-blue-700 font-bold flex items-center gap-1 hover:underline"
                                        >
                                            View All {category} <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                    </div>

                                    {/* Top Scholarships list */}
                                    {scholarships.length > 0 && (
                                        <div className="grid grid-cols-1 gap-2 mt-4">
                                            {scholarships.map((s: any) => (
                                                <Link
                                                    key={s.id}
                                                    href={`/scholarships/${s.slug}`}
                                                    className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                                                >
                                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 shrink-0" />
                                                    <span className="text-sm font-medium text-gray-700 truncate">{s.title}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* Related Links */}
                <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Other Categories</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'By State', href: '/state-scholarships' },
                            { label: 'By Education', href: '/scholarships-by-education' },
                            { label: 'By Income', href: '/scholarships-by-income' },
                            { label: 'Search All', href: '/search' }
                        ].map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all font-medium text-gray-900"
                            >
                                {link.label}
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
