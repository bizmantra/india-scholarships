import { getAllScholarships } from '@/lib/db';
import ScholarshipsList from '@/app/components/ScholarshipsList';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export async function generateMetadata() {
    const currentMonth = new Date().toLocaleString('en-IN', { month: 'long' });
    const currentYear = new Date().getFullYear();
    return {
        title: `Newly Added & Verified Scholarships (${currentMonth} ${currentYear}) | IndiaScholarships`,
        description: `Explore the newest scholarships in India added and verified in ${currentMonth} ${currentYear}. Apply for newly active central government, state, and private CSR scholarships.`,
        alternates: {
            canonical: 'https://www.indiascholarships.in/scholarships/recently-added',
        }
    };
}

export default async function RecentlyAddedPage() {
    const scholarships = await getAllScholarships();

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="py-10 bg-gray-50/50">
                <div className="container mx-auto px-4 max-w-6xl">
                    
                    {/* Page Header */}
                    <div className="mb-8">
                        <span className="text-[10px] uppercase font-bold text-google-blue tracking-wider block mb-1">
                            New Opportunities
                        </span>
                        <h1 className="text-3xl font-black text-gray-900 leading-none font-serif tracking-tight">
                            Recently Added Schemes
                        </h1>
                        <p className="text-sm text-gray-500 mt-2 max-w-xl">
                            Explore newly launched financial aid schemes, CSR grants, and ministry updates verified by our editors.
                        </p>
                    </div>

                    {/* Unified Listing Grid Component pre-filtered to "RecentlyAdded" */}
                    <ScholarshipsList scholarships={scholarships} initialTab="RecentlyAdded" />
                </div>
            </main>

            <Footer />
        </div>
    );
}
