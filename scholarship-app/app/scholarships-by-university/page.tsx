import Link from 'next/link';
import { getAllUniversitiesWithCounts } from '@/lib/db';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Scholarships by University - Browse Premier Indian Institutes | IndiaScholarships',
    description: 'Find scholarships by university. Browse official financial aid programs and scholarship options for DU, BITS Pilani, IITs, and other premier institutes in India.',
};

export default async function UniversityScholarshipsPage() {
    const universities = await getAllUniversitiesWithCounts();

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">University Hubs</span>
                </nav>

                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        University Scholarship Hubs 2026
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                        Explore dedicated institutional aid, merit-cum-means waivers, and alumni scholarships at India's top premier universities and engineering institutes.
                    </p>
                </div>

                {/* Universities Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    {universities.map((uni) => (
                        <Link
                            key={uni.slug}
                            href={`/scholarships-by-university/${uni.slug}`}
                            className="group p-6 bg-white border border-gray-100 rounded-2xl hover:border-blue-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                        {uni.name}
                                    </h2>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-semibold rounded-full">
                                        {uni.count} {uni.count === 1 ? 'Scheme' : 'Schemes'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-3 mb-6">
                                    {uni.description}
                                </p>
                            </div>
                            <div className="flex items-center text-blue-700 text-sm font-bold mt-auto">
                                <span>Explore Hub</span>
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
                            { label: 'By State', href: '/state-scholarships' },
                            { label: 'By Course', href: '/scholarships-by-course' },
                            { label: 'By Education Level', href: '/scholarships-by-education' },
                            { label: 'Search All', href: '/scholarships' }
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
