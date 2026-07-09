import { getClosingSoonScholarships } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export async function generateMetadata() {
    const currentMonth = new Date().toLocaleString('en-IN', { month: 'long' });
    const currentYear = new Date().getFullYear();
    return {
        title: `Scholarships Closing Soon (${currentMonth} ${currentYear}) | IndiaScholarships`,
        description: `Track upcoming deadlines for active scholarships in India closing soon in ${currentMonth} ${currentYear}. Apply before the portals shut down to secure your funding.`,
    };
}

export default async function ClosingSoonPage() {
    const scholarships = await getClosingSoonScholarships(30);
    const currentMonth = new Date().toLocaleString('en-IN', { month: 'long' });
    const currentYear = new Date().getFullYear();

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="py-12 bg-gray-50/50">
                <div className="container mx-auto px-6 max-w-5xl">
                    {/* Back navigation */}
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-700 mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Link>

                    {/* Page Header */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold mb-4 border border-red-100 animate-pulse">
                                <AlertCircle className="h-3.5 w-3.5" /> High Urgency
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 font-serif mb-4 leading-tight tracking-tight">
                                Closing Soon ({currentMonth} {currentYear})
                            </h1>
                            <p className="text-gray-600 text-lg leading-relaxed font-medium">
                                Active scholarships whose application deadlines are approaching fast. Check eligibility guidelines and submit your forms online immediately.
                            </p>
                        </div>
                        <div className="bg-red-50/50 border border-red-100/50 p-6 rounded-3xl text-center shrink-0 md:w-48">
                            <span className="text-4xl font-black text-red-700 block mb-1">{scholarships.length}</span>
                            <span className="text-xs font-bold text-red-900 uppercase tracking-wider">Ending Soon</span>
                        </div>
                    </div>

                    {/* Scholarship Grid */}
                    {scholarships.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-gray-100 rounded-[2.5rem]">
                            <p className="text-gray-500 text-lg font-medium mb-4">No scholarships closing soon found.</p>
                            <Link href="/scholarships" className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-all">
                                Browse All Scholarships
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {scholarships.map(s => (
                                <ScholarshipCard key={s.id} scholarship={s} viewMode="grid" />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
