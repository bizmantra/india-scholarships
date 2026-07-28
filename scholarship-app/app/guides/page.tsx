import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronRight, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { getAllPillars, PillarMetadata } from '@/lib/pillars';
import { getAllArticles } from '@/lib/articles';

export const metadata: Metadata = {
    title: 'Scholarship Guides — Topic Guides, Portal Guides & How-To Articles | IndiaScholarships',
    description: 'Everything explaining how India\'s scholarship systems work — evergreen topic guides by state and category, official portal login/status guides, and step-by-step how-to articles.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/guides',
    },
};

// The 4 Articles that are exact-duplicate coverage of an existing Portal Guide are excluded
// here — they already redirect individually to their matching Portal Guide (next.config.ts),
// so listing them separately would show a card whose link silently goes somewhere else.
const DUPLICATE_ARTICLE_SLUGS = new Set([
    'digital-gujarat-scholarship-portal-guide',
    'karnataka-ssp-postmatric-guide-2026',
    'mp-taas-scholarship-portal-guide',
    'how-to-apply-talliki-vandanam-eligibility-status',
]);

const PORTAL_GUIDES = [
    { title: 'National Scholarship Portal (NSP)', description: 'Aadhaar Face-RD OTR registration, central scheme matching, and institute verification guide.', link: '/guides/nsp', tag: 'Central India' },
    { title: 'e-Kalyan Jharkhand Portal', description: 'Post-Matric student login, application status check, income affidavit format, and PFMS tracking.', link: '/guides/e-kalyan-jharkhand', tag: 'Jharkhand' },
    { title: 'Digital Gujarat & MYSY Portal', description: 'Digital Gujarat citizen registration, MYSY 80 percentile rules, document upload, and status.', link: '/guides/digital-gujarat-mysy', tag: 'Gujarat' },
    { title: 'Aikyashree & WB Portals', description: 'WBMDFC Aikyashree, Oasis SC/ST, and SVMCM merit scholarship status tracking and IFMS Lot numbers.', link: '/guides/aikyashree-west-bengal', tag: 'West Bengal' },
    { title: 'SSP Karnataka Portal', description: 'Kutumba Family ID integration, e-Attestation requirements, and Social Welfare post-matric login.', link: '/guides/ssp-karnataka', tag: 'Karnataka' },
    { title: 'Talliki Vandanam & AP Schemes', description: 'Andhra Pradesh mother account credit status, NWC Secretariat verification, and rules.', link: '/guides/talliki-vandanam-ap', tag: 'Andhra Pradesh' },
    { title: 'MPTAAS & MMVY Portal', description: 'MP Tribal Affairs Profile ID creation, Samagra ID verification, and MMVY merit waiver.', link: '/guides/mptaas-mmvy-mp', tag: 'Madhya Pradesh' },
    { title: 'E-Grantz 3.0 Kerala Portal', description: 'Kerala post-matric educational grant registration, Village Officer income proof, and Akshaya status.', link: '/guides/e-grantz-kerala', tag: 'Kerala' },
];

const UTILITY_GUIDES = [
    { title: 'Application Status Tracking', description: 'What different portal statuses mean and how to track payment via PFMS.', link: '/guides/tracking' },
    { title: 'Document Checklist & Formats', description: 'Every certificate, income affidavit, and marksheet format required before applying.', link: '/guides/documents' },
];

function PillarCard({ pillar }: { pillar: PillarMetadata }) {
    return (
        <Link
            href={`/guides/${pillar.slug}`}
            className="group flex flex-col justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-google-blue hover:shadow-md transition-all"
        >
            <div>
                <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-google-blue transition-colors">
                    {pillar.title}
                </h3>
                {pillar.takeaways[0] && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{pillar.takeaways[0]}</p>
                )}
            </div>
            <div className="flex items-center gap-1 mt-4 text-xs font-bold text-google-blue">
                <span>Read the guide</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
        </Link>
    );
}

function PillarSection({ title, description, pillars }: { title: string; description: string; pillars: PillarMetadata[] }) {
    if (pillars.length === 0) return null;
    return (
        <section className="mb-14">
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">{title}</h2>
            <p className="text-sm text-gray-500 mb-6">{description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pillars.map((p) => <PillarCard key={p.slug} pillar={p} />)}
            </div>
        </section>
    );
}

