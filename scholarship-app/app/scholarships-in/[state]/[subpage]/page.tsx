import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getScholarshipsByState, getAllStates } from '@/lib/db';
import { slugify, formatDeadlineDate } from '@/lib/utils';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { 
    Calendar, 
    IndianRupee, 
    Globe, 
    CheckCircle2, 
    Info, 
    ShieldCheck, 
    Award, 
    RefreshCcw,
    ArrowLeft,
    CheckCircle
} from 'lucide-react';

const SUBPAGE_METRICS: Record<string, { label: string, icon: any, description: string }> = {
    'eligibility': { 
        label: 'Eligibility Criteria', 
        icon: CheckCircle2,
        description: 'Detailed qualifying requirements, minimum academic percentages, domicile rules, and community category restrictions.'
    },
    'income-limit': { 
        label: 'Income Limit Rules', 
        icon: IndianRupee,
        description: 'Maximum annual family income caps and necessary certification requirements for scholarship approval.'
    },
    'documents-required': { 
        label: 'Documents Required', 
        icon: ShieldCheck,
        description: 'Checklist of certificates, marksheets, identification cards, and verification files needed for a successful application.'
    },
    'last-date': { 
        label: 'Last Dates & Deadlines', 
        icon: Calendar,
        description: 'Official schedule timelines, last date extensions, online portal status windows, and scheme dates.'
    },
    'selection-process': { 
        label: 'Selection Process', 
        icon: Award,
        description: 'How scholars are selected, merit-cum-means selection weights, ranking parameters, and list verifications.'
    },
    'apply-online': { 
        label: 'Apply Online step-guide', 
        icon: Globe,
        description: 'Step-by-step registration guidelines, official portal web link redirection, and application status checks.'
    },
    'renewal-process': { 
        label: 'Renewal Process', 
        icon: RefreshCcw,
        description: 'Requirements to maintain continuous eligibility, academic minimum pass marks, and renewal application guides.'
    }
};

function getStateAbbreviation(stateSlug: string, stateName: string): string {
    const mapping: Record<string, string> = {
        'uttar-pradesh': 'UP',
        'west-bengal': 'WB',
        'karnataka': 'SSP Karnataka',
        'maharashtra': 'MahaDBT',
        'andhra-pradesh': 'AP',
        'tamil-nadu': 'TN',
        'madhya-pradesh': 'MP',
        'delhi': 'Delhi',
        'bihar': 'Bihar',
        'odisha': 'Odisha',
        'rajasthan': 'Rajasthan'
    };
    return mapping[stateSlug] || stateName;
}

// Generate static params
export async function generateStaticParams() {
    const states = await getAllStates();
    const subpages = Object.keys(SUBPAGE_METRICS);

    const params: Array<{ state: string, subpage: string }> = [];
    for (const state of states) {
        const stateSlug = slugify(state);
        for (const subpage of subpages) {
            params.push({ state: stateSlug, subpage });
        }
    }
    return params;
}

