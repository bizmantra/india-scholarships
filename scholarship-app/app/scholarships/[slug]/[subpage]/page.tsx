import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAllScholarships, getScholarshipBySlug, getRelatedScholarships, getCleanSteps } from '@/lib/db';
import { formatDeadlineDate } from '@/lib/utils';
import {
    Calendar,
    MapPin,
    Users,
    IndianRupee,
    Globe,
    CheckCircle2,
    ExternalLink,
    ChevronRight,
    Info,
    ShieldCheck,
    Clock,
    Award,
    RefreshCcw,
    ArrowLeft,
    CheckCircle
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const SUBPAGE_METRICS: Record<string, { label: string, icon: any }> = {
    'eligibility': { label: 'Eligibility Criteria', icon: CheckCircle2 },
    'income-limit': { label: 'Income Limit', icon: IndianRupee },
    'documents-required': { label: 'Documents Required', icon: ShieldCheck },
    'last-date': { label: 'Last Date & Deadlines', icon: Calendar },
    'selection-process': { label: 'Selection Process', icon: Award },
    'apply-online': { label: 'Apply Online', icon: Globe },
    'renewal-process': { label: 'Renewal Process', icon: RefreshCcw }
};

// Generate static params dynamically for all scholarships
export async function generateStaticParams() {
    const scholarships = await getAllScholarships();
    const subpages = Object.keys(SUBPAGE_METRICS);

    const params: Array<{ slug: string, subpage: string }> = [];
    for (const s of scholarships) {
        for (const subpage of subpages) {
            params.push({ slug: s.slug, subpage });
        }
    }
    return params;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string, subpage: string }> }): Promise<Metadata> {
    const { slug, subpage } = await params;
    const scholarship = await getScholarshipBySlug(slug);

    if (!scholarship || !SUBPAGE_METRICS[subpage]) {
        return {
            title: 'Page Not Found',
        };
    }

    const title = scholarship.title;
    const year = scholarship.verification_year || new Date().getFullYear();
    let seoTitle = '';
    let seoDesc = '';

    switch (subpage) {
        case 'eligibility':
            seoTitle = `${title} Eligibility Criteria ${year}: Do You Qualify?`;
            seoDesc = `Detailed eligibility criteria for ${title} ${year} including minimum marks, qualifying levels, category/caste limits, gender rules, and domicile requirements.`;
            break;
        case 'income-limit':
            seoTitle = `${title} Income Limit ${year}: Family Income Rules`;
            seoDesc = `Find the maximum annual family income limit to qualify for ${title} ${year}. Includes required income certificates and validation rules.`;
            break;
        case 'documents-required':
            seoTitle = `${title} Documents Required ${year}: Full Application Checklist`;
            seoDesc = `Complete list of documents required to apply for ${title} ${year}. Seed your Aadhaar, prepare marksheets, certificates, and check format sizes.`;
            break;
        case 'last-date':
            seoTitle = `${title} Last Date ${year}: Application Deadline & Timelines`;
            seoDesc = `Check the official last date to apply online for ${title} ${year}. Includes timeline extensions, portal opening dates, and status check windows.`;
            break;
        case 'selection-process':
            seoTitle = `${title} Selection Process ${year}: How Winners are Selected`;
            seoDesc = `Learn how students are selected and ranked for ${title} ${year}. Details on merit lists, income priority rules, and verification stages.`;
            break;
        case 'apply-online':
            seoTitle = `${title} Apply Online ${year}: Step-by-Step Registration Guide`;
            seoDesc = `Official portal link and registration guide to apply online for ${title} ${year}. Track your application status and check login details.`;
            break;
        case 'renewal-process':
            seoTitle = `${title} Renewal Process ${year}: Continuity Rules & Guidelines`;
            seoDesc = `Renewal rules for ${title} ${year}. Maintain your scholarship with minimum attendance, pass marks, and learn how to re-apply online.`;
            break;
    }

    return {
        title: seoTitle,
        description: seoDesc,
    };
}

