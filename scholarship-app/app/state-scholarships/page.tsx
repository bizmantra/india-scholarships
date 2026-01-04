import Link from 'next/link';
import { getAllStates } from '@/lib/db';
import { slugify } from '@/lib/utils';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'State Scholarships - Browse by State | IndiaScholarships',
    description: 'Find scholarships by state. Browse state-specific scholarships across India with complete eligibility criteria and application details.',
};

export default function StateScholarshipsPage() {
    const states = getAllStates();

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">State Scholarships</span>
                </nav>

                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        State Scholarships 2026
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                        Explore dedicated scholarship programs offered by 30+ Indian states and UTs. Find schemes specifically for your region.
                    </p>
                </div>

                {/* States Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
                    {states.map((state) => (
                        <Link
                            key={state}
                            href={`/scholarships-in/${slugify(state)}`}
                            className="group p-6 bg-white border border-gray-100 rounded-2xl hover:border-blue-600 hover:shadow-xl transition-all duration-300"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                {state}
                            </h2>
                            <div className="flex items-center text-blue-700 text-sm font-bold">
                                <span>View Scholarships</span>
                                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </section>

                {/* Related Links */}
                <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Other Categories</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'By Education', href: '/scholarships-by-education' },
                            { label: 'By Category', href: '/scholarships-by-category' },
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