// Generate Metadata
export async function generateMetadata({ params }: { params: Promise<{ state: string, subpage: string }> }): Promise<Metadata> {
    try {
        const { state: stateSlug, subpage } = await params;
        const states = await getAllStates();
        const originalState = states.find((s: string) => slugify(s) === stateSlug) || stateSlug;
        const abbrev = getStateAbbreviation(stateSlug, originalState);
        const year = new Date().getFullYear();

        if (!SUBPAGE_METRICS[subpage]) {
            return { title: 'Page Not Found' };
        }

        let seoTitle = '';
        let seoDesc = '';

        switch (subpage) {
            case 'eligibility':
                seoTitle = `${abbrev} Scholarship Eligibility Criteria ${year}: Do You Qualify?`;
                seoDesc = `Detailed eligibility criteria for ${originalState} state scholarships in ${year} including income limits, marks, and categories.`;
                break;
            case 'income-limit':
                seoTitle = `${abbrev} Scholarship Income Limit ${year}: Family Income Caps`;
                seoDesc = `Maximum family income limits and document requirements for ${originalState} state scholarships in ${year}.`;
                break;
            case 'documents-required':
                seoTitle = `${abbrev} Scholarship Documents Required ${year}: Full Checklist`;
                seoDesc = `Complete checklist of documents, income certificates, marksheets, and domicile papers required for ${originalState} schemes.`;
                break;
            case 'last-date':
                seoTitle = `${abbrev} Scholarship Last Date ${year}: Application Deadlines`;
                seoDesc = `Check the official application deadline and last date extensions to apply online for ${originalState} scholarships in ${year}.`;
                break;
            case 'selection-process':
                seoTitle = `${abbrev} Scholarship Selection Process ${year}: How Winners are Selected`;
                seoDesc = `Detailed selection guidelines, merit scoring systems, and ranking weights for ${originalState} state programs.`;
                break;
            case 'apply-online':
                seoTitle = `${abbrev} Scholarship Apply Online ${year}: Registration Portal Guide`;
                seoDesc = `Step-by-step registration flow, login details, and official direct application portals for ${originalState} scholarships.`;
                break;
            case 'renewal-process':
                seoTitle = `${abbrev} Scholarship Renewal Process ${year}: Continuity Rules`;
                seoDesc = `Find renewal requirements, CGPA criteria, and continuous enrollment policies for ${originalState} state schemes.`;
                break;
        }

        return {
            title: seoTitle,
            description: seoDesc,
            alternates: {
                canonical: `https://www.indiascholarships.in/scholarships-in/${stateSlug}/${subpage}`,
            }
        };

    } catch (error) {
        return { title: 'Scholarships Hub - Not Found' };
    }
}

