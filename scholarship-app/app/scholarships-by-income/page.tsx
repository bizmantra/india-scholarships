import Link from 'next/link';
import { getIncomeRanges } from '@/lib/db';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Scholarships by Income Range - Find Based on Family Income',
    description: 'Browse scholarships by family income range. Find scholarships that match your family income eligibility criteria.',
};

export default function ScholarshipsByIncomePage() {
    const incomeRanges = getIncomeRanges();

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Scholarships by Income</span>
                </nav>

                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Scholarships by Income 2026
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                        Many scholarships are reserved for students from economically weaker sections. Find opportunities based on your family's annual income.
                    </p>
                </div>

                {/* Income Ranges Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {incomeRanges.map((range) => (
                        <Link
                            key={range.slug}
                            href={`/scholarships-income/${range.slug}`}
                            className="group relative p-8 bg-white border border-gray-100 rounded-3xl hover:border-blue-600 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-start gap-6">
                                <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">💰</div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                        {range.label}
                                    </h2>
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        {range.count} scholarship{range.count !== 1 ? 's' : ''} available for families in this income bracket.
                                    </p>
                                    <div className="flex items-center text-blue-700 font-bold">
                                        <span>Browse Scholarships</span>
                                        <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </section>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-10 mb-20 flex flex-col md:flex-row gap-8 items-center">
                    <div className="text-5xl">ℹ️</div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Income Verification Tip</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Most scholarships require an **Income Certificate** issued by a competent authority (Tehsildar/Revenue Officer). Ensure your certificate is dated within the last 6-12 months for successful applications.
                        </p>
                    </div>
                </div>

                {/* Related Links */}
                <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Other Categories</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'By State', href: '/state-scholarships' },
                            { label: 'By Education', href: '/scholarships-by-education' },
                            { label: 'By Category', href: '/scholarships-by-category' },
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
