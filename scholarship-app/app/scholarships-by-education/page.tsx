import Link from 'next/link';
import { CANONICAL_LEVELS } from '@/lib/db';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Scholarships by Education Level - Pre-Matric, Post-Matric, UG',
    description: 'Find scholarships by education level. Browse Pre-Matric, Post-Matric, Graduation, and PhD scholarships.',
};

export default function ScholarshipsByEducationPage() {
    const levels = Object.entries(CANONICAL_LEVELS);

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Scholarships by Education</span>
                </nav>

                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Scholarships by Education Level
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                        Find scholarships tailored to your current academic stage—from primary school to advanced doctoral research.
                    </p>
                </div>

                {/* Education Levels Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    {levels.map(([slug, info]) => (
                        <Link
                            key={slug}
                            href={`/scholarships-level/${slug}`}
                            className="group relative flex flex-col p-8 border-2 border-gray-100 rounded-2xl hover:border-blue-600 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                {info.icon}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                {info.label}
                            </h2>
                            <p className="text-gray-600 mb-6 flex-1 leading-relaxed">
                                {info.description}
                            </p>
                            <div className="flex items-center text-blue-700 font-bold">
                                <span>Browse Scholarships</span>
                                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
                            { label: 'By Category', href: '/scholarships-by-category' },
                            { label: 'By State', href: '/state-scholarships' },
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
