import Link from 'next/link';
import { BookOpen, Search, ArrowRight, CheckCircle2, FileText, Bell, MapPin } from 'lucide-react';

export const metadata = {
    title: 'Scholarship Guides & Resources 2026 | IndiaScholarships',
    description: 'Complete list of scholarship guides. Learn how to apply for NSP, SSP, and other state portals. Find document checklists and status tracking tips.',
};

export default function GuidesPage() {
    const guides = [
        {
            title: 'National Scholarship Portal (NSP)',
            description: 'Step-by-step guide to applying for central government schemes.',
            icon: <BookOpen className="h-6 w-6" />,
            link: '/guides/nsp',
            tag: 'Central'
        },
        {
            title: 'SSP Karnataka Portal',
            description: 'Complete guide for Karnataka residents to use the SSP portal.',
            icon: <MapPin className="h-6 w-6" />,
            link: '/guides/ssp',
            tag: 'State'
        },
        {
            title: 'Application Status Tracking',
            description: 'Learn what different portal statuses mean and how to track payment.',
            icon: <Search className="h-6 w-6" />,
            link: '/guides/tracking',
            tag: 'Utility'
        },
        {
            title: 'Document Checklist',
            description: 'Every document you need before starting your application.',
            icon: <FileText className="h-6 w-6" />,
            link: '/guides/documents',
            tag: 'Essential'
        }
    ];

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

            <main className="max-w-5xl mx-auto px-4 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Scholarship Guides</h1>
                    <p className="text-lg text-gray-600">Authoritative resources to help you win your scholarships.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {guides.map((guide, i) => (
                        <Link key={i} href={guide.link} className="block group p-8 border rounded-3xl hover:border-blue-700 hover:shadow-xl transition-all relative overflow-hidden bg-white">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl group-hover:bg-blue-700 group-hover:text-white transition-colors">
                                    {guide.icon}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-gray-100 rounded-full text-gray-500">
                                    {guide.tag}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{guide.title}</h2>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                {guide.description}
                            </p>
                            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                                Read Guide <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Popular Topics Section */}
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Scholarship Topics</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            'Renewal Process', 'Aadhaar Seeding', 'PFMS Tracking',
                            'Income Certificate', 'Domicile Proof', 'Bank Account Validation'
                        ].map((topic, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                {topic}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-2xl mb-6">
                        <Bell className="h-5 w-5" />
                        <span className="text-sm font-bold">Never miss a dividend or deadline</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-6 italic font-serif">Ready to start searching?</h2>
                    <Link href="/scholarships" className="inline-flex items-center gap-2 px-10 py-4 bg-blue-700 text-white rounded-full font-bold hover:scale-105 transition-transform">
                        Explore All Scholarships <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </main>

            <footer className="border-t bg-gray-50 py-12 mt-12">
                <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                    <p>© 2025 IndiaScholarships. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
