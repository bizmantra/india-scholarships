import Link from 'next/link';
import { getAllStates } from '@/lib/db';
import { slugify } from '@/lib/utils';

export const metadata = {
    title: 'State Scholarships - Browse by State | IndiaScholarships',
    description: 'Find scholarships by state. Browse state-specific scholarships across India with complete eligibility criteria and application details.',
};

export default function StateScholarshipsPage() {
    const states = getAllStates();

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white">
                <div className="container mx-auto flex h-14 items-center px-4">
                    <Link href="/" className="text-xl font-bold text-blue-700">
                        IndiaScholarships
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900">State Scholarships</span>
                </nav>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        State Scholarships
                    </h1>
                    <p className="text-lg text-gray-600">
                        Browse scholarships by state. Each state offers unique scholarship programs for students domiciled in that state.
                    </p>
                </div>

                {/* States Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    {states.map((state) => {
                        const slug = slugify(state);

                        return (
                            <Link
                                key={state}
                                href={`/scholarships-in/${slug}`}
                                className="block p-5 border rounded-lg hover:border-blue-700 hover:shadow-md transition-all"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    {state}
                                </h2>
                                <span className="text-blue-700 font-medium hover:underline text-sm">
                                    View scholarships →
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Related Links */}
                <div className="border-t pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore More</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/scholarships-by-category" className="text-blue-700 hover:underline">
                            Browse by Category →
                        </Link>
                        <Link href="/scholarships-by-education" className="text-blue-700 hover:underline">
                            Browse by Education Level →
                        </Link>
                        <Link href="/scholarships-by-income" className="text-blue-700 hover:underline">
                            Browse by Income Range →
                        </Link>
                        <Link href="/search" className="text-blue-700 hover:underline">
                            Search Scholarships →
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                    <p>© 2025 IndiaScholarships. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
