import { getDatabase } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Corporate Scholarships in India | IndiaScholarships',
    description: 'Find corporate CSR scholarships from top companies like Tata, LIC, and more. Merit-cum-need based opportunities for Indian students.',
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

export default async function CorporateScholarshipsPage() {
    const db = getDatabase();

    // Get all corporate scholarships
    const scholarships = db.prepare(`
    SELECT 
      id, slug, title, provider, state, caste, amount_annual, amount_min,
      deadline, application_mode, level, last_verified, income_limit
    FROM scholarships
    WHERE scholarship_type = 'Corporate'
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
                            <a href="/private-scholarships" className="text-gray-700 hover:text-blue-700">Private</a>
                            <a href="/corporate-scholarships" className="text-blue-700 font-semibold">Corporate</a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Corporate CSR Scholarships</h1>
                    <p className="text-gray-600">Scholarships funded by corporate social responsibility (CSR) programs. These combine merit and need-based criteria to support deserving students.</p>
                    <p className="text-sm text-gray-500 mt-2">{parsedScholarships.length} scholarships found</p>
                </div>

                {/* Info Banner */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                    <h3 className="font-semibold text-green-900 mb-2">🏢 Why Corporate Scholarships?</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                        <li>• <strong>Generous amounts:</strong> ₹10,000 - ₹1,00,000 based on course and marks</li>
                        <li>• <strong>Merit-cum-need:</strong> Rewards both academic excellence and financial need</li>
                        <li>• <strong>All categories welcome:</strong> Open to General, OBC, SC, ST students</li>
                        <li>• <strong>Easy application:</strong> Simple online process through platforms like Buddy4Study</li>
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
                        <p className="text-gray-600">No corporate scholarships found.</p>
                    </div>
                )}

                {/* Bottom CTA */}
                <div className="mt-12 bg-gradient-to-r from-green-700 to-green-900 rounded-xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-3">Explore More Scholarship Types</h3>
                    <p className="mb-6 text-green-100">Browse government scholarships, private university scholarships, and more</p>
                    <div className="flex gap-4 justify-center">
                        <a
                            href="/"
                            className="inline-block bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                        >
                            Government Scholarships
                        </a>
                        <a
                            href="/private-scholarships"
                            className="inline-block bg-green-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-900 transition-colors border border-green-600"
                        >
                            Private Scholarships
                        </a>
                    </div>
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
