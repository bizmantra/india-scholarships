import { getAllScholarships } from '@/lib/db';
import ScholarshipsList from '@/app/components/ScholarshipsList';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Verified Scholarships Catalog - Search & Filter | IndiaScholarships',
    description: 'Use the IndiaScholarships faceted search catalog to filter through hundreds of verified government and private schemes by caste, state, education level, and income.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/scholarships',
    }
};

export default async function ScholarshipsPage() {
    const scholarships = await getAllScholarships();

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="py-10 bg-gray-50/50">
                <div className="container mx-auto px-4 max-w-6xl">
                    
                    {/* Catalog Header */}
                    <div className="mb-8">
                        <span className="text-[10px] uppercase font-bold text-google-blue tracking-wider block mb-1">
                            IndiaScholarships Database Explorer
                        </span>
                        <h1 className="text-3xl font-black text-gray-900 leading-none font-serif tracking-tight">
                            Explore Verified Funding
                        </h1>
                        <p className="text-sm text-gray-500 mt-2 max-w-xl">
                            Search and match central government, state, and private CSR schemes based on your eligibility. Updates verified daily by our research editors.
                        </p>
                    </div>

                    {/* Unified Listing Grid Component */}
                    <ScholarshipsList scholarships={scholarships} />
                </div>
            </main>

            <Footer />
        </div>
    );
}
