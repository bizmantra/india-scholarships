import Link from 'next/link';
import { getAllLevels } from '@/lib/db';
import { slugify } from '@/lib/utils';

export const metadata = {
    title: 'Scholarships by Education Level - Pre-Matric, Post-Matric, UG',
    description: 'Find scholarships by education level. Browse Pre-Matric, Post-Matric, UG, and other education level scholarships.',
};

export default function ScholarshipsByEducationPage() {
    const levels = getAllLevels();

    const levelInfo: Record<string, { description: string; icon: string }> = {
        'Pre-Matric': { description: 'Scholarships for students in classes 1-10', icon: '🎒' },
        'Post-Matric': { description: 'Scholarships for students in classes 11-12 and diploma courses', icon: '📖' },
        'UG': { description: 'Undergraduate scholarships for degree programs', icon: '🎓' },
        'Class 9-12': { description: 'Scholarships specifically for high school students', icon: '📚' },
    };

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
                    <span className="text-gray-900">Scholarships by Education</span>
                </nav>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Scholarships by Education Level
                    </h1>
                    <p className="text-lg text-gray-600">
                        Find scholarships based on your current education level. From Pre-Matric to Undergraduate programs.
                    </p>
                </div>

                {/* Education Levels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {levels.map((level) => {
                        const info = levelInfo[level] || { description: `Scholarships for ${level} students`, icon: '📖' };
                        const slug = slugify(level);

                        return (
                            <Link
                                key={level}
                                href={`/scholarships-level/${slug}`}
                                className="block p-6 border-2 rounded-lg hover:border-blue-700 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">{info.icon}</div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            {level}
                                        </h2>
                                        <p className="text-gray-600 mb-3">
                                            {info.description}
                                        </p>
                                        <span className="text-blue-700 font-medium hover:underline">
                                            View all {level} scholarships →
                                        </span>
                                    </div>
                                </div>
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
                        <Link href="/state-scholarships" className="text-blue-700 hover:underline">
                            Browse by State →
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
