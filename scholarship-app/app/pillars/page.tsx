import Link from 'next/link';
import { Metadata } from 'next';
import { getAllPillars, PillarMetadata } from '@/lib/pillars';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { ChevronRight, BookOpen, Layers } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Scholarship Guides — Complete Pillar Guides by State & Category | IndiaScholarships',
    description: 'In-depth, evergreen guides explaining how India\'s scholarship systems actually work — by state, by category like SC/ST/OBC/Minority, and by course.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/pillars',
    },
};

function PillarCard({ pillar }: { pillar: PillarMetadata }) {
    return (
        <Link
            href={`/pillars/${pillar.slug}`}
            className="group flex flex-col justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all"
        >
            <div>
                <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-indigo-700 transition-colors">
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

export default function PillarsIndexPage() {
    const pillars = getAllPillars();

    // Same classification the pillar page/hub callouts already use internally —
    // grouped here purely for browsing, not a new data model.
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
                    <span className="text-gray-900 font-medium">Scholarship Guides</span>
                </nav>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-12">
                    <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold rounded-full px-3 py-1 uppercase tracking-wider mb-4">
                        <Layers className="w-3 h-3" />
                        Pillar Guides
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Scholarship Guides
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                        Unlike our scholarship listings, these are complete, plain-English explainers — how a state's
                        scholarship system actually works, how a category like SC/ST or OBC is organized nationally,
                        and what to check before you apply. Start here if you're not sure where to begin.
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

                <div className="mt-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <BookOpen className="w-6 h-6 text-gray-400 shrink-0" />
                    <p className="text-sm text-gray-600">
                        Looking for a specific scholarship instead of a guide? Browse{' '}
                        <Link href="/state-scholarships" className="text-google-blue font-semibold hover:underline">all states</Link>
                        {' '}or{' '}
                        <Link href="/scholarships" className="text-google-blue font-semibold hover:underline">search all scholarships</Link>.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
