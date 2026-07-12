import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByLevelAndCountry } from '@/lib/db';
import ScholarshipsList from '@/app/components/ScholarshipsList';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// List of supported countries and levels for static generation
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

const LEVELS = [
    { slug: 'phd', label: 'PhD / Doctoral' },
    { slug: 'mba', label: 'MBA' },
    { slug: 'masters', label: 'Masters / PG' },
    { slug: 'undergraduate', label: 'Undergraduate / Bachelors' }
];

export async function generateStaticParams() {
    const params: { category: string; country: string }[] = [];
    for (const lvl of LEVELS) {
        for (const cnt of COUNTRIES) {
            params.push({ category: lvl.slug, country: cnt.slug });
        }
    }
    return params;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; country: string }> }) {
    const { category: categorySlug, country: countrySlug } = await params;
    const level = LEVELS.find(l => l.slug === categorySlug)?.label || categorySlug.toUpperCase();
    const country = COUNTRIES.find(c => c.slug === countrySlug)?.label || countrySlug.toUpperCase();
    
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    // Append 'for Indian Students' if the destination is outside India
    const audienceModifier = countrySlug !== 'india' ? ' for Indian Students' : '';

    return {
        title: `Best ${level} Scholarships in ${country}${audienceModifier} ${currentYear} - ${nextYear} (Fully Funded)`,
        description: `Find top verified ${level} scholarships to study in ${country}. Get direct application links, eligibility requirements, stipend amounts, and step-by-step application instructions.`,
    };
}

export default async function LevelCountryHubPage({ params }: { params: Promise<{ category: string; country: string }> }) {
    const { category: categorySlug, country: countrySlug } = await params;

    const lvlObj = LEVELS.find(l => l.slug === categorySlug);
    const cntObj = COUNTRIES.find(c => c.slug === countrySlug);

    if (!lvlObj || !cntObj) {
        return notFound();
    }

    const levelName = lvlObj.label;
    const countryName = cntObj.label;

    const scholarships = await getScholarshipsByLevelAndCountry(categorySlug, countrySlug);
    
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
                    <Link href="/scholarships-by-education" className="hover:text-blue-700">Levels</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{levelName} in {countryName}</span>
                </nav>

                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        {levelName} Scholarships in {countryName}{countrySlug !== 'india' ? ' for Indian Students' : ''} {currentYear} - {nextYear}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                        Explore fully funded and merit-based global scholarships for <span className="font-semibold text-blue-700">{levelName}</span> programs in <span className="font-semibold text-blue-700">{countryName}</span>. Find application guides, deadlines, and portals.
                    </p>
                </div>

                {/* Scholarships List or Fallback */}
                {scholarships.length > 0 ? (
                    <div className="mb-20">
                        <ScholarshipsList scholarships={scholarships} showCategoryFilters={false} />
                    </div>
                ) : (
                    <div className="mb-20 bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto shadow-sm">
                        <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Verification in Progress</h2>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            Our global research team is currently indexing and verifying active 2026/2027 university and government scholarships for <strong className="text-gray-900">{levelName}</strong> students in <strong className="text-gray-900">{countryName}</strong>. 
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                            Updating Live Deadlines
                        </div>
                    </div>
                )}

                {/* Explore Grid */}
                <div className="mt-16 pt-10 border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Other Study Abroad Destinations</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {COUNTRIES.filter(c => c.slug !== countrySlug).slice(0, 4).map(c => (
                            <Link 
                                key={c.slug}
                                href={`/scholarships-for/${levelSlug}/in/${c.slug}`} 
                                className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all font-medium text-blue-700 text-center shadow-sm hover:shadow-md"
                            >
                                <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">{lvlObj.slug.toUpperCase()}</span>
                                <span className="text-sm font-bold text-gray-900">{c.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
