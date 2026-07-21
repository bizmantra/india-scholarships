import { getAllScholarships } from '@/lib/db';
import ScholarshipsList from '@/app/components/ScholarshipsList';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Scholarship Deadlines & Closing Dates 2026 | IndiaScholarships',
    description: 'Track live upcoming scholarship application deadlines, closing dates, and remaining days. Filter by state, category/caste, and eligibility.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/scholarships/deadlines',
    }
};

export default async function DeadlinesTrackerPage() {
    const scholarships = await getAllScholarships();

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="py-10 bg-gray-50/50">
                <div className="container mx-auto px-4 max-w-6xl">
                    
                    {/* Page Header */}
                    <div className="mb-8">
                        <span className="text-[10px] uppercase font-bold text-google-blue tracking-wider block mb-1">
                            Deadline Tracker
                        </span>
                        <h1 className="text-3xl font-black text-gray-900 leading-none font-serif tracking-tight">
                            Closing Soon Schemes
                        </h1>
                        <p className="text-sm text-gray-500 mt-2 max-w-xl">
                            A live list of active scholarships closing within the next two weeks. Ensure you submit your application portal forms before the cutoff dates.
                        </p>
                    </div>

                    {/* Unified Listing Grid Component pre-filtered to "ClosingSoon" */}
                    <ScholarshipsList scholarships={scholarships} initialTab="ClosingSoon" />
                </div>
            </main>

            <Footer />
        </div>
    );
}
