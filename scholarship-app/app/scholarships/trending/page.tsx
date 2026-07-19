import { getTrendingScholarships } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';

export async function generateMetadata() {
    const currentMonth = new Date().toLocaleString('en-IN', { month: 'long' });
    const currentYear = new Date().getFullYear();
    return {
        title: `Trending & Popular Scholarships (${currentMonth} ${currentYear}) | IndiaScholarships`,
        description: `Explore the most viewed and clicked scholarships in India for ${currentMonth} ${currentYear}. Find high-value private, corporate, and government programs that students are applying to.`,
        alternates: {
            canonical: 'https://www.indiascholarships.in/scholarships/trending',
        }
    };
}


export default async function TrendingPage() {
    const scholarships = await getTrendingScholarships(30);
    const currentMonth = new Date().toLocaleString('en-IN', { month: 'long' });
    const currentYear = new Date().getFullYear();

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="py-12 bg-gray-50/50">
                <div className="container mx-auto px-6 max-w-5xl">
                    {/* Back navigation */}
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-700 mb-8 transition-colors">
                        <span>←</span> Back to Home
                    </Link>

                    {/* Page Header */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-4 border border-purple-100">
                                <span>🔥</span> Hot Offers
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 font-serif mb-4 leading-tight tracking-tight">
                                Trending Scholarships ({currentMonth} {currentYear})
                            </h1>
                            <p className="text-gray-600 text-lg leading-relaxed font-medium">
                                The most popular scholarship programs and schemes being searched by students this week. These are high-impact, verified opportunities with great support details.
                            </p>
                        </div>
                        <div className="bg-purple-50/50 border border-purple-100/50 p-6 rounded-3xl text-center shrink-0 md:w-48">
                            <span className="text-4xl font-black text-purple-700 block mb-1">{scholarships.length}</span>
                            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">Top Trending</span>
                        </div>
                    </div>

                    {/* Scholarship Grid */}
                    {scholarships.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-gray-100 rounded-[2.5rem]">
                            <p className="text-gray-500 text-lg font-medium mb-4">No trending scholarships found.</p>
                            <Link href="/scholarships" className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-all">
                                Browse All Scholarships
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {scholarships.map((s: any) => (
                                <ScholarshipCard key={s.id} scholarship={s} viewMode="grid" />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
