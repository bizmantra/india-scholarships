import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
    ExternalLink, 
    CheckCircle2, 
    Info, 
    FileText, 
    ShieldCheck, 
    Globe, 
    HelpCircle, 
    PhoneCall, 
    ArrowRight, 
    ChevronRight, 
    Search,
    UserCheck,
    LayoutGrid,
    ListFilter,
    ArrowLeft,
    Award
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { PORTALS_DATA, PortalGuide } from '../page';
import { slugify } from '@/lib/utils';

const PORTAL_SUBPAGES: Record<string, { titleSuffix: string, descPrefix: string, label: string, canonicalSlug: string }> = {
    'status-check': {
        titleSuffix: 'Application & PFMS Status Check 2026: Track Payment',
        descPrefix: 'Learn how to check your scholarship application status and PFMS payment disbursement stage on',
        label: 'Status Check',
        canonicalSlug: 'status-check'
    },
    'student-login': {
        titleSuffix: 'Student Login & Registration Guide 2026: Portal Help',
        descPrefix: 'Step-by-step registration and student portal login guide for',
        label: 'Student Login',
        canonicalSlug: 'student-login'
    },
    'documents-list': {
        titleSuffix: 'Documents Required 2026: Upload Checklist & Formats',
        descPrefix: 'Complete checklist of mandatory certificates, marksheets, and income affidavits required for',
        label: 'Documents List',
        canonicalSlug: 'documents-list'
    },
    'scholarships-list': {
        titleSuffix: 'All Scholarships List 2026: SC, ST, OBC & Merit Grants',
        descPrefix: 'Full directory of active government scholarships hosted on',
        label: 'Top Scholarships',
        canonicalSlug: 'scholarships-list'
    },
    // Alias mapping for backwards compatibility with legacy /schemes links
    'schemes': {
        titleSuffix: 'All Scholarships List 2026: SC, ST, OBC & Merit Grants',
        descPrefix: 'Full directory of active government scholarships hosted on',
        label: 'Top Scholarships',
        canonicalSlug: 'scholarships-list'
    }
};

const PORTAL_NAV_ITEMS = [
    { key: 'overview', label: 'Overview', icon: LayoutGrid, href: '' },
    { key: 'student-login', label: 'Student Login', icon: UserCheck, href: '/student-login' },
    { key: 'status-check', label: 'Status Check', icon: Search, href: '/status-check' },
    { key: 'documents-list', label: 'Documents List', icon: FileText, href: '/documents-list' },
    { key: 'scholarships-list', label: 'Top Scholarships', icon: Award, href: '/scholarships-list' }
];

// Generate static params for all portals x 5 subpages
export async function generateStaticParams() {
    const subpages = Object.keys(PORTAL_SUBPAGES);
    const params: Array<{ portal: string, subpage: string }> = [];

    Object.values(PORTALS_DATA).forEach(p => {
        subpages.forEach(subpage => {
            params.push({ portal: p.id, subpage });
            p.aliases.forEach(alias => {
                params.push({ portal: alias, subpage });
            });
        });
    });

    return params;
}

// Generate dynamic metadata
export async function generateMetadata({ params }: { params: Promise<{ portal: string, subpage: string }> }): Promise<Metadata> {
    const { portal, subpage } = await params;
    const key = portal.toLowerCase();
    
    const data = Object.values(PORTALS_DATA).find(p => p.id === key || p.aliases.includes(key));
    const subConfig = PORTAL_SUBPAGES[subpage];

    if (!data || !subConfig) {
        return {
            title: 'Portal Subpage Not Found | IndiaScholarships',
            alternates: {
                canonical: `https://www.indiascholarships.in/guides/${portal}/${subpage}`,
            }
        };
    }

    const pageTitle = `${data.name} ${subConfig.titleSuffix} | IndiaScholarships`;
    const pageDesc = `${subConfig.descPrefix} ${data.name}. Official portal steps, guidelines, and troubleshooting.`;

    return {
        title: pageTitle,
        description: pageDesc,
        alternates: {
            canonical: `https://www.indiascholarships.in/guides/${data.id}/${subConfig.canonicalSlug}`,
            languages: {
                'x-default': `https://www.indiascholarships.in/guides/${data.id}/${subConfig.canonicalSlug}`,
                'en': `https://www.indiascholarships.in/guides/${data.id}/${subConfig.canonicalSlug}`,
            }
        }
    };
}

