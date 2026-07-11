import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByUniversity } from '@/lib/db';
import { UNIVERSITIES } from '@/lib/universities';
import ScholarshipsList from '@/app/components/ScholarshipsList';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// Generate static params for the 7 Category A universities
export async function generateStaticParams() {
    return UNIVERSITIES.map((uni) => ({
        slug: uni.slug,
    }));
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const uni = UNIVERSITIES.find(u => u.slug === slug);
        if (!uni) return { title: 'University Hub - Not Found' };

        const year = new Date().getFullYear();

        return {
            title: `${uni.name} Scholarships ${year} - Internal Aid & Eligibility`,
            description: `Complete guide to official scholarships and financial assistance programs at ${uni.name}. Learn about merit-cum-means waivers, eligibility rules, and deadlines.`,
        };
    } catch (error) {
        return { title: 'University Hub - Not Found' };
    }
}

export default async function UniversityHubPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const uni = UNIVERSITIES.find(u => u.slug === slug);

    if (!uni) return notFound();

    // Fetch matching scholarships
    const { specific, general } = await getScholarshipsByUniversity(slug);

    const allSchemesCount = specific.length + general.length;
    const maxAmount = specific.length > 0 
        ? Math.max(...specific.map((s: any) => s.amount_annual || 0)) 
        : (general.length > 0 ? Math.max(...general.map((s: any) => s.amount_annual || 0)) : 0);

    // Structure dynamic FAQs
    const faqs = [
        {
            question: `How do I apply for internal scholarships at ${uni.name}?`,
            answer: `Applications for internal scholarships at ${uni.name} are typically managed through the institute's official student portal (e.g., SWD portal for BITS, or ERP workflow for IITs). Notices are released at the start of the autumn/spring semester, and students must submit their applications online along with parental income certificates.`
        },
        {
            question: `What is the family income limit for financial aid at ${uni.name}?`,
            answer: `The income limit depends on the scheme. For IITs, merit-cum-means scholarships and full tuition fee waivers require a family income below ₹4.5 to ₹6 Lakhs per year (sometimes up to ₹8 Lakhs for alumni/CSR schemes). BITS Pilani MCN awards have a higher cap (typically up to ₹12 Lakhs).`
        },
        {
            question: `Can I combine university-specific scholarships with national/state schemes?`,
            answer: `Generally, no. Under government and institutional guidelines, students are not permitted to hold more than one active scholarship or tuition fee waiver at any given time. If you qualify for multiple, you must choose the one that offers the maximum benefit.`
        }
    ];

    // FAQPage JSON-LD Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Structured FAQ Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <Link href="/scholarships-by-university" className="hover:text-blue-700">Universities</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{uni.name}</span>
                </nav>

                {/* Hero Header */}
                <div className="mb-10 border-b border-gray-100 pb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Scholarships at {uni.name} 2026
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                        {uni.description}
                    </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                    <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                        <h3 className="text-blue-700 font-bold mb-1">Total Verified Options</h3>
                        <p className="text-3xl font-extrabold text-blue-900">{allSchemesCount}</p>
                        <p className="text-xs text-blue-600 mt-2">Internal & National</p>
                    </div>
                    <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100">
                        <h3 className="text-green-700 font-bold mb-1">Max Annual Benefit</h3>
                        <p className="text-3xl font-extrabold text-green-900">
                            {maxAmount > 0 ? `₹${(maxAmount / 100000).toFixed(1)}L` : 'Varies'}
                        </p>
                        <p className="text-xs text-green-600 mt-2">Up to 100% tuition waiver</p>
                    </div>
                    <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100">
                        <h3 className="text-purple-700 font-bold mb-1">Status Verification</h3>
                        <p className="text-3xl font-extrabold text-purple-900">Active</p>
                        <p className="text-xs text-purple-600 mt-2">Audited for 2026 cycle</p>
                    </div>
                </div>

                {/* University-Specific Scholarships */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Official {uni.name} Internal Scholarships
                        </h2>
                        <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {specific.length} {specific.length === 1 ? 'Scheme' : 'Schemes'}
                        </div>
                    </div>

                    {specific.length > 0 ? (
                        <ScholarshipsList scholarships={specific} showCategoryFilters={true} />
                    ) : (
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center">
                            <p className="text-gray-600 font-medium">
                                No university-administered schemes are currently active in our catalog.
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Check the national/general tab below for widely applicable opportunities.
                            </p>
                        </div>
                    )}
                </section>

                {/* General National Scholarships */}
                {general.length > 0 && (
                    <section className="mb-20">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                                National & Corporate Scholarships open to {uni.name} students
                            </h2>
                            <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {general.length} Schemes
                            </div>
                        </div>
                        <ScholarshipsList scholarships={general} showCategoryFilters={true} />
                    </section>
                )}

                {/* FAQ Section */}
                <section className="bg-gray-50 rounded-[2.5rem] p-10 mb-20 border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
                        Frequently Asked Questions (FAQs)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {faqs.map((faq, index) => (
                            <div key={index}>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                                    {faq.question}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
