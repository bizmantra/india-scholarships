import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
    ExternalLink, 
    CheckCircle2, 
    AlertCircle, 
    Info, 
    FileText, 
    ShieldCheck, 
    Calendar, 
    Globe, 
    HelpCircle, 
    PhoneCall, 
    ArrowRight, 
    ChevronRight, 
    Search,
    IndianRupee,
    UserCheck,
    Clock,
    LayoutGrid,
    ListFilter,
    Award
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { slugify } from '@/lib/utils';
import { PORTALS_DATA, PortalGuide } from '@/lib/portalsData';

const PORTAL_NAV_ITEMS = [
    { key: 'overview', label: 'Overview', icon: LayoutGrid, href: '#overview' },
    { key: 'student-login', label: 'Student Login', icon: UserCheck, href: '/student-login' },
    { key: 'status-check', label: 'Status Check', icon: Search, href: '/status-check' },
    { key: 'documents-list', label: 'Documents List', icon: FileText, href: '/documents-list' },
    { key: 'scholarships', label: 'Top Scholarships', icon: Award, href: '/schemes' },
    { key: 'faqs', label: 'FAQs', icon: HelpCircle, href: '#faqs' },
    { key: 'helpdesk', label: 'Helpdesk', icon: PhoneCall, href: '#helpdesk' }
];

// Generate static params for all portal guides + aliases
export async function generateStaticParams() {
    const params: Array<{ portal: string }> = [];
    
    Object.values(PORTALS_DATA).forEach(p => {
        params.push({ portal: p.id });
        p.aliases.forEach(alias => {
            params.push({ portal: alias });
        });
    });

    return params;
}

// Generate dynamic metadata
export async function generateMetadata({ params }: { params: Promise<{ portal: string }> }): Promise<Metadata> {
    const { portal } = await params;
    const key = portal.toLowerCase();
    
    const data = Object.values(PORTALS_DATA).find(p => p.id === key || p.aliases.includes(key));

    if (!data) {
        return {
            title: 'Portal Guide Not Found | IndiaScholarships',
            alternates: {
                canonical: `https://www.indiascholarships.in/guides/${portal}`,
            }
        };
    }

    return {
        title: data.fullTitle,
        description: data.seoDesc,
        alternates: {
            canonical: `https://www.indiascholarships.in/guides/${data.id}`,
            languages: {
                'x-default': `https://www.indiascholarships.in/guides/${data.id}`,
                'en': `https://www.indiascholarships.in/guides/${data.id}`,
            }
        }
    };
}