export default function GuidesIndexPage() {
    const pillars = getAllPillars();
    const articles = getAllArticles().filter((a) => !DUPLICATE_ARTICLE_SLUGS.has(a.slug));

    // Same classification the pillar pages already use internally — grouped here purely
    // for browsing, not a new data model.
    const isTopicGuide = (p: PillarMetadata) =>
        p.clusterCategories.length === 0 && p.clusterStates.length === 0 &&
        p.clusterProviderTypes.length === 0 && p.clusterCourses.length === 0;

    const topicGuides = pillars.filter(isTopicGuide);
    const categoryGuides = pillars.filter((p) => p.clusterCategories.length > 0);
    const courseGuides = pillars.filter((p) => p.clusterCourses.length > 0);
    const providerGuides = pillars.filter((p) => p.clusterProviderTypes.length > 0);
    const stateGuides = pillars
        .filter((p) => p.clusterStates.length > 0)
        .sort((a, b) => a.title.localeCompare(b.title));

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="bg-gray-50 border-b border-gray-100">
                <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-gray-500">
                    <Link href="/" className="hover:text-google-blue transition-colors">Home</Link>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-900 font-medium">Guides</span>
                </nav>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-12">
                    <span className="inline-flex items-center gap-1.5 border border-google-blue text-google-blue text-[10px] font-bold rounded-sm px-2.5 py-0.5 uppercase tracking-wider mb-4">
                        <BookOpen className="w-3 h-3" />
                        Guides
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Scholarship Guides
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                        Everything explaining how India's scholarship systems work in one place — complete topic guides
                        by state and category, official portal login/status guides, and step-by-step how-to articles.
                        Start here if you're not sure where to begin.
                    </p>
                </div>

                <PillarSection
                    title="How Scholarships Work"
                    description="National, topic-level guides — start here if you're new to how Indian scholarships are organized."
                    pillars={topicGuides}
                />
                <PillarSection
                    title="By Category"
                    description="Caste and community-based scholarship systems, explained nationally across states."
                    pillars={categoryGuides}
                />
                <PillarSection
                    title="By Course"
                    description="Course-specific funding — where the money actually comes from for your field of study."
                    pillars={courseGuides}
                />
                <PillarSection
                    title="Corporate & Private Funding"
                    description="Scholarships funded outside government systems — CSR programs, foundations, and trusts."
                    pillars={providerGuides}
                />
                <PillarSection
                    title="By State"
                    description="How each state's own scholarship system is organized — portals, categories, and class stages."
                    pillars={stateGuides}
                />

                {/* Portal Guides — official login/status walkthroughs */}
                <section className="mb-14">
                    <h2 className="text-xl font-extrabold text-gray-900 mb-1">State &amp; Central Portal Guides</h2>
                    <p className="text-sm text-gray-500 mb-6">Step-by-step login, status check, and document guides for the actual government portals.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PORTAL_GUIDES.map((guide) => (
                            <Link
                                key={guide.link}
                                href={guide.link}
                                className="group flex flex-col justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-google-blue hover:shadow-md transition-all"
                            >
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">{guide.tag}</span>
                                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-google-blue transition-colors">
                                        {guide.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{guide.description}</p>
                                </div>
                                <div className="flex items-center gap-1 mt-4 text-xs font-bold text-google-blue">
                                    <span>Read the guide</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </Link>
                        ))}
                        {UTILITY_GUIDES.map((guide) => (
                            <Link
                                key={guide.link}
                                href={guide.link}
                                className="group flex flex-col justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-google-blue hover:shadow-md transition-all"
                            >
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Utility</span>
                                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-google-blue transition-colors">
                                        {guide.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{guide.description}</p>
                                </div>
                                <div className="flex items-center gap-1 mt-4 text-xs font-bold text-google-blue">
                                    <span>Read the guide</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* How-To Articles — task-specific walkthroughs not tied to one portal */}
                <section className="mb-14">
                    <h2 className="text-xl font-extrabold text-gray-900 mb-1">How-To Guides</h2>
                    <p className="text-sm text-gray-500 mb-6">Task-specific walkthroughs — a scheme's application process, eligibility rules, or a common error, explained step by step.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {articles.map((article) => (
                            <Link
                                key={article.slug}
                                href={`/guides/${article.slug}`}
                                className="group flex flex-col justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-google-blue hover:shadow-md transition-all"
                            >
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">{article.readTime}</span>
                                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-google-blue transition-colors">
                                        {article.title}
                                    </h3>
                                    {article.takeaways[0] && (
                                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{article.takeaways[0]}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 mt-4 text-xs font-bold text-google-blue">
                                    <span>Read the guide</span>
                                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Eligibility Matcher Banner */}
                <div className="bg-gradient-to-r from-google-blue to-blue-700 text-white rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <span className="px-3.5 py-1 bg-white/20 text-white text-xs font-black uppercase tracking-wider rounded-full inline-block mb-3 backdrop-blur-sm">
                            Instant Match Engine
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black mb-2">Not sure which portal or scheme fits you?</h2>
                        <p className="text-blue-100 text-sm max-w-xl">
                            Enter your income, category, and state to instantly match 100% eligible central, state, and corporate scholarships.
                        </p>
                    </div>
                    <Link
                        href="/eligibility-checker"
                        className="px-8 py-4 bg-white text-google-blue rounded-full font-bold text-sm hover:bg-blue-50 transition-all shrink-0 shadow-md flex items-center gap-2"
                    >
                        Check Eligibility Now <Sparkles className="h-4 w-4 text-google-blue" />
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