export default async function PortalSubpage({ params }: { params: Promise<{ portal: string, subpage: string }> }) {
    const { portal, subpage } = await params;
    const key = portal.toLowerCase();

    const data = Object.values(PORTALS_DATA).find(p => p.id === key || p.aliases.includes(key));
    const subConfig = PORTAL_SUBPAGES[subpage];

    if (!data || !subConfig) {
        notFound();
    }

    if (key !== data.id || subpage !== subConfig.canonicalSlug) {
        redirect(`/guides/${data.id}/${subConfig.canonicalSlug}`);
    }

    return (
        <div className="min-h-screen bg-surface-gray flex flex-col font-sans text-gray-900 antialiased">
            <Header />

            {/* Breadcrumb Bar */}
            <div className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs font-semibold text-gray-500 overflow-x-auto whitespace-nowrap">
                    <Link href="/" className="hover:text-google-blue transition-colors">Home</Link>
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                    <Link href="/guides" className="hover:text-google-blue transition-colors">Guides</Link>
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                    <Link href={`/guides/${data.id}`} className="hover:text-google-blue transition-colors">{data.name}</Link>
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-900 font-bold">{subConfig.label}</span>
                </div>
            </div>

            {/* Sticky Sub-Navigation Pill Bar (Consistent UI Helper) */}
            <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm py-2.5 px-4">
                <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                    {PORTAL_NAV_ITEMS.map((item) => {
                        const IconComponent = item.icon;
                        const targetUrl = item.href === '' ? `/guides/${data.id}` : `/guides/${data.id}${item.href}`;
                        const isActive = item.key === subpage || (item.key === 'scholarships-list' && subpage === 'schemes');

                        return (
                            <Link
                                key={item.key}
                                href={targetUrl}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                                    isActive
                                        ? 'bg-google-blue text-white border-google-blue shadow-sm'
                                        : 'bg-surface-gray text-gray-700 border-gray-200 hover:border-google-blue hover:text-google-blue'
                                }`}
                            >
                                <IconComponent className="h-3.5 w-3.5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
                
                {/* Back to Master Guide Link */}
                <Link href={`/guides/${data.id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-google-blue mb-6 hover:underline">
                    <ArrowLeft className="h-4 w-4" /> Back to {data.name} Master Overview
                </Link>

                {/* Hero Card for Subpage */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm mb-8">
                    <span className="px-3.5 py-1 bg-blue-50 text-google-blue text-xs font-extrabold rounded-full uppercase tracking-wider border border-blue-100 inline-block mb-3">
                        {data.name} • {subConfig.label}
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                        {data.name}: {subConfig.titleSuffix}
                    </h1>
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-4xl">
                        {subConfig.descPrefix} {data.name} ({data.state}). Follow official instructions below.
                    </p>
                </div>

                {/* Main Dynamic Content rendering based on subpage topic */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-2 space-y-10">
                        
                        {subpage === 'status-check' && (
                            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                    <Search className="h-6 w-6 text-emerald-600" />
                                    Step-by-Step Status Check Instructions
                                </h2>
                                <div className="space-y-4 mb-6">
                                    {data.statusSteps.map((step, i) => (
                                        <div key={i} className="p-5 border-l-4 border-emerald-500 bg-emerald-50/50 rounded-r-2xl">
                                            <h3 className="font-bold text-emerald-950 text-base mb-1">{step.title}</h3>
                                            <p className="text-emerald-800 text-sm leading-relaxed">{step.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 flex items-start gap-3">
                                    <Info className="h-5 w-5 text-google-blue shrink-0 mt-0.5" />
                                    <div className="text-xs text-blue-900 leading-relaxed">
                                        <strong>PFMS Payment Tracking:</strong> If your portal status shows "Payment Released" but funds haven't arrived, verify your Aadhaar NPCI seeding status at your bank branch.
                                    </div>
                                </div>
                            </section>
                        )}

                        {subpage === 'student-login' && (
                            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                    <UserCheck className="h-6 w-6 text-google-blue" />
                                    Registration & Student Login Workflow
                                </h2>
                                <div className="space-y-4">
                                    {data.loginSteps.map((item, i) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-surface-gray border border-gray-100">
                                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-google-blue text-white font-black text-sm shrink-0">
                                                {item.step}
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-base mb-1">{item.title}</h3>
                                                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {subpage === 'documents-list' && (
                            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                    <FileText className="h-6 w-6 text-amber-600" />
                                    Mandatory Document Upload Formats & Specifications
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-gray-500 uppercase font-extrabold text-[10px] tracking-wider">
                                                <th className="py-3 px-3">Document Name</th>
                                                <th className="py-3 px-3">Format</th>
                                                <th className="py-3 px-3">Verification Note</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {data.documents.map((doc, i) => (
                                                <tr key={i} className="hover:bg-surface-gray">
                                                    <td className="py-3.5 px-3 font-bold text-gray-900">{doc.name}</td>
                                                    <td className="py-3.5 px-3">
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-mono text-[11px] font-semibold">{doc.format}</span>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-gray-600 text-xs">{doc.note}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* ALWAYS INCLUDE TOP SCHOLARSHIPS ON ALL SUBPAGES (Ensures Money Page Conversion) */}
                        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                                    <Award className="h-6 w-6 text-google-blue" />
                                    Top Scholarships Hosted on {data.name}
                                </h2>
                                <Link href={`/scholarships-in/${slugify(data.state)}`} className="text-xs font-bold text-google-blue hover:underline flex items-center gap-1">
                                    View All {data.state} Scholarships <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {data.topSchemes.map((scheme, i) => (
                                    <div key={i} className="p-5 border border-gray-200 rounded-2xl hover:border-google-blue transition-all bg-white shadow-xs hover:shadow-md">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <h3 className="font-bold text-base text-gray-900 group-hover:text-google-blue">
                                                <Link href={`/scholarships/${scheme.slug}`}>{scheme.name}</Link>
                                            </h3>
                                            <span className="px-3 py-1 bg-green-50 text-green-700 font-extrabold text-xs rounded-full shrink-0 border border-green-200">
                                                {scheme.amount}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium mb-4">{scheme.targetGroup}</p>
                                        <div className="flex items-center gap-4 text-xs font-bold">
                                            <Link href={`/scholarships/${scheme.slug}`} className="text-google-blue hover:underline flex items-center gap-1">
                                                Scholarship Overview <ChevronRight className="h-3.5 w-3.5" />
                                            </Link>
                                            <Link href={`/scholarships/${scheme.slug}/apply-online`} className="text-emerald-600 hover:underline flex items-center gap-1">
                                                Step-by-Step Apply <Globe className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* FAQs Card */}
                        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4">
                                Portal Support FAQs
                            </h2>
                            <div className="space-y-3">
                                {data.faqs.map((faq, i) => (
                                    <details key={i} className="group border border-gray-200 rounded-xl p-4 bg-white">
                                        <summary className="font-bold text-gray-900 cursor-pointer text-xs sm:text-sm flex justify-between items-center">
                                            <span>{faq.q}</span>
                                            <span className="text-google-blue shrink-0 ml-2">▼</span>
                                        </summary>
                                        <p className="text-gray-600 text-xs mt-2 pt-2 border-t border-gray-100 leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                                <PhoneCall className="h-5 w-5 text-google-blue" />
                                Portal Helpdesk
                            </h3>
                            <div className="space-y-3 text-xs mb-6">
                                <div className="p-3 bg-surface-gray rounded-xl">
                                    <span className="block font-bold text-gray-400 uppercase text-[9px]">Helpline</span>
                                    <span className="font-bold text-gray-900">{data.helpline.phone}</span>
                                </div>
                                <div className="p-3 bg-surface-gray rounded-xl">
                                    <span className="block font-bold text-gray-400 uppercase text-[9px]">Email</span>
                                    <span className="font-bold text-google-blue font-mono break-all">{data.helpline.email}</span>
                                </div>
                            </div>
                            <a
                                href={data.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-surface-gray hover:bg-gray-100 text-gray-800 font-bold rounded-xl text-xs transition-colors border border-gray-200"
                            >
                                External Link: Official Portal <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                            </a>
                        </div>
                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
}