export default async function ScholarshipSubpage({ params }: { params: Promise<{ slug: string, subpage: string }> }) {
    const { slug, subpage } = await params;
    const scholarship = await getScholarshipBySlug(slug);

    if (!scholarship || !SUBPAGE_METRICS[subpage]) {
        notFound();
    }

    const metric = SUBPAGE_METRICS[subpage];
    const PageIcon = metric.icon;
    const relatedScholarships = await getRelatedScholarships(scholarship.id, 3);
    const year = scholarship.verification_year || new Date().getFullYear();

    const ContentVerificationFallback = () => (
        <div className="p-8 bg-gray-50 border border-gray-150 rounded-3xl text-center">
            <Info className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h4 className="font-bold text-gray-900 mb-2">Content Verification in Progress</h4>
            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                The official guidelines, required documents, or step-by-step procedures for this scholarship cycle are currently being audited and verified by our editorial team.
            </p>
            <div className="flex justify-center gap-4">
                <Link href={`/scholarships/${scholarship.slug}`} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    Back to Overview
                </Link>
                {scholarship.official_source && (
                    <a href={scholarship.official_source} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
                        Visit Official Portal
                    </a>
                )}
            </div>
        </div>
    );

    // Helper to format text lists
    const FormattedText = ({ text }: { text: string | null }) => {
        if (!text) return <p className="text-gray-400 italic">Not specified</p>;
        
        let items: string[] = [];
        let isNumbered = false;

        if (/Step \d+:/i.test(text) || /\b\d+\.\s+/.test(text)) {
            items = getCleanSteps(text);
            isNumbered = true;
        } else {
            items = text
                .split(/\.\s+(?=[A-Z])|(?=[A-Z][A-Za-z\s]+:)|(?=\(\w\))|(?=•)|(?=–)|;/)
                .map(s => s.trim())
                .filter(s => s.length > 0);
        }

        if (items.length <= 1) {
            return <p className="text-gray-700 leading-relaxed">{text}</p>;
        }

        return (
            <ul className="space-y-3 list-none">
                {items.map((item, i) => (
                    <li key={i} className="text-gray-700 leading-relaxed flex items-start gap-3">
                        {isNumbered ? (
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                {i + 1}
                            </span>
                        ) : (
                            <div className="mt-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                        )}
                        <p className="flex-1">{item}</p>
                    </li>
                ))}
            </ul>
        );
    };

    // Format list of documents
    const formatDocs = (docs: any) => {
        if (!docs) return <p className="text-gray-400 italic">Not specified</p>;
        
        let docsArray: string[] = [];
        if (Array.isArray(docs)) {
            docsArray = docs;
        } else if (typeof docs === 'string') {
            try {
                const parsed = JSON.parse(docs);
                if (Array.isArray(parsed)) {
                    docsArray = parsed;
                } else {
                    docsArray = [docs];
                }
            } catch (e) {
                docsArray = docs.split('\n').map((s: string) => s.trim()).filter(Boolean);
            }
        }

        if (docsArray.length > 0) {
            return (
                <ul className="space-y-3">
                    {docsArray.map((doc: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-3 text-gray-700">
                            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span>{doc}</span>
                        </li>
                    ))}
                </ul>
            );
        }

        return <p className="text-gray-400 italic">Not specified</p>;
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-100">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href="/scholarships" className="hover:text-blue-700 transition-colors">Scholarships</Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href={`/scholarships/${scholarship.slug}`} className="hover:text-blue-700 transition-colors max-w-xs truncate">{scholarship.title}</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-gray-900 font-medium truncate">{metric.label}</span>
                </nav>
            </div>

            {/* JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebPage',
                        name: `${scholarship.title} ${metric.label} ${year}`,
                        description: `${metric.label} information for ${scholarship.title}.`,
                        breadcrumb: {
                            '@type': 'BreadcrumbList',
                            itemListElement: [
                                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.indiascholarships.in' },
                                { '@type': 'ListItem', position: 2, name: 'Scholarships', item: 'https://www.indiascholarships.in/scholarships' },
                                { '@type': 'ListItem', position: 3, name: scholarship.title, item: `https://www.indiascholarships.in/scholarships/${scholarship.slug}` },
                                { '@type': 'ListItem', position: 4, name: metric.label }
                            ]
                        }
                    })
                }}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Back to Parent Banner */}
                <div className="mb-8">
                    <Link href={`/scholarships/${scholarship.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Full {scholarship.title} Overview
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2">
                        {/* Title Header */}
                        <div className="mb-10 border-b border-gray-100 pb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                    {scholarship.provider_type} Scheme
                                </span>
                                <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                                    <ShieldCheck className="h-4 w-4" />
                                    Verified for {year}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-[1.2] flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-700 rounded-2xl flex-shrink-0">
                                    <PageIcon className="h-6 w-6 md:h-8 md:w-8" />
                                </div>
                                {scholarship.title} {metric.label} {year}
                            </h1>
                        </div>
                        {/* Specific Subpage Content Blocks */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-10 shadow-sm mb-12">
                            {subpage === 'eligibility' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                            <span className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Qualifying Mark/Percent</span>
                                            <span className="text-gray-900 font-bold text-lg">{scholarship.min_marks > 0 ? `${scholarship.min_marks}% marks in previous class` : 'Passing marks only'}</span>
                                        </div>
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                            <span className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Target Education Levels</span>
                                            <span className="text-gray-900 font-bold text-lg">{scholarship.level || 'All education levels'}</span>
                                        </div>
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                            <span className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Eligible Caste/Categories</span>
                                            <span className="text-gray-900 font-bold text-lg">
                                                {scholarship.caste.join(', ') || 'All categories (General/OBC/SC/ST)'}
                                            </span>
                                        </div>
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                            <span className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Gender Limit</span>
                                            <span className="text-gray-900 font-bold text-lg">{scholarship.gender || 'Open to all (Boys and Girls)'}</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-6">
                                        <h3 className="font-bold text-gray-900 mb-3 text-lg">Residency/Domicile Requirements</h3>
                                        <p className="text-gray-700 leading-relaxed mb-4">{scholarship.residency_requirement || `Must be a permanent resident of ${scholarship.state || 'India'}.`}</p>
                                    </div>
                                    {scholarship.special_conditions && (
                                        <div className="border-t border-gray-100 pt-6">
                                            <h3 className="font-bold text-gray-900 mb-3 text-lg font-bold">Special Conditions</h3>
                                            <p className="text-gray-700 leading-relaxed">{scholarship.special_conditions}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {subpage === 'income-limit' && (
                                <div className="space-y-6">
                                    <div className="p-6 bg-red-50/40 rounded-2xl border border-red-100/50 flex gap-4 items-start">
                                        <div className="p-2 bg-red-100 rounded-xl text-red-700 mt-1">
                                            <Info className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-red-950 text-lg mb-1">Maximum Annual Family Income</h3>
                                            <p className="text-2xl font-black text-red-800 tracking-tight">{scholarship.income_limit ? `₹${scholarship.income_limit.toLocaleString('en-IN')} per annum` : 'No Income Bar / Not specified'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <h3 className="font-bold text-gray-900 mb-3 text-lg">Income Verification Rules</h3>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            Applicants must submit a valid annual income certificate issued by a competent revenue officer (such as a Tahsildar, Revenue Inspector, or Sub-Divisional Magistrate).
                                        </p>
                                        <ul className="space-y-3 text-gray-700">
                                            <li className="flex gap-2 items-start">
                                                <div className="mt-2 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                                                <span>The certificate must be in the name of the parent/legal guardian.</span>
                                            </li>
                                            <li className="flex gap-2 items-start">
                                                <div className="mt-2 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                                                <span>Income certificates issued by private employers or self-declarations on plain paper are not accepted.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {subpage === 'documents-required' && (
                                <div className="space-y-6">
                                    <h3 className="font-bold text-gray-900 text-xl mb-4">Required Documents Checklist</h3>
                                    {!scholarship.docs_needed || (Array.isArray(scholarship.docs_needed) && scholarship.docs_needed.length === 0) || (typeof scholarship.docs_needed === 'string' && scholarship.docs_needed.trim() === '') ? (
                                        <ContentVerificationFallback />
                                    ) : (
                                        <>
                                            {formatDocs(scholarship.docs_needed)}
                                            <div className="mt-8 p-5 bg-blue-50/40 border border-blue-100 rounded-2xl">
                                                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                                    <ShieldCheck className="h-5 w-5 text-blue-700" />
                                                    DBT Bank Seeding Warning
                                                </h4>
                                                <p className="text-sm text-blue-950 leading-relaxed">
                                                    Your primary bank account must be active, seeded with your Aadhaar card, and mapped on the NPCI mapper. The government disbursements are made exclusively via Direct Benefit Transfer (DBT).
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {subpage === 'last-date' && (
                                <div className="space-y-6">
                                    <div className="p-6 bg-amber-50/40 rounded-2xl border border-amber-100 flex gap-4 items-start mb-6">
                                        <div className="p-2 bg-amber-100 rounded-xl text-amber-700 mt-1">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-amber-950 text-lg mb-1">Application Deadline</h3>
                                            <p className="text-2xl font-black text-amber-800 tracking-tight">
                                                {scholarship.always_open === 1 ? 'Open Year-Round (Continuous Enrollment)' : formatDeadlineDate(scholarship.deadline, { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                            {scholarship.deadline_description && (
                                                <p className="text-sm text-amber-900 mt-1">{scholarship.deadline_description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3 text-lg">Timeline Details & Extensions</h3>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            Applications must be submitted and finalized before 11:59 PM on the closing date. We advise students to submit applications at least a week in advance to avoid last-minute server bottlenecks.
                                        </p>
                                        <ul className="space-y-3 text-gray-700">
                                            <li className="flex gap-2 items-start">
                                                <div className="mt-2 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                                                <span>Institute-level verification continues for 15-30 days after the student application deadline.</span>
                                            </li>
                                            <li className="flex gap-2 items-start">
                                                <div className="mt-2 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                                                <span>Incomplete or unfinalized drafts are auto-rejected on the last date.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {subpage === 'selection-process' && (
                                <div className="space-y-6">
                                    <h3 className="font-bold text-gray-900 text-xl mb-4">How Candidates are Selected</h3>
                                    {!scholarship.selection || scholarship.selection.trim() === '' || scholarship.selection.toLowerCase().includes('sanctioning depends on') ? (
                                        <ContentVerificationFallback />
                                    ) : (
                                        <>
                                            <p className="text-gray-700 leading-relaxed mb-6">{scholarship.selection}</p>
                                            <div className="border-t border-gray-100 pt-6">
                                                <h4 className="font-bold text-gray-900 mb-4">Verification Flow</h4>
                                                <div className="space-y-4">
                                                    <div className="flex gap-4 items-start">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                                                        <div>
                                                            <h5 className="font-bold text-gray-900">Institute Nodal Officer Verification</h5>
                                                            <p className="text-sm text-gray-600">Your college/school checks your bonafide status, fees paid, and marks cards against the database.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 items-start">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                                                        <div>
                                                            <h5 className="font-bold text-gray-900">District Welfare Officer / State Board Sanction</h5>
                                                            <p className="text-sm text-gray-600">The state/central department approves the budget release for verified records based on category quotas.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 items-start">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                                                        <div>
                                                            <h5 className="font-bold text-gray-900">Fund Disbursement via DBT</h5>
                                                            <p className="text-sm text-gray-600">The bank issues direct fund credits to Aadhaar-seeded accounts using treasury payment systems.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {subpage === 'apply-online' && (
                                <div className="space-y-6">
                                    <h3 className="font-bold text-gray-900 text-xl mb-4">How to Apply Online (Step-by-Step)</h3>
                                    {!scholarship.step_guide || scholarship.step_guide.trim() === '' ? (
                                        <ContentVerificationFallback />
                                    ) : (
                                        <>
                                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-6">
                                                <span className="block text-[10px] text-emerald-800 font-bold uppercase tracking-wider mb-1">Application Mode</span>
                                                <span className="text-emerald-950 font-black text-lg uppercase">{scholarship.application_mode || 'Online'}</span>
                                            </div>
                                            
                                            <div className="mb-8">
                                                <FormattedText text={scholarship.step_guide} />
                                            </div>

                                            {scholarship.apply_url && (
                                                <div className="pt-4 flex flex-wrap gap-4">
                                                    <a href={scholarship.apply_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-sm hover:shadow transition-all">
                                                        Go to Official Portal
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                    <a href={scholarship.official_source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors">
                                                        View Official Guidelines
                                                    </a>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {subpage === 'renewal-process' && (
                                <div className="space-y-6">
                                    <h3 className="font-bold text-gray-900 text-xl mb-4">Renewal Guidelines & Conditions</h3>
                                    {!scholarship.renewal || scholarship.renewal.trim() === '' || scholarship.renewal.toLowerCase().includes('please refer to') ? (
                                        <ContentVerificationFallback />
                                    ) : (
                                        <>
                                            <p className="text-gray-700 leading-relaxed mb-6">{scholarship.renewal}</p>
                                            
                                            <div className="p-5 bg-amber-50/40 border border-amber-100 rounded-2xl">
                                                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                                                    <Info className="h-5 w-5" />
                                                    Key Renewal Prerequisites
                                                </h4>
                                                <ul className="space-y-2 text-sm text-amber-950 leading-relaxed list-disc pl-5">
                                                    <li>Must pass the previous annual/semester examination in the first attempt.</li>
                                                    <li>No active backlogs or ATKT are permitted in most professional programs.</li>
                                                    <li>Must maintain regular class attendance (typically 75% or higher) validated by the college.</li>
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* FAQs Section */}
                        {scholarship.faq_json && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                    FAQs for {scholarship.title}
                                </h2>
                                <div className="space-y-4">
                                    {(() => {
                                        try {
                                            let faqs = scholarship.faq_json;
                                            if (typeof faqs === 'string') {
                                                try { faqs = JSON.parse(faqs); } catch (e) { }
                                            }
                                            if (!faqs || (Array.isArray(faqs) && faqs.length === 0)) return null;

                                            return Array.isArray(faqs) ? faqs.map((faq: any, i: number) => (
                                                <div key={i} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                                    <h3 className="font-bold text-gray-900 mb-2 text-md flex gap-2">
                                                        <span className="text-blue-600">Q.</span>
                                                        {faq.question || faq.q}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm pl-6">{faq.answer || faq.a}</p>
                                                </div>
                                            )) : null;
                                        } catch (e) { return null; }
                                    })()}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Sidebar Navigation & Related */}
                    <div className="space-y-8">
                        {/* Quick Links Sidebar */}
                        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 md:p-8">
                            <h3 className="font-extrabold text-gray-900 text-lg mb-6 tracking-tight uppercase text-xs text-gray-400">Supporting Guides</h3>
                            <nav className="space-y-2">
                                {Object.entries(SUBPAGE_METRICS).map(([key, value]) => {
                                    const isActive = key === subpage;
                                    return (
                                        <Link 
                                            key={key} 
                                            href={`/scholarships/${scholarship.slug}/${key}`}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                                isActive 
                                                    ? 'bg-blue-600 text-white shadow-sm' 
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
                                            }`}
                                        >
                                            <span>{value.label}</span>
                                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Helpline Support card */}
                        <div className="bg-blue-50/40 border border-blue-100 rounded-3xl p-6 md:p-8">
                            <h3 className="font-bold text-blue-900 text-md mb-4 uppercase tracking-wider text-xs">Official Support</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                                        <Globe className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Website</span>
                                        <a href={scholarship.official_source} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold text-sm truncate block hover:underline">
                                            Official Portal
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Helpline</span>
                                        <span className="text-gray-900 font-bold text-sm">{scholarship.helpline || 'Refer Official Site'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Related Opportunities */}
                        {relatedScholarships && relatedScholarships.length > 0 && (
                            <div className="border border-gray-100 rounded-3xl p-6 md:p-8 bg-white shadow-sm">
                                <h3 className="font-extrabold text-gray-900 text-lg mb-6 tracking-tight uppercase text-xs text-gray-400">Related Schemes</h3>
                                <div className="space-y-4">
                                    {relatedScholarships.map((related: any) => (
                                        <div key={related.id} className="group">
                                            <Link href={`/scholarships/${related.slug}`} className="block">
                                                <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 text-sm leading-snug mb-1">
                                                    {related.title}
                                                </h4>
                                                <span className="text-xs text-gray-400">{related.provider_type} Scholarship</span>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
