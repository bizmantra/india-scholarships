import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getInternationalScholarshipsByCountry } from '@/lib/db';
import ScholarshipsList from '@/app/components/ScholarshipsList';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const COUNTRIES = [
    { slug: 'usa', label: 'United States (USA)' },
    { slug: 'uk', label: 'United Kingdom (UK)' },
    { slug: 'canada', label: 'Canada' },
    { slug: 'australia', label: 'Australia' },
    { slug: 'germany', label: 'Germany' },
    { slug: 'europe', label: 'Europe' },
    { slug: 'japan', label: 'Japan' },
    { slug: 'singapore', label: 'Singapore' }
];

export async function generateStaticParams() {
    return COUNTRIES.map((cnt) => ({
        country: cnt.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
    const { country: countrySlug } = await params;
    const country = COUNTRIES.find(c => c.slug === countrySlug)?.label || countrySlug.toUpperCase();
    
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    // Append 'for Indian Students' if the destination is outside India
    const audienceModifier = countrySlug !== 'india' ? ' for Indian Students' : '';

    return {
        title: `Best Scholarships in ${country}${audienceModifier} ${currentYear} - ${nextYear} (Fully Funded)`,
        description: `Find top verified international and university scholarships to study in ${country}. Get direct application links, eligibility requirements, stipend amounts, and step-by-step application instructions.`,
        alternates: {
            canonical: `https://www.indiascholarships.in/scholarships-for/in/${countrySlug}`,
        }
    };

}

export default async function CountryHubPage({ params }: { params: Promise<{ country: string }> }) {
    const { country: countrySlug } = await params;
    const cntObj = COUNTRIES.find(c => c.slug === countrySlug);

    if (!cntObj) {
        return notFound();
    }

    const countryName = cntObj.label;
    const scholarships = await getInternationalScholarshipsByCountry(countrySlug);
    
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <Link href="/scholarships/international" className="hover:text-blue-700">International</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{countryName}</span>
                </nav>

                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Best Scholarships in {countryName}{countrySlug !== 'india' ? ' for Indian Students' : ''} {currentYear} - {nextYear}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                        Explore fully funded and merit-based global scholarships to support your study abroad journey in <span className="font-semibold text-blue-700">{countryName}</span>. Find application guides, deadlines, and portals.
                    </p>
                </div>

                {/* Scholarships List or Fallback */}
                {scholarships.length > 0 ? (
                    <div className="mb-20">
                        <ScholarshipsList scholarships={scholarships} showCategoryFilters={false} />
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-8 md:p-12 text-center max-w-2xl mx-auto mb-20">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-2xl">⏳</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Content Verification in Progress</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Our global research team is currently indexing and verifying active 2026/2027 university and government scholarships for students in <strong className="text-gray-900">{countryName}</strong>. 
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                            Updating Live Deadlines
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
