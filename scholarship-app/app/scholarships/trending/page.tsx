import { getAllScholarships } from '@/lib/db';
import ScholarshipsList from '@/app/components/ScholarshipsList';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

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
    const scholarships = await getAllScholarships();

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="py-10 bg-gray-50/50">
                <div className="container mx-auto px-4 max-w-6xl">
                    
                    {/* Page Header */}
                    <div className="mb-8">
                        <span className="text-[10px] uppercase font-bold text-google-blue tracking-wider block mb-1">
                            Trending Schemes
                        </span>
                        <h1 className="text-3xl font-black text-gray-900 leading-none font-serif tracking-tight">
                            Trending Scholarships
                        </h1>
                        <p className="text-sm text-gray-500 mt-2 max-w-xl">
                            The most active and highly search-matched opportunities based on student applications this week.
                        </p>
                    </div>

                    {/* Unified Listing Grid Component pre-filtered to "Trending" */}
                    <ScholarshipsList scholarships={scholarships} initialTab="Trending" />
                </div>
            </main>

            <Footer />
        </div>
    );
}
