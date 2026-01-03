import { getDatabase } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Private Scholarships in India | IndiaScholarships',
    description: 'Explore private and corporate scholarships for Indian students. Includes BITSAT, LIC Golden Jubilee, Tata Pankh, and more merit-based opportunities.',
};

interface Scholarship {
    id: number;
    slug: string;
    title: string;
    provider: string;
    state: string;
    caste: string;
    amount_annual: number;
    amount_min?: number;
    deadline?: string;
    application_mode: string;
    level: string;
    last_verified: string;
    income_limit?: number;
}

export default async function PrivateScholarshipsPage() {
    const db = getDatabase();

    // Get all private and corporate scholarships
    const scholarships = db.prepare(`
    SELECT 
      id, slug, title, provider, state, caste, amount_annual, amount_min,
      deadline, application_mode, level, last_verified, income_limit
    FROM scholarships
    WHERE scholarship_type IN ('Private', 'Corporate')
    AND status = 'Active'
    ORDER BY priority_score DESC, title ASC
  `).all() as Scholarship[];

    // Parse caste JSON
    const parsedScholarships = scholarships.map(s => ({
        ...s,
        caste: JSON.parse(s.caste || '[]')
    }));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <a href="/" className="text-2xl font-bold text-blue-700">
                            IndiaScholarships
                        </a>
                        <nav className="hidden md:flex gap-6">
                            <a href="/" className="text-gray-700 hover:text-blue-700">Home</a>
                            <a href="/private-scholarships" className="text-blue-700 font-semibold">Private</a>
                            <a href="/scholarships-in/all" className="text-gray-700 hover:text-blue-700">Browse All</a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Private & Corporate Scholarships</h1>
                    <p className="text-gray-600">Discover merit-based scholarships from private universities and corporate CSR programs. These scholarships often have higher amounts and unique benefits.</p>
                    <p className="text-sm text-gray-500 mt-2">{parsedScholarships.length} scholarships found</p>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 About Private Scholarships</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <strong>Higher amounts:</strong> Often ₹50,000 - ₹1,00,000+ per year</li>
                        <li>• <strong>Merit-based:</strong> Focus on academic excellence and entrance exam scores</li>
                        <li>• <strong>Flexible criteria:</strong> Open to all categories, income limits vary</li>
                        <li>• <strong>Quick processing:</strong> Faster disbursement compared to government schemes</li>
                    </ul>
                </div>

                {/* Scholarships Grid */}
                {parsedScholarships.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {parsedScholarships.map((scholarship) => (
                            <ScholarshipCard
                                key={scholarship.id}
                                scholarship={scholarship}
                                viewMode="grid"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No private scholarships found.</p>
                    </div>
                )}

                {/* Bottom CTA */}
                <div className="mt-12 bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-3">Looking for Government Scholarships?</h3>
                    <p className="mb-6 text-blue-100">Explore 20+ government scholarships with lower income limits and guaranteed benefits</p>
                    <a
                        href="/"
                        className="inline-block bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                        Browse Government Scholarships →
                    </a>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-gray-600 text-sm">
                        © 2025 IndiaScholarships.in - Helping students find scholarships across India
                    </p>
                </div>
            </footer>
        </div>
    );
}
