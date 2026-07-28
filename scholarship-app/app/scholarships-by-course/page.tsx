import Link from 'next/link';
import { getMajorCourses, getCourseScholarshipCounts } from '@/lib/db';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Scholarships by Course - Engineering, Medical, Law & More | IndiaScholarships',
    description: 'Find scholarships by course and field of study. Browse verified financial aid for Engineering, Medical, Commerce, Science, Law, Management, and other courses in India.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/scholarships-by-course',
    }
};

export default async function CourseScholarshipsPage() {
    const courses = getMajorCourses();
    const countsMap = await getCourseScholarshipCounts();

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-google-blue">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Course Hubs</span>
                </nav>

                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Scholarships by Course 2026
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                        Find scholarships matched to your field of study — Engineering, Medical, Commerce, Science, Law, and more.
                    </p>
                </div>

                {/* Courses Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    {courses.map((course) => {
                        const count = countsMap[course.slug] || 0;
                        return (
                            <Link
                                key={course.slug}
                                href={`/scholarships-by-course/${course.slug}`}
                                className="group p-6 bg-white border border-gray-100 rounded-2xl hover:border-blue-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-google-blue transition-colors">
                                            {course.name}
                                        </h2>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-semibold rounded-full">
                                            {count} {count === 1 ? 'Scheme' : 'Schemes'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-6">
                                        Verified scholarships for {course.name.toLowerCase()} students across India, from central government schemes to private and corporate funding.
                                    </p>
                                </div>
                                <div className="flex items-center text-google-blue text-sm font-bold mt-auto">
                                    <span>Explore Hub</span>
                                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        );
                    })}
                </section>

                {/* Related Links */}
                <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Other Categories</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'By State', href: '/state-scholarships' },
                            { label: 'By University', href: '/scholarships-by-university' },
                            { label: 'By Education Level', href: '/scholarships-by-education' },
                            { label: 'Studying Abroad Instead?', href: '/scholarships/international' },
                            { label: 'Search All', href: '/scholarships' }
                        ].map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all font-medium text-gray-900"
                            >
                                {link.label}
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
