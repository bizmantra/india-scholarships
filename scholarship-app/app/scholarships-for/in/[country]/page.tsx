import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getInternationalScholarshipsByCountry } from '@/lib/db';
import { COUNTRIES as SA_COUNTRIES, isCountry } from '@/lib/study-abroad/countries';
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

    // An empty hub is a real 404, not a 200 "coming soon" page (Google treats those as soft 404s).
    if (scholarships.length === 0) {
        return notFound();
    }

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-google-blue">Home</Link>
                    <span>/</span>
                    <Link href="/scholarships/international" className="hover:text-google-blue">International</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{countryName}</span>
                </nav>

                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Best Scholarships in {countryName}{countrySlug !== 'india' ? ' for Indian Students' : ''} {currentYear} - {nextYear}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                        Explore fully funded and merit-based global scholarships to support your study abroad journey in <span className="font-semibold text-gray-900">{countryName}</span>. Find application guides, deadlines, and portals.
                    </p>
                </div>

                <div className="mb-12">
                    <ScholarshipsList scholarships={scholarships} showCategoryFilters={false} includeInternational />
                </div>

                {isCountry(countrySlug) && (
                    <section className="mb-16 p-6 rounded-2xl border border-blue-100 bg-blue-50/50">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Plan Your Study in {SA_COUNTRIES[countrySlug].name}
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Compare universities, check living costs, and follow step-by-step student visa guides for {SA_COUNTRIES[countrySlug].name}.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <Link href={`/study-abroad/study-in/${countrySlug}`} className="px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm font-semibold text-google-blue hover:border-blue-300 hover:underline">
                                Study in {SA_COUNTRIES[countrySlug].name} Hub →
                            </Link>
                            <Link href={`/study-abroad/study-in/${countrySlug}/universities`} className="px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm font-semibold text-google-blue hover:border-blue-300 hover:underline">
                                Compare Universities →
                            </Link>
                            <Link href={`/study-abroad/study-in/${countrySlug}/visas`} className="px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm font-semibold text-google-blue hover:border-blue-300 hover:underline">
                                Student Visa Guides →
                            </Link>
                            <Link href={`/study-abroad/study-in/${countrySlug}/scholarships`} className="px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm font-semibold text-google-blue hover:border-blue-300 hover:underline">
                                Country Scholarships List →
                            </Link>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}