export default async function StateHubSubpage({ params }: { params: Promise<{ state: string, subpage: string }> }) {
    const { state: stateSlug, subpage } = await params;
    
    if (!stateSlug || !SUBPAGE_METRICS[subpage]) {
        return notFound();
    }

    const states = await getAllStates();
    const stateName = states.find((s: string) => slugify(s) === stateSlug);

    if (!stateName) {
        return redirect('/state-scholarships');
    }

    const scholarships = await getScholarshipsByState(stateName);

    if (scholarships.length === 0) {
        return redirect('/state-scholarships');
    }

    const metric = SUBPAGE_METRICS[subpage];
    const PageIcon = metric.icon;
    const year = new Date().getFullYear();
    const abbrev = getStateAbbreviation(stateSlug, stateName);

    // Filter out blank details to present high-quality content summaries
    const displayInfoList = scholarships.map((s: any) => {
        let value = '';
        switch (subpage) {
            case 'eligibility':
                value = s.eligibility || 'Refer to scheme guidelines';
                break;
            case 'income-limit':
                value = s.income_limit ? `Max annual family income limit: ₹${s.income_limit.toLocaleString()}` : 'No income bar or criteria specified';
                break;
            case 'documents-required':
                if (s.docs_needed && Array.isArray(s.docs_needed) && s.docs_needed.length > 0) {
                    value = s.docs_needed.join(', ');
                } else {
                    value = 'Standard documents (Aadhaar, Marksheets, Caste & Domicile certificate)';
                }
                break;
            case 'last-date':
                value = s.deadline ? `Deadline: ${formatDeadlineDate(s.deadline)}` : 'Check Portal / Open Now';
                break;
            case 'selection-process':
                value = s.selection || 'Based on academic merit and family income criteria';
                break;
            case 'apply-online':
                value = s.step_guide || 'Register online via the state scholarship portal or NSP';
                break;
            case 'renewal-process':
                value = s.renewal || 'Required to maintain pass marks and min attendance of 75%';
                break;
        }
        return {
            id: s.id,
            title: s.title,
            slug: s.slug,
            amount: s.amount_annual ? `₹${s.amount_annual.toLocaleString()}` : 'Amount Varies',
            deadline: formatDeadlineDate(s.deadline),
            value: value,
            officialSource: s.official_source
        };
    });

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <Link href="/state-scholarships" className="hover:text-blue-700">States</Link>
                    <span>/</span>
                    <Link href={`/scholarships-in/${stateSlug}`} className="hover:text-blue-700">{stateName}</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{metric.label}</span>
                </nav>

                {/* Subpage Hero Section */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-12 text-white mb-12 shadow-xl border border-indigo-900/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <PageIcon className="h-40 w-40 text-white" />
                    </div>
                    <div className="max-w-3xl relative z-10">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/20 rounded-full border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
                            <PageIcon className="h-4 w-4" />
                            {metric.label} Guide
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
                            {stateName} Scholarships {metric.label} {year}
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100/90 leading-relaxed font-light">
                            {metric.description} Find parameters, rules, and structures for all {scholarships.length} active programs in {stateName}.
                        </p>
                    </div>
                </div>

                {/* Main Comparison Section */}
                <div className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                        <CheckCircle className="text-emerald-600 h-7 w-7 flex-shrink-0" />
                        Program Comparison - {metric.label}
                    </h2>

                    <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="p-5 pl-8">Scholarship Name</th>
                                        <th className="p-5">{metric.label} Info</th>
                                        <th className="p-5">Annual Amount</th>
                                        <th className="p-5 pr-8">Deadline</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {displayInfoList.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-5 pl-8 font-semibold text-gray-900 max-w-xs">
                                                <Link href={`/scholarships/${item.slug}`} className="hover:text-blue-700 transition-colors">
                                                    {item.title}
                                                </Link>
                                            </td>
                                            <td className="p-5 max-w-md leading-relaxed text-gray-600">
                                                {item.value}
                                            </td>
                                            <td className="p-5 font-bold text-gray-900 whitespace-nowrap">
                                                {item.amount}
                                            </td>
                                            <td className="p-5 pr-8 text-gray-500 whitespace-nowrap">
                                                {item.deadline}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Subpage Specific FAQs */}
                <div className="bg-gray-50 rounded-[2.5rem] p-8 md:p-12 mb-16 border border-gray-100 shadow-inner">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
                        FAQs on {abbrev} Scholarship {metric.label}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">
                                Where can I find the official {metric.label} document for {stateName} scholarships?
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Official updates are released on the state portal. You can view direct links to these sources by clicking the individual scholarships listed above.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">
                                Are the details listed here verified for the {year} academic year?
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Yes, our editorial team audits all records in accordance with the latest government notifications. Always check the last verified dates on each scheme page.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">
                                Does this eligibility / criteria apply to all categories?
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Rules vary between OBC, SC, ST, EWS, and General categories. Please click into specific scholarship detail pages to see caste-wise or class-wise breakups.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">
                                What if the portal shows different information?
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Government portals are the final authority. We strive to sync updates weekly, but portal data always supersedes static indexes.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action CTA */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8 text-center max-w-3xl mx-auto mb-16">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Want to check all state-wide programs?</h3>
                    <p className="text-sm text-blue-700 mb-6">Explore the full list of scholarships and apply online.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href={`/scholarships-in/${stateSlug}`} className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-md">
                            ← Back to {stateName} Overview
                        </Link>
                        <Link href="/state-scholarships" className="px-6 py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all">
                            View All States
                        </Link>
                    </div>
                </div>

                {/* Dynamic State Subpage Links Navigation Grid */}
                <div className="pt-10 border-t border-gray-150">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Explore other aspects of {stateName} Scholarships</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {Object.entries(SUBPAGE_METRICS)
                            .filter(([key]) => key !== subpage)
                            .map(([key, val]) => {
                                const Icon = val.icon;
                                return (
                                    <Link 
                                        key={key} 
                                        href={`/scholarships-in/${stateSlug}/${key}`} 
                                        className="flex flex-col items-center justify-center p-4 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-blue-50/40 hover:border-blue-100 hover:text-blue-700 text-center transition-all group"
                                    >
                                        <Icon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 mb-2 transition-colors" />
                                        <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-700">{val.label}</span>
                                    </Link>
                                );
                            })}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
