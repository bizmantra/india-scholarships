import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByLevelAndCountry } from '@/lib/db';
import { MIN_INDEXABLE_HUB_RESULTS } from '@/lib/utils';
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

// Only combinations that have at least one scholarship are pre-built; the rest are real 404s.
export async function generateStaticParams() {
    const params: { category: string; country: string }[] = [];
    for (const lvl of LEVELS) {
        for (const cnt of COUNTRIES) {
            const found = await getScholarshipsByLevelAndCountry(lvl.slug, cnt.slug);
            if (found.length > 0) params.push({ category: lvl.slug, country: cnt.slug });
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

    // Hubs with only 1-2 scholarships are too thin to index; users can still reach them.
    const resultCount = (await getScholarshipsByLevelAndCountry(categorySlug, countrySlug)).length;

    return {
        title: `Best ${level} Scholarships in ${country}${audienceModifier} ${currentYear} - ${nextYear} (Fully Funded)`,
        description: `Find top verified ${level} scholarships to study in ${country}. Get direct application links, eligibility requirements, stipend amounts, and step-by-step application instructions.`,
        alternates: {
            canonical: `https://www.indiascholarships.in/scholarships-for/${categorySlug}/in/${countrySlug}`,
        },
        ...(resultCount < MIN_INDEXABLE_HUB_RESULTS ? { robots: { index: false, follow: true } } : {}),
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

    // An empty hub is a real 404, not a 200 "coming soon" page (Google treats those as soft 404s).
    if (scholarships.length === 0) {
        return notFound();
    }

    // Only link to sibling countries that actually have scholarships at this level.
    const siblingCounts = await Promise.all(
        COUNTRIES.filter(c => c.slug !== countrySlug).map(async c => ({
            ...c,
            count: (await getScholarshipsByLevelAndCountry(categorySlug, c.slug)).length,
        }))
    );
    const siblingCountries = siblingCounts.filter(c => c.count > 0).slice(0, 4);

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
                    <Link href="/scholarships-by-education" className="hover:text-google-blue">Levels</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{levelName} in {countryName}</span>
                </nav>

                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        {levelName} Scholarships in {countryName}{countrySlug !== 'india' ? ' for Indian Students' : ''} {currentYear} - {nextYear}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                        Explore fully funded and merit-based global scholarships for <span className="font-semibold text-gray-900">{levelName}</span> programs in <span className="font-semibold text-gray-900">{countryName}</span>. Find application guides, deadlines, and portals.
                    </p>
                </div>

                <div className="mb-20">
                    <ScholarshipsList scholarships={scholarships} showCategoryFilters={false} includeInternational />
                </div>

                {/* Explore Grid */}
                {siblingCountries.length > 0 && (
                <div className="mt-16 pt-10 border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Other Study Abroad Destinations</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {siblingCountries.map(c => (
                            <Link 
                                key={c.slug}
                                href={`/scholarships-for/${categorySlug}/in/${c.slug}`} 
                                className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all font-medium text-google-blue text-center shadow-sm hover:shadow-md"
                            >
                                <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">{lvlObj.slug.toUpperCase()}</span>
                                <span className="text-sm font-bold text-gray-900">{c.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
