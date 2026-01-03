import Link from 'next/link';

export const metadata = {
    title: 'Government Scholarships - Central & State Schemes',
    description: 'Browse all government scholarships including central and state government schemes. Find eligibility, benefits, and application details.',
};

export default function GovernmentScholarshipsPage() {
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
                    <span className="text-gray-900">Government Scholarships</span>
                </nav>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Government Scholarships
                    </h1>
                    <p className="text-lg text-gray-600">
                        Explore scholarships offered by central and state governments across India. These scholarships support students from various backgrounds and education levels.
                    </p>
                </div>

                {/* Browse Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <Link
                        href="/scholarships-by-category"
                        className="block p-6 border-2 rounded-lg hover:border-blue-700 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">👥</div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    By Category
                                </h2>
                                <p className="text-gray-600 mb-3">
                                    Browse scholarships by caste category - SC, ST, OBC, EBC, Minority, and General
                                </p>
                                <span className="text-blue-700 font-medium hover:underline">
                                    View categories →
                                </span>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/state-scholarships"
                        className="block p-6 border-2 rounded-lg hover:border-blue-700 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">🗺️</div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    By State
                                </h2>
                                <p className="text-gray-600 mb-3">
                                    Find state-specific scholarships offered by your state government
                                </p>
                                <span className="text-blue-700 font-medium hover:underline">
                                    View states →
                                </span>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/scholarships-by-education"
                        className="block p-6 border-2 rounded-lg hover:border-blue-700 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">🎓</div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    By Education Level
                                </h2>
                                <p className="text-gray-600 mb-3">
                                    Browse scholarships based on your education level - Pre-Matric, Post-Matric, UG
                                </p>
                                <span className="text-blue-700 font-medium hover:underline">
                                    View levels →
                                </span>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/scholarships-by-income"
                        className="block p-6 border-2 rounded-lg hover:border-blue-700 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">💰</div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    By Income Range
                                </h2>
                                <p className="text-gray-600 mb-3">
                                    Find scholarships that match your family's annual income eligibility
                                </p>
                                <span className="text-blue-700 font-medium hover:underline">
                                    View income ranges →
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Info Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">📋 About Government Scholarships</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Government scholarships are offered by central and state governments</li>
                        <li>• Most are merit-cum-means based, requiring both academic performance and income criteria</li>
                        <li>• Application is typically done through National Scholarship Portal (NSP) or state portals</li>
                        <li>• Documents like caste certificate, income certificate, and marksheets are required</li>
                        <li>• Scholarships are renewable annually based on continued eligibility</li>
                    </ul>
                </div>

                {/* Search CTA */}
                <div className="text-center py-8 border-t">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Can't find what you're looking for?
                    </h2>
                    <Link
                        href="/search"
                        className="inline-block px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors"
                    >
                        Search All Scholarships
                    </Link>
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
