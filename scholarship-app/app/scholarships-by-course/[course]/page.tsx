import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByCourse, getMajorCourses } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import { GraduationCap, BookOpen, Clock, Info } from 'lucide-react';

// Help helper for capitalized names
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export async function generateStaticParams() {
    const courses = getMajorCourses();
    return courses.map((course) => ({
        course: course.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }) {
    const { course } = await params;
    const courseName = capitalize(course);

    return {
        title: `${courseName} Scholarships 2026 - Find Funding for ${courseName} Students`,
        description: `Explore verified scholarships for ${courseName} students in India. Find eligibility criteria, amounts, and step-by-step application guides for ${courseName} courses.`,
    };
}

export default async function CourseHubPage({ params }: { params: Promise<{ course: string }> }) {
    const { course } = await params;
    const courseName = capitalize(course);

    // Get scholarships for this course cluster
    const scholarships = getScholarshipsByCourse(courseName);

    if (scholarships.length === 0 && course !== 'all') {
        notFound();
    }

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
                <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span className="text-gray-400">/</span>
                    <Link href="/scholarships" className="hover:text-blue-700">Scholarships</Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-medium">For {courseName}</span>
                </nav>

                {/* Hero section for course */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            Scholarships for {courseName} Students
                        </h1>
                    </div>
                    <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                        Funding your {courseName} degree can be challenging. We've gathered <span className="font-bold text-blue-700">{scholarships.length} scholarships</span>
                        from government ministries and private foundations to help you cover tuition fees and living expenses.
                    </p>
                </div>

                {/* Quick Guidance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="flex gap-4 p-5 border rounded-2xl">
                        <Clock className="h-6 w-6 text-orange-500 shrink-0" />
                        <div>
                            <h3 className="font-bold text-sm mb-1">When to Apply?</h3>
                            <p className="text-xs text-gray-500">Most {courseName} scholarships open right after the admission season (August-September).</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-5 border rounded-2xl">
                        <Info className="h-6 w-6 text-blue-500 shrink-0" />
                        <div>
                            <h3 className="font-bold text-sm mb-1">Key Documents</h3>
                            <p className="text-xs text-gray-500">Keep your admission letter, fee receipt, and entrance rank card ready.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-5 border rounded-2xl">
                        <GraduationCap className="h-6 w-6 text-green-500 shrink-0" />
                        <div>
                            <h3 className="font-bold text-sm mb-1">Difficulty Level</h3>
                            <p className="text-xs text-gray-500">Competitive {courseName} scholarships often require high academic merit or low family income.</p>
                        </div>
                    </div>
                </div>

                {/* Scholarships List */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-8 border-b pb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Recommended Schemes</h2>
                        <span className="text-sm font-semibold px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                            {scholarships.length} Schemes Found
                        </span>
                    </div>
                    <div className="space-y-4">
                        {scholarships.map((scholarship: any) => (
                            <ScholarshipCard
                                key={scholarship.id}
                                scholarship={scholarship}
                                viewMode="list"
                            />
                        ))}
                    </div>
                </div>

                {/* FAQs for Courses */}
                <div className="bg-gray-50 rounded-3xl p-8 mb-16 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{courseName} Scholarship FAQ</h2>
                    <div className="space-y-4 max-w-3xl mx-auto">
                        <details className="group bg-white rounded-xl border p-4 [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer items-center justify-between gap-1.5">
                                <h3 className="font-bold text-gray-900">Are there specific scholarships for girls in {courseName}?</h3>
                                <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </summary>
                            <p className="mt-4 leading-relaxed text-gray-600 text-sm">
                                Yes, many schemes like AICTE Pragati (for Engineering) or LIC Golden Jubilee explicitly reserve seats or offer exclusive funding for female students in technical and professional courses.
                            </p>
                        </details>

                        <details className="group bg-white rounded-xl border p-4 [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer items-center justify-between gap-1.5">
                                <h3 className="font-bold text-gray-900">Can I apply if I got admission through management quota?</h3>
                                <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </summary>
                            <p className="mt-4 leading-relaxed text-gray-600 text-sm">
                                Most government scholarships require admission through a centralized counselling process based on entrance exam ranks. Management quota students are often ineligible for state and central government scholarship schemes.
                            </p>
                        </details>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center py-8 border-t">
                    <p className="text-gray-500 text-sm italic">Didn't find what you were looking for?</p>
                    <div className="flex gap-4">
                        <Link href="/scholarships-by-education" className="text-blue-700 font-bold hover:underline">By Level →</Link>
                        <Link href="/state-scholarships" className="text-blue-700 font-bold hover:underline">By State →</Link>
                    </div>
                </div>
            </main>

            <footer className="border-t bg-gray-50 py-12">
                <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                    <p>© 2025 IndiaScholarships. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