export default async function MasterPortalGuidePage({ params }: { params: Promise<{ portal: string }> }) {
    const { portal } = await params;
    const key = portal.toLowerCase();

    const data = Object.values(PORTALS_DATA).find(p => p.id === key || p.aliases.includes(key));

    if (!data) {
        notFound();
    }

    if (key !== data.id) {
        redirect(`/guides/${data.id}`);
    }

    // Generate HowTo Schema
    const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        'name': `How to Apply & Login to ${data.name}`,
        'description': data.description,
        'step': data.loginSteps.map((s, idx) => ({
            '@type': 'HowToStep',
            'position': idx + 1,
            'name': s.title,
            'text': s.desc
        }))
    };

    // Generate FAQ Schema
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': data.faqs.map(f => ({
            '@type': 'Question',
            'name': f.q,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': f.a
            }
        }))
    };

    return (
        <div className="min-h-screen bg-surface-gray flex flex-col font-sans text-gray-900 antialiased">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <Header />

            {/* Breadcrumb Bar */}
            <div className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs font-semibold text-gray-500 overflow-x-auto whitespace-nowrap">
                    <Link href="/" className="hover:text-google-blue transition-colors">Home</Link>
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                    <Link href="/guides" className="hover:text-google-blue transition-colors">Guides</Link>
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-900 font-bold">{data.name}</span>
                </div>
            </div>

            {/* Sticky Navigation Pill Bar (Design Helper) */}
            <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm py-2.5 px-4">
                <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                    {PORTAL_NAV_ITEMS.map((item) => {
                        const IconComponent = item.icon;
                        const isHash = item.href.startsWith('#');
                        const targetUrl = isHash ? item.href : `/guides/${data.id}${item.href}`;
                        const isActive = item.key === 'overview';

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
                
                {/* Hero Header Section */}
                <div id="overview" className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm mb-8 relative overflow-hidden">
                    <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-70 pointer-events-none"></div>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="px-3.5 py-1 bg-blue-50 text-google-blue text-xs font-extrabold rounded-full uppercase tracking-wider border border-blue-100 flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5" />
                            {data.portalTag}
                        </span>
                        <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-full uppercase tracking-wider border border-emerald-100 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {data.state}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                        {data.fullTitle}
                    </h1>

                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-4xl">
                        {data.description}
                    </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center">
                        <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Active Scholarships</span>
                        <span className="text-lg font-black text-gray-900">{data.stats.activeSchemes}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center">
                        <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Beneficiaries</span>
                        <span className="text-lg font-black text-gray-900">{data.stats.beneficiaries}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center">
                        <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Method</span>
                        <span className="text-lg font-black text-google-blue">{data.stats.disbursementType}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center">
                        <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Verification</span>
                        <span className="text-lg font-black text-emerald-600">{data.stats.verificationMode}</span>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Left Column (2/3 width) */}
                    <div className="lg:col-span-2 space-y-10">
                        
                        {/* Section 1: How to Login & Register */}
                        <section id="student-login" className="pb-8 border-b border-gray-150 scroll-mt-32">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 text-google-blue rounded-2xl">
                                        <UserCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                                            How to Register & Login on {data.name}
                                        </h2>
                                        <p className="text-xs text-gray-500 font-medium">Follow this 4-step official registration process</p>
                                    </div>
                                </div>
                                <Link 
                                    href={`/guides/${data.id}/student-login`} 
                                    className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-google-blue hover:underline"
                                >
                                    Full Login Guide <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {data.loginSteps.map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-surface-gray border border-gray-100 hover:border-blue-200 transition-colors">
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

                        {/* Section 2: Application & Payment Status Check Guide */}
                        <section id="status-check" className="pb-8 border-b border-gray-150 scroll-mt-32">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                        <Search className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                                            How to Check Application & PFMS Status
                                        </h2>
                                        <p className="text-xs text-gray-500 font-medium">Track your disbursement stage and approval progress</p>
                                    </div>
                                </div>
                                <Link 
                                    href={`/guides/${data.id}/status-check`} 
                                    className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 hover:underline"
                                >
                                    Full Status Guide <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <div className="space-y-4 mb-6">
                                {data.statusSteps.map((step, i) => (
                                    <div key={i} className="p-4 border-l-4 border-emerald-500 bg-emerald-50/50 rounded-r-2xl">
                                        <h3 className="font-bold text-emerald-950 text-sm mb-1">{step.title}</h3>
                                        <p className="text-emerald-800 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 flex items-start gap-3">
                                <Info className="h-5 w-5 text-google-blue shrink-0 mt-0.5" />
                                <div className="text-xs text-blue-900 leading-relaxed">
                                    <strong>Pro-Tip for PFMS Credit Failures:</strong> Ensure your bank account is active and mapped to your Aadhaar number in the NPCI database. Payments via DBT will bounce if Aadhaar seeding is missing at your bank branch.
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Essential Documents Checklist */}
                        <section id="documents" className="pb-8 border-b border-gray-150 scroll-mt-32">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                                            Mandatory Document Upload Checklist
                                        </h2>
                                        <p className="text-xs text-gray-500 font-medium">Prepare these files before starting your online application</p>
                                    </div>
                                </div>
                                <Link 
                                    href={`/guides/${data.id}/documents-list`} 
                                    className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-amber-600 hover:underline"
                                >
                                    Full Docs List <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-500 uppercase font-extrabold text-[10px] tracking-wider">
                                            <th className="py-3 px-3">Document Name</th>
                                            <th className="py-3 px-3">Format / Size</th>
                                            <th className="py-3 px-3">Verification Rules</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.documents.map((doc, i) => (
                                            <tr key={i} className="hover:bg-surface-gray transition-colors">
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

                        {/* Section 4: Available Scholarships Hosted on Portal */}
                        <section id="schemes" className="pb-8 border-b border-gray-150 scroll-mt-32">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                                    Top Scholarships Hosted on {data.name}
                                </h2>
                                <Link href={`/scholarships-in/${slugify(data.state)}`} className="text-xs font-bold text-google-blue hover:underline flex items-center gap-1">
                                    View All {data.state} Scholarships <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {data.topSchemes.map((scheme, i) => (
                                    <div key={i} className="p-5 border border-gray-200 rounded-2xl hover:border-google-blue transition-all hover:shadow-md bg-white">
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

                        {/* Section 5: Troubleshooting FAQs */}
                        <section id="faqs" className="scroll-mt-32">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                <HelpCircle className="h-6 w-6 text-google-blue" />
                                Frequently Asked Questions & Solutions
                            </h2>

                            <div className="space-y-4">
                                {data.faqs.map((faq, i) => (
                                    <details key={i} className="group border border-gray-200 rounded-2xl p-4 [&_summary::-webkit-details-marker]:none bg-white">
                                        <summary className="flex items-center justify-between font-bold text-gray-900 cursor-pointer text-sm sm:text-base pr-2">
                                            <span>{faq.q}</span>
                                            <span className="transition group-open:rotate-180 text-google-blue shrink-0 ml-2">▼</span>
                                        </summary>
                                        <p className="text-gray-600 text-xs sm:text-sm mt-3 pt-3 border-t border-gray-100 leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* Right Sidebar (1/3 width) */}
                    <div id="helpdesk" className="space-y-6 scroll-mt-32">
                        
                        {/* Helpline & Office Contact Card */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                                <PhoneCall className="h-5 w-5 text-google-blue" />
                                Official Portal Helpdesk
                            </h3>

                            <div className="space-y-3 text-xs sm:text-sm mb-6">
                                <div className="p-3 bg-surface-gray rounded-xl">
                                    <span className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Helpline Phone</span>
                                    <span className="font-bold text-gray-900">{data.helpline.phone}</span>
                                </div>

                                <div className="p-3 bg-surface-gray rounded-xl">
                                    <span className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Support Email</span>
                                    <span className="font-bold text-google-blue font-mono break-all">{data.helpline.email}</span>
                                </div>

                                <div className="p-3 bg-surface-gray rounded-xl">
                                    <span className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Visiting Hours</span>
                                    <span className="font-medium text-gray-700">{data.helpline.hours}</span>
                                </div>

                                <div className="p-3 bg-surface-gray rounded-xl">
                                    <span className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Department Address</span>
                                    <span className="text-xs text-gray-600 leading-normal">{data.helpline.address}</span>
                                </div>
                            </div>

                            {/* External Official Link Moved Here Below Helpdesk */}
                            <a
                                href={data.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-surface-gray hover:bg-gray-100 text-gray-800 font-bold rounded-xl text-xs transition-colors border border-gray-200"
                            >
                                External Link: Official Portal <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                            </a>
                        </div>

                        {/* Fallback Corporate Scholarships Card */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-base font-extrabold text-gray-900 mb-2">Looking for Private Aid?</h3>
                            <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                Corporate CSR grants (Jindal, Tata, HDFC) can be claimed alongside government scholarships.
                            </p>

                            <Link
                                href="/private-scholarships"
                                className="flex items-center justify-between p-3.5 bg-surface-gray hover:bg-blue-50 rounded-xl text-xs font-bold text-gray-900 hover:text-google-blue border border-gray-100 transition-colors group"
                            >
                                <span>Explore Corporate Scholarships</span>
                                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
}
