import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAllScholarships, getScholarshipBySlug, getRelatedScholarships, getSiblingVariants, getCleanSteps, getClient } from '@/lib/db';

export const revalidate = 86400; // Align server revalidation to 24 hours

import { getArticlesForScholarship } from '@/lib/articles';
import { getNewsForScholarship } from '@/lib/news';
import { getPillarForScholarship } from '@/lib/pillars';
import { getCanonicalSlugForLevel, getCanonicalSlugForIncome, getCanonicalSlugForCategory, slugify, getScholarshipTypeRoute, sanitizeApplyUrl, formatDeadlineDate } from '@/lib/utils';
import {
    Calendar,
    Users,
    IndianRupee,
    Globe,
    CheckCircle2,
    ChevronRight,
    Info,
    ShieldCheck,
    Clock,
    Award,
    RefreshCcw,
    BookOpen,
    Bell
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ShareButtons from '@/app/components/ShareButtons';
import LanguageDetector from '@/app/components/LanguageDetector';
import ScholarshipCard from '@/app/components/ScholarshipCard';

const SUBPAGE_NAV = [
    { key: 'eligibility', label: 'Eligibility', icon: CheckCircle2 },
    { key: 'income-limit', label: 'Income Limit', icon: IndianRupee },
    { key: 'apply-online', label: 'How to Apply', icon: Globe },
    { key: 'documents-required', label: 'Documents', icon: ShieldCheck },
    { key: 'selection-process', label: 'Selection', icon: Award },
    { key: 'renewal-process', label: 'Renewal', icon: RefreshCcw },
    { key: 'last-date', label: 'Last Date', icon: Calendar },
];

// Generate static params for all scholarships
export async function generateStaticParams() {
    const scholarships = await getAllScholarships();
    return scholarships.map((scholarship: any) => ({
        slug: scholarship.slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const scholarship = await getScholarshipBySlug(slug);

    if (!scholarship) {
        return {
            title: 'Scholarship Not Found',
        };
    }

    const title = scholarship.title;
    const lowerTitle = title.toLowerCase();
    const isGov = scholarship.scholarship_type === 'Government' ||
                  lowerTitle.includes('yojana') ||
                  lowerTitle.includes('scheme') ||
                  lowerTitle.includes('portal') ||
                  lowerTitle.includes('post matric') ||
                  lowerTitle.includes('post-matric') ||
                  lowerTitle.includes('pre matric') ||
                  lowerTitle.includes('pre-matric');

    const year = scholarship.verification_year || new Date().getFullYear();
    const cleanTitle = title.replace(/\s*(?:20\d{2}(?:-\d{2,4})?)\s*$/, '').trim();
    let seoTitle = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = scholarship.deadline && !isNaN(new Date(scholarship.deadline).getTime()) ? new Date(scholarship.deadline) : null;
    const isAlwaysOpen = scholarship.always_open === 1;
    const isDeadlinePassed = isAlwaysOpen ? false : (deadlineDate ? deadlineDate < today : false);
    const statusLabel = isDeadlinePassed ? 'Closed' : 'Open';

    // Specific brand overrides for June & July high-opportunity keywords
    if (slug === 'pm-yashasvi-scholarship') {
        seoTitle = isDeadlinePassed
            ? `PM Yashasvi Scholarship Scheme ${year}: Eligibility, Amount & Details`
            : `PM Yashasvi Scholarship Scheme ${year}: Apply Online, Last Date & Eligibility`;
    } else if (slug === 'sitaram-jindal-foundation-scholarship') {
        seoTitle = isDeadlinePassed
            ? `Sitaram Jindal Foundation Scholarship ${year}: Eligibility & Last Date Details`
            : `Sitaram Jindal Foundation Scholarship ${year}: Apply Online & Last Date`;
    } else if (slug === 'tata-capital-pankh-scholarship') {
        seoTitle = isDeadlinePassed
            ? `Tata Capital Pankh Scholarship ${year}: Details, Eligibility & Selection`
            : `Tata Capital Pankh Scholarship ${year}: Up to ₹1 Lakh | Eligibility & Apply Online`;
    } else if (slug === 'mukhyamantri-medhavi-vidyarthi-yojana-mmvy') {
        seoTitle = isDeadlinePassed
            ? `MMVY Scholarship ${year}: Details, Eligibility & Verification Status`
            : `MMVY Scholarship ${year}: Apply Online, Eligibility, Last Date & Amount`;
    } else if (slug === 'jharkhand-e-kalyan-post-matric-scholarship') {
        seoTitle = isDeadlinePassed
            ? `e-Kalyan Jharkhand Scholarship ${year}: Details, Eligibility & Verification`
            : `e-Kalyan Jharkhand Scholarship ${year}: Apply Online, Last Date & Amount`;
    } else if (slug === 'swami-vivekananda-merit-cum-means-scholarship-svmcm') {
        seoTitle = isDeadlinePassed
            ? `SVMCM Scholarship ${year}: Details, Eligibility & Application Status`
            : `SVMCM Scholarship ${year}: Apply Online, Eligibility, Last Date & Amount`;
    } else if (slug === 'e-grantz-kerala-scstoecoobc-support') {
        seoTitle = isDeadlinePassed
            ? `e-Grantz Kerala Scholarship ${year}: Details, Eligibility & Status`
            : `e-Grantz Kerala Scholarship ${year}: Apply Online, Last Date & Amount`;
    } else if (slug === 'bitsat-scholarship') {
        seoTitle = `BITSAT Scholarship ${year}: Eligibility & Fee Waiver Details`;
    } else if (slug === 'hdfc-bank-parivartan-ecss-scholarship') {
        seoTitle = isDeadlinePassed
            ? `HDFC Parivartan Scholarship ${year}: Eligibility & Details`
            : `HDFC Parivartan Scholarship ${year}: Up to ₹75,000 | Eligibility & Apply Online`;
    } else if (slug === 'reliance-foundation-undergraduate-scholarship') {
        seoTitle = isDeadlinePassed
            ? `Reliance Foundation Scholarship ${year}: UG Eligibility & Selection`
            : `Reliance Foundation Scholarship ${year}: UG Apply Online, Eligibility & Selection`;
    } else if (slug === 'azim-premji-scholarship') {
        seoTitle = isDeadlinePassed
            ? `Azim Premji Scholarship ${year}: For Govt School Students | Details & Eligibility`
            : `Azim Premji Scholarship ${year}: For Govt School Students | Eligibility & Apply`;
    } else if (slug === 'lic-golden-jubilee-scholarship') {
        seoTitle = isDeadlinePassed
            ? `LIC Golden Jubilee Scholarship ${year}: Eligibility & Last Date Details`
            : `LIC Golden Jubilee Scholarship ${year}: Apply Online, Eligibility & Last Date`;
    } else if (lowerTitle.includes('nabanna')) {
        seoTitle = isDeadlinePassed
            ? `Nabanna Scholarship ${year}: Eligibility & Submission Guide`
            : `Nabanna Scholarship ${year}: Application Form, Eligibility & Submission Guide`;
    } else if (slug === 'krishi-vidya-nidhi-yojana-odisha') {
        seoTitle = `Krishi Vidya Nidhi Yojana Odisha ${year}: Benefit Amount & Eligibility Check`;
    } else if (slug === 'post-matric-scholarship-for-obcsebc-students-odisha') {
        seoTitle = isDeadlinePassed
            ? `Odisha Post Matric OBC/SEBC Scholarship ${year}: Details & Eligibility`
            : `Odisha Post Matric OBC/SEBC Scholarship ${year}: Apply Online & Deadlines`;
    } else if (slug === 'post-matric-scholarship-for-st-students-odisha') {
        seoTitle = isDeadlinePassed
            ? `Odisha Post Matric ST Scholarship ${year}: Details & Eligibility`
            : `Odisha Post Matric ST Scholarship ${year}: Eligibility, Last Date & Apply`;
    } else if (slug === 'boc-scholarship-nirman-shramik-kalyan-yojana-odisha') {
        seoTitle = `Odisha BOC Scholarship ${year}: Nirman Shramik Kalyan Yojana Details`;
    } else if (slug === 'chief-minister-higher-education-scholarship-rajasthan') {
        seoTitle = isDeadlinePassed
            ? `Rajasthan Chief Minister Higher Education Scholarship ${year}: Eligibility & Details`
            : `Rajasthan Chief Minister Higher Education Scholarship ${year}: Apply Online & Status`;
    } else if (slug === 'e-medhabruti-ug-merit-scholarship-odisha') {
        seoTitle = isDeadlinePassed
            ? `e-Medhabruti UG Merit Scholarship Odisha ${year}: Details & Renewal`
            : `e-Medhabruti UG Merit Scholarship Odisha ${year}: Apply Online, Last Date & Renewal`;
    } else if (slug === 'mukhyamantri-yuva-swavalamban-yojana-mysy') {
        seoTitle = isDeadlinePassed
            ? `MYSY Scholarship Gujarat ${year}: Details, Document List & Status`
            : `MYSY Scholarship Gujarat ${year}: Apply Online, Last Date, Document List & Status`;
    } else if (slug === 'jagananna-vidya-deevena-fees-reimbursement') {
        seoTitle = `Jagananna Vidya Deevena (JVD) ${year}: Fees Reimbursement Status & Details`;
    } else if (slug === 'sbi-platinum-jubilee-asha-scholarship') {
        seoTitle = isDeadlinePassed
            ? `SBI Asha Scholarship ${year}: Eligibility & Details`
            : `SBI Asha Scholarship ${year}: ₹15,000 | Eligibility, Last Date & Apply Online`;
    } else if (slug === 'merit-cum-means-mcm-scholarship-for-minorities-professional-and-technical-courses-karnataka') {
        seoTitle = isDeadlinePassed
            ? `Karnataka Minorities MCM Scholarship ${year}: Professional & Technical Details`
            : `Karnataka Minorities MCM Scholarship ${year}: Professional & Technical Apply Online`;
    } else if (slug === 'post-matric-scholarship-for-minorities-karnataka') {
        seoTitle = isDeadlinePassed
            ? `Karnataka Post Matric Scholarship for Minorities ${year}: Details & Login`
            : `Karnataka Post Matric Scholarship for Minorities ${year}: Login & Apply Online`;
    } else if (slug === 'vidyasiri-food-and-accommodation-scholarship-for-obc-students-karnataka') {
        seoTitle = isDeadlinePassed
            ? `Vidyasiri Scholarship Karnataka ${year}: Food & Accommodation Status`
            : `Vidyasiri Scholarship Karnataka ${year}: Food & Accommodation Apply Online & Status`;
    } else if (slug === 'post-matric-scholarship-for-st-students-karnataka') {
        seoTitle = isDeadlinePassed
            ? `Karnataka Post Matric ST Scholarship ${year}: Registration Portal & Details`
            : `Karnataka Post Matric ST Scholarship ${year}: Registration Portal, Login & Apply`;
    } else if (slug === 'prime-ministers-research-fellowship-pmrf') {
        seoTitle = `PMRF Scholarship ${year}: Prime Minister's Research Fellowship Portal`;
    } else if (slug === 'bihar-post-matric-scholarship-bcebc') {
        seoTitle = isDeadlinePassed
            ? `Bihar Post Matric BC/EBC Scholarship ${year}: PMS Online Portal details`
            : `Bihar Post Matric BC/EBC Scholarship ${year}: PMS Online Portal Login & Last Date`;
    } else if (slug === 'central-sector-scheme-of-scholarship-for-college-and-university-students') {
        seoTitle = isDeadlinePassed
            ? `CSSS Scholarship ${year}: Central Sector Scheme details`
            : `CSSS Scholarship ${year}: Central Sector Scheme for College/University Apply Online`;
    } else if (slug === 'up-post-matric-scholarship-dashmottar') {
        seoTitle = isDeadlinePassed
            ? `UP Scholarship Dashmottar ${year}: Post Matric Details & Status Check`
            : `UP Scholarship Dashmottar ${year}: Post Matric Apply Online, Login & Status Check`;
    } else if (isGov) {
        // Dynamic rule for government scholarships
        seoTitle = isDeadlinePassed
            ? `${cleanTitle} ${year}: Details, Eligibility & Status Check`
            : `${cleanTitle} ${year}: Apply Online, Portal Login & Status Check`;
    } else {
        // Dynamic rule for private/corporate/trust scholarships
        seoTitle = isDeadlinePassed
            ? `${cleanTitle} ${year}: Details, Eligibility & Selection Process`
            : `${cleanTitle} ${year}: Application Form, Eligibility & Selection List`;
    }

    return {
        title: seoTitle,
        description: scholarship.intro_seo?.substring(0, 160) || `${scholarship.title} details including eligibility, benefits, income limit, application process, and official source.`,
        alternates: {
            canonical: `https://www.indiascholarships.in/scholarships/${slug}`,
            languages: {
                'x-default': `https://www.indiascholarships.in/scholarships/${slug}`,
                'en': `https://www.indiascholarships.in/scholarships/${slug}`,
                'hi': `https://www.indiascholarships.in/hi/scholarships/${slug}`,
                'bn': `https://www.indiascholarships.in/bn/scholarships/${slug}`,
                'ta': `https://www.indiascholarships.in/ta/scholarships/${slug}`,
                'te': `https://www.indiascholarships.in/te/scholarships/${slug}`,
                'or': `https://www.indiascholarships.in/or/scholarships/${slug}`,
                'kn': `https://www.indiascholarships.in/kn/scholarships/${slug}`,
            }
        },
        openGraph: {
            title: `${scholarship.title} – ${isDeadlinePassed ? 'Details & Eligibility' : 'Application Open'} (${year})`,
            description: isDeadlinePassed ? `Check ${scholarship.title} details, eligibility, benefits, and expected dates for the next cycle.` : `Apply for ${scholarship.title}. Amount: ₹${scholarship.amount_annual > 0 ? scholarship.amount_annual : 'Variable'}/year. ${scholarship.level} students in ${scholarship.state || 'India'}.`,
            url: `https://www.indiascholarships.in/scholarships/${scholarship.slug}`,
            type: 'article',
            siteName: 'IndiaScholarships',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${scholarship.title}`,
            description: `Check eligibility and apply for ${scholarship.title}.`,
        }
    };

}

export default async function ScholarshipDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const scholarship = await getScholarshipBySlug(slug);

    if (!scholarship) {
        notFound();
    }

    const cleanApplyUrl = sanitizeApplyUrl(scholarship.apply_url || scholarship.official_source);
    const cleanOfficialSource = sanitizeApplyUrl(scholarship.official_source || scholarship.apply_url);

    const relatedScholarships = await getRelatedScholarships(scholarship.id, 5);
    const siblingVariants = await getSiblingVariants(scholarship.id, scholarship.slug, scholarship.title);
    const relevantArticles = getArticlesForScholarship(scholarship.slug);
    const relevantNews = getNewsForScholarship(scholarship.slug);
    const bestFitPillar = getPillarForScholarship(scholarship);

    // Dynamic deadline check (relative to India's current date boundary)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = scholarship.deadline && !isNaN(new Date(scholarship.deadline).getTime()) ? new Date(scholarship.deadline) : null;
    const isAlwaysOpen = scholarship.always_open === 1;
    const isDeadlinePassed = isAlwaysOpen ? false : (deadlineDate ? deadlineDate < today : false);

    // Helper to display helpline
    const displayHelpline = (val: string | null | undefined) => {
        if (!val || val.trim() === '') return 'Refer Official Site';
        const lower = val.trim().toLowerCase();
        if (lower === 'not specified' || lower === 'na' || lower === 'n/a' || lower === 'none') {
            return 'Refer Official Site';
        }
        return val;
    };

    // FAQPage schema
    let faqSchema = null;
    let parsedFaqs: any[] = [];
    try {
        const faqs = scholarship.faq_json;
        if (Array.isArray(faqs) && faqs.length > 0) {
            parsedFaqs = faqs;
            const mainEntity = faqs.map((faq: any) => ({
                '@type': 'Question',
                name: faq.question || faq.q || '',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer || faq.a || ''
                }
            })).filter((item: any) => item.name && item.acceptedAnswer.text);

            if (mainEntity.length > 0) {
                faqSchema = {
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: mainEntity
                };
            }
        }
    } catch (e) {}

    // GovernmentService schema
    let govServiceSchema = null;
    if (scholarship.scholarship_type === 'Government' || scholarship.provider_type === 'Government') {
        govServiceSchema = {
            '@context': 'https://schema.org',
            '@type': 'GovernmentService',
            name: scholarship.title,
            serviceType: 'Scholarship',
            provider: {
                '@type': 'GovernmentOrganization',
                name: scholarship.provider || 'Government Agency'
            },
            areaServed: {
                '@type': 'AdministrativeArea',
                name: scholarship.state || 'India'
            },
            serviceOperator: {
                '@type': 'GovernmentOrganization',
                name: scholarship.provider || 'Government Agency'
            },
            eligibilityNote: scholarship.residency_requirement || scholarship.level || 'Refer to eligibility guidelines'
        };
    }

    // Format amount
    const formatAmount = (amount: number | null, description: string = '') => {
        if (!amount || amount === 0) {
            return description || 'Check official notification';
        }

        let foreignAmountStr = '';
        const scope = scholarship.scholarship_scope || '';
        const isInternational = scope.toLowerCase() === 'international' || scope.toLowerCase() === 'study-abroad' || (scholarship.country_of_study && scholarship.country_of_study.toLowerCase() !== 'india');

        if (isInternational && description) {
            const match = description.match(/(?:S\$|SGD|USD|\$|£|€|EUR|GBP|CAD|C\$|AUD|A\$)\s*[\d,]+(?:\s*(?:to|-)\s*(?:S\$|SGD|USD|\$|£|€|EUR|GBP|CAD|C\$|AUD|A\$)?\s*[\d,]+)?/i);
            if (match) {
                foreignAmountStr = match[0].trim();
                const lowerDesc = description.toLowerCase();
                if (lowerDesc.includes('/month') || lowerDesc.includes('monthly') || lowerDesc.includes('per month')) {
                    if (!foreignAmountStr.includes('/mo') && !foreignAmountStr.includes('month')) {
                        foreignAmountStr += '/mo';
                    }
                }
            }
        }

        const inrFormatted = amount >= 100000
            ? `₹${(amount / 100000).toFixed(1)} Lakh+`
            : (amount >= 1000 ? `₹${(amount / 1000).toFixed(0)}k+` : `₹${amount}`);

        if (foreignAmountStr) {
            return `${foreignAmountStr} (approx. ${inrFormatted})`;
        }
        return inrFormatted;
    };

    const FormattedText = ({ text, type = 'list' }: { text: string | null, type?: 'list' | 'steps' }) => {
        if (!text) return <p className="text-gray-400 italic">Not specified</p>;

        const renderMarkdown = (txt: string) => {
            const parts = txt.split(/\*\*([\s\S]*?)\*\*/g);
            return parts.map((part, index) => {
                if (index % 2 === 1) {
                    return <strong key={index} className="font-bold text-gray-900">{part}</strong>;
                }
                return part;
            });
        };

        const renderListItem = (rawItem: string, isStepIndex?: number) => {
            let cleaned = rawItem.replace(/^([-•–\*]|\d+\.)\s+/, '').trim();

            const colonIndex = cleaned.indexOf(':');
            if (colonIndex > -1 && colonIndex < 45) {
                let key = cleaned.substring(0, colonIndex).trim();
                let value = cleaned.substring(colonIndex + 1).trim();

                if (key.startsWith('**') && value.startsWith('**')) {
                    key = key.replace(/^\*\*/, '');
                    value = value.replace(/^\*\*/, '');
                } else if (key.startsWith('**') && key.endsWith('**')) {
                    key = key.substring(2, key.length - 2);
                } else {
                    key = key.replace(/\*\*/g, '');
                    value = value.replace(/^\*\*/, '');
                }

                key = key.replace(/\*\*$/, '').replace(/:$/, '').trim();
                value = value.trim();

                if (isStepIndex !== undefined) {
                    key = key.replace(/^\b\d+[\.\)]\s*/, '').replace(/^Step\s+\d+:\s*/i, '').trim();
                    return (
                        <div className="flex gap-4">
                            <span className="flex-shrink-0 w-6 h-6 text-xs font-bold text-gray-400 pt-0.5">
                                {isStepIndex + 1}
                            </span>
                            <div className="flex-1">
                                <span className="font-bold text-gray-900 mr-2">
                                    {key}
                                </span>
                                <p className="mt-1 text-base text-gray-600">{renderMarkdown(value)}</p>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="flex items-start gap-3">
                        <span className="text-gray-400 shrink-0">—</span>
                        <p className="text-base text-gray-700">
                            <span className="font-bold text-gray-900 mr-1.5">{key}:</span>
                            {renderMarkdown(value)}
                        </p>
                    </div>
                );
            }

            if (isStepIndex !== undefined) {
                cleaned = cleaned.replace(/^\b\d+[\.\)]\s*/, '').replace(/^Step\s+\d+:\s*/i, '').trim();
                return (
                    <div className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 text-xs font-bold text-gray-400 pt-0.5">
                            {isStepIndex + 1}
                        </span>
                        <div className="flex-1">
                            <p className="text-base text-gray-700">{renderMarkdown(cleaned)}</p>
                        </div>
                    </div>
                );
            }

            return (
                <div className="flex items-start gap-3">
                    <span className="text-gray-400 shrink-0">—</span>
                    <p className="text-base text-gray-700">{renderMarkdown(cleaned)}</p>
                </div>
            );
        };

        let items: string[] = [];
        let isSteps = type === 'steps';

        if (isSteps) {
            items = getCleanSteps(text);
        } else {
            const trimmedText = text.trim();
            if (trimmedText.includes('\n')) {
                items = trimmedText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
            } else {
                items = trimmedText
                    .split(/(?<!\b[A-Z])\.\s+(?=[A-Z])|(?<=\.\s+|^)(?=[A-Z][A-Za-z\s]+:)|(?=\(\w\))|(?=•)|(?=–)|;/)
                    .map(s => s.trim())
                    .filter(s => s.length > 0 && !s.match(/^(Selection based on|Renewal conditions):$/i));
            }
        }

        if (items.length <= 1) {
            const cleanedText = text.replace(/^([-•–\*]|\d+\.)\s+/, '').trim();
            return <p className="text-base text-gray-700 leading-relaxed">{renderMarkdown(cleanedText)}</p>;
        }

        return (
            <ul className="space-y-3 list-none">
                {items.map((item, i) => (
                    <li key={i} className="text-base text-gray-700 leading-relaxed border-b border-gray-100 pb-3 last:border-b-0">
                        {renderListItem(item, isSteps ? i : undefined)}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="bg-gray-50 border-b border-gray-100">
                <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-gray-500">
                    <Link href="/" className="hover:text-google-blue transition-colors">Home</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link href="/scholarships" className="hover:text-google-blue transition-colors">Scholarships</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-gray-900 font-medium truncate">{scholarship.title}</span>
                </nav>
            </div>

            <LanguageDetector slug={scholarship.slug} />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: scholarship.title,
                        description: scholarship.intro_seo,
                        image: 'https://www.indiascholarships.in/icon.png',
                        datePublished: new Date().toISOString(),
                        dateModified: new Date().toISOString(),
                        author: { '@type': 'Organization', name: 'IndiaScholarships' },
                        publisher: {
                            '@type': 'Organization',
                            name: 'IndiaScholarships',
                            logo: { '@type': 'ImageObject', url: 'https://www.indiascholarships.in/icon.png' }
                        },
                        mainEntityOfPage: {
                            '@type': 'WebPage',
                            '@id': `https://www.indiascholarships.in/scholarships/${scholarship.slug}`
                        }
                    })
                }}
            />
            {faqSchema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            )}
            {govServiceSchema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(govServiceSchema) }} />
            )}

            {/* Sticky quick-jump nav — real anchors, matches the next.config.ts subpage
                redirects (/scholarships/:slug/:subpage -> #:subpage). One sticky bar only,
                doubles as orientation + jump links, so it doesn't compete with anything else. */}
            <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 overflow-x-auto scrollbar-none">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 py-2">
                    {SUBPAGE_NAV.map((item) => {
                        const Icon = item.icon;
                        return (
                            <a
                                key={item.key}
                                href={`#${item.key}`}
                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-gray-600 hover:text-google-blue hover:bg-gray-50 transition-colors whitespace-nowrap"
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {item.label}
                            </a>
                        );
                    })}
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Eyebrow + title */}
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    {scholarship.provider_type} Scholarship · {scholarship.level || 'All Levels'}
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight leading-tight">
                    {scholarship.title}
                </h1>
                <p className="text-sm text-gray-500 mb-8">{scholarship.provider}{scholarship.state ? ` · ${scholarship.state}` : ''}</p>

                {/* Facts — merged with what used to be a separate "Quick Facts" section
                    further down the page, so all at-a-glance facts live in one place.
                    Rendered as a filtered row list (not a fixed grid) so a field with
                    no data just doesn't produce a row, instead of showing an empty cell. */}
                <div className="bg-white border border-border-gray rounded-2xl px-5 mb-10">
                    {[
                        { k: 'Amount', v: formatAmount(scholarship.amount_annual, scholarship.amount_description) },
                        {
                            k: 'Deadline',
                            v: isAlwaysOpen ? 'Open Year-Round' : formatDeadlineDate(scholarship.deadline, { day: 'numeric', month: 'short' }, 'Check portal'),
                            tone: isDeadlinePassed ? undefined : 'urgent',
                        },
                        {
                            k: 'Status',
                            v: isDeadlinePassed ? 'Closed' : 'Open now',
                            tone: isDeadlinePassed ? undefined : 'success',
                        },
                        { k: 'Provider Type', v: scholarship.provider_type },
                        { k: 'Application Mode', v: scholarship.application_mode, upper: true },
                        {
                            k: scholarship.total_awards > 0 ? 'Total Awards' : 'Last Verified',
                            v: scholarship.total_awards > 0 ? scholarship.total_awards.toLocaleString('en-IN') : (scholarship.verification_year || new Date().getFullYear()),
                        },
                    ]
                        .filter((row) => row.v !== undefined && row.v !== null && row.v !== '')
                        .map((row, i, arr) => (
                            <div
                                key={row.k}
                                className={`flex items-center justify-between gap-4 py-3.5 ${i < arr.length - 1 ? 'border-b border-border-gray' : ''}`}
                            >
                                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">{row.k}</p>
                                <p
                                    className={`text-base font-bold text-right tabular-nums ${row.upper ? 'uppercase' : ''} ${
                                        row.tone === 'urgent' ? 'text-urgent' : row.tone === 'success' ? 'text-success' : 'text-ink'
                                    }`}
                                >
                                    {row.v}
                                </p>
                            </div>
                        ))}
                </div>

                {/* Real, functional secondary action — share/save. No fake lead-gen buttons
                    until IS-76 (lead capture) is actually built. */}
                <div className="mb-10">
                    <ShareButtons title={scholarship.title} url={`https://www.indiascholarships.in/scholarships/${scholarship.slug}`} />
                </div>

                {/* Sibling variants — plain list, not a colored box */}
                {siblingVariants && siblingVariants.length > 0 && (
                    <div className="mb-8 pb-6 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-500 mb-2">There are multiple versions of this scheme — check if one of these fits you better:</p>
                        <div className="flex flex-wrap gap-2">
                            {siblingVariants.map((variant: any) => {
                                const distinguishingState = variant.state && variant.state !== 'All India' && variant.state !== scholarship.state;
                                const label = distinguishingState
                                    ? variant.state
                                    : (variant.caste && variant.caste.length > 0 ? variant.caste.join('/') : 'Alternate');
                                return (
                                    <Link
                                        key={variant.slug}
                                        href={`/scholarships/${variant.slug}`}
                                        className="px-3 py-1.5 border border-gray-200 text-gray-700 hover:border-google-blue hover:text-google-blue text-xs font-bold rounded-sm transition-colors"
                                    >
                                        View {label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {isDeadlinePassed && (
                    <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-md flex gap-3">
                        <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-amber-900 mb-1 text-sm">Status check</p>
                            <p className="text-amber-800 text-sm leading-relaxed">
                                The previous application cycle closed on {new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. The next cycle is expected to open soon — we'll update this page as soon as the official notification is released.
                            </p>
                            <a href="#similar-opportunities" className="mt-2 inline-block text-xs font-bold text-google-blue hover:underline">
                                View active scholarships you can apply for today →
                            </a>
                        </div>
                    </div>
                )}

                {/* Related guide — plain link, points to the unified /guides namespace */}
                {bestFitPillar && (
                    <Link
                        href={`/guides/${bestFitPillar.slug}`}
                        className="mb-10 flex items-center justify-between gap-4 py-3 border-t border-b border-gray-100 hover:text-google-blue transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-4 w-4 text-google-blue shrink-0" />
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Understand the bigger picture</span>
                                <span className="text-sm font-bold text-google-blue">{bestFitPillar.title}</span>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                )}

                {/* About */}
                {scholarship.intro_seo && (
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">About the Program</h2>
                        <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">{scholarship.intro_seo}</p>
                    </section>
                )}

                {/* Benefits */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">Benefits & Financial Support</h2>
                    <p className="text-2xl font-black text-gray-900 mb-2">{formatAmount(scholarship.amount_annual, scholarship.amount_description)}</p>
                    {scholarship.amount_description && (
                        <p className="text-base text-gray-600 leading-relaxed mb-4">
                            {scholarship.amount_description
                                .replace(/['"]?amount_annual_inr['"]?/g, 'annual amount')
                                .replace(/['"]?amount_min_inr['"]?/g, 'minimum stipend')}
                        </p>
                    )}
                    {scholarship.benefits && <FormattedText text={scholarship.benefits} />}
                    {scholarship.special_conditions && (
                        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md flex gap-3">
                            <Info className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            <p className="text-base text-gray-700 leading-relaxed"><strong className="font-bold">Note:</strong> {scholarship.special_conditions}</p>
                        </div>
                    )}
                </section>

                {/* Eligibility — plain bulleted list, not a two-column table */}
                <section id="eligibility" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">Eligibility Criteria & Income Limit</h2>
                    <ul className="space-y-3 text-base text-gray-700 leading-relaxed">
                        <li><strong className="font-bold text-gray-900">Education level:</strong> {scholarship.level}</li>
                        <li><strong className="font-bold text-gray-900">Course / stream:</strong> {scholarship.course_stream.join(', ') || 'Relevant courses'}</li>
                        {scholarship.min_marks > 0 && (
                            <li><strong className="font-bold text-gray-900">Minimum marks:</strong> {scholarship.min_marks}%</li>
                        )}
                        <li id="income-limit" className="scroll-mt-24"><strong className="font-bold text-gray-900">Income limit:</strong> {scholarship.income_limit ? `Up to ₹${(scholarship.income_limit / 100000).toFixed(1)} Lakh/year` : 'No income bar'}</li>
                        <li><strong className="font-bold text-gray-900">Category:</strong> {scholarship.caste.join(', ') || 'Open to all'}</li>
                        <li><strong className="font-bold text-gray-900">Domicile:</strong> {scholarship.state || 'All India'}</li>
                    </ul>
                </section>

                {/* Documents */}
                <section id="documents-required" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">Mandatory Documents Checklist</h2>
                    <ul className="divide-y divide-gray-100">
                        {scholarship.docs_needed.map((doc: string, i: number) => (
                            <li key={i} className="py-2.5 text-sm text-gray-700 flex items-start gap-2.5">
                                <span className="text-gray-400 shrink-0">—</span>
                                <span>{doc}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Selection Process */}
                <section id="selection-process" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">Selection Process</h2>
                    <div className="text-gray-700"><FormattedText text={scholarship.selection} /></div>
                </section>

                {/* Renewal Policy */}
                <section id="renewal-process" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">Renewal Policy</h2>
                    <div className="text-gray-700"><FormattedText text={scholarship.renewal} /></div>
                </section>

                {/* How to Apply — numbered steps */}
                <section id="apply-online" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">How to Apply Online</h2>
                    <p className="text-base text-gray-600 mb-4">
                        Applications are submitted online via <strong className="font-bold text-gray-900">{scholarship.application_mode || 'the official portal'}</strong>. Complete eKYC, upload scanned documents, and submit before the closing date.
                    </p>
                    <FormattedText text={scholarship.step_guide} type="steps" />
                </section>

                {/* Apply Links — the real outbound link lives here, not the hero */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">Apply Links</h2>
                    <div className="border border-gray-200 rounded-md p-5 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 mb-1">Ready to apply?</h4>
                            <p className="text-xs text-gray-500">This takes you to the official portal. IndiaScholarships doesn't process applications or charge any fee.</p>
                        </div>
                        {cleanApplyUrl ? (
                            <a
                                href={cleanApplyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-google-blue border border-google-blue rounded-sm px-4 py-2.5 hover:bg-google-blue hover:text-white transition-colors shrink-0"
                            >
                                Go to official portal ↗
                            </a>
                        ) : (
                            <span className="text-xs font-bold text-gray-400">Official link not available</span>
                        )}
                    </div>
                </section>

                {/* Help & Contact — simple single-column section, right after Apply Links */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">Help & Contact Support</h2>
                    <div className="space-y-2.5 text-sm mb-4">
                        {cleanOfficialSource && (
                            <div className="flex items-center gap-2.5">
                                <Globe className="h-4 w-4 text-google-blue shrink-0" />
                                <a href={cleanOfficialSource} target="_blank" rel="noopener noreferrer" className="text-google-blue font-semibold hover:underline">Visit official portal ↗</a>
                            </div>
                        )}
                        <div className="flex items-center gap-2.5">
                            <Users className="h-4 w-4 text-gray-400 shrink-0" />
                            <span className="text-gray-700">Helpline: {displayHelpline(scholarship.helpline)}</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Not sure if you qualify?</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Link href="/guides" className="px-4 py-2 border border-gray-200 text-gray-700 hover:border-google-blue hover:text-google-blue font-bold text-xs rounded-sm text-center transition-colors">Browse Guides</Link>
                        <Link
                            href={`/eligibility-checker?level=${encodeURIComponent(scholarship.level || '')}&state=${encodeURIComponent(scholarship.state || '')}&caste=${encodeURIComponent(scholarship.caste?.join(',') || '')}&income=${scholarship.income_limit || ''}`}
                            className="px-4 py-2 border border-gray-200 text-gray-700 hover:border-google-blue hover:text-google-blue font-bold text-xs rounded-sm text-center transition-colors"
                        >
                            Check Eligibility
                        </Link>
                    </div>
                </section>

                {/* Deadline */}
                <section id="last-date" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">Official Last Date & Timelines</h2>
                    <p className="text-lg font-bold text-gray-900 mb-1">
                        {isAlwaysOpen ? 'Open Year-Round (Continuous Enrollment)' : formatDeadlineDate(scholarship.deadline, { day: 'numeric', month: 'long', year: 'numeric' }, 'Continuous Enrollment / Check Official Portal')}
                    </p>
                    {scholarship.deadline_description && <p className="text-xs text-gray-500 italic mb-3">{scholarship.deadline_description}</p>}
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Dates are subject to change per the provider's official notification. Apply well before the closing date.
                    </p>
                </section>

                {/* FAQ */}
                {parsedFaqs.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">Common Questions (FAQs)</h2>
                        <div>
                            {parsedFaqs.map((faq: any, i: number) => (
                                <details key={i} className="border-b border-gray-100 py-3 group">
                                    <summary className="cursor-pointer text-sm font-semibold text-gray-900 list-none flex items-center justify-between">
                                        {faq.question || faq.q || 'Common Question'}
                                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 group-open:rotate-90 transition-transform" />
                                    </summary>
                                    <p className="text-base text-gray-600 leading-relaxed mt-2">{faq.answer || faq.a || 'Refer to the official portal for details.'}</p>
                                </details>
                            ))}
                        </div>
                    </section>
                )}

                {/* Related news */}
                {relevantNews.length > 0 && (
                    <section id="portal-updates" className="mb-10 pt-6 border-t border-gray-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                            <Bell className="h-3.5 w-3.5 text-gray-400" /> Scholarship News
                        </h2>
                        <div>
                            {relevantNews.map((news: any) => (
                                <Link key={news.slug} href={`/news/${news.slug}`} className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 hover:underline transition-colors">
                                    <span className="text-sm font-semibold text-google-blue">{news.title}</span>
                                    <span className="text-xs text-gray-400 shrink-0">{news.date}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Related guides */}
                {relevantArticles.length > 0 && (
                    <section id="helpful-guides" className="mb-10 pt-6 border-t border-gray-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">Scholarship Guides</h2>
                        <div>
                            {relevantArticles.map((art: any) => (
                                <Link key={art.slug} href={`/articles/${art.slug}`} className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 hover:underline transition-colors">
                                    <span className="text-sm font-semibold text-google-blue">{art.title}</span>
                                    <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Similar opportunities — real listing cards, matching the Listing template */}
                {relatedScholarships.length > 0 && (
                    <section id="similar-opportunities" className="pt-6 border-t border-gray-100 scroll-mt-24 mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">Similar Opportunities You Can Apply For Today</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedScholarships.map((rel: any) => (
                                <ScholarshipCard key={rel.id} scholarship={rel} viewMode="grid" />
                            ))}
                        </div>
                    </section>
                )}

                {/* Discover more — moved after Similar Opportunities, before Legal Disclaimer */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100">Discover More</h2>
                    <div>
                        <Link href={`/scholarships-level/${getCanonicalSlugForLevel(scholarship.level)}`} className="flex items-center justify-between py-3 border-b border-gray-100 font-semibold text-google-blue hover:underline text-sm transition-colors">
                            For {Array.isArray(scholarship.level) ? scholarship.level[0] : (String(scholarship.level || '').split(',')[0] || 'Students')}
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        </Link>
                        <Link href={`/scholarships-in/${scholarship.state ? slugify(scholarship.state) : 'all-india'}`} className="flex items-center justify-between py-3 border-b border-gray-100 font-semibold text-google-blue hover:underline text-sm transition-colors">
                            In {scholarship.state || 'All India'}
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        </Link>
                        <Link href={`/scholarships-for/${getCanonicalSlugForCategory(scholarship.caste[0])}`} className="flex items-center justify-between py-3 border-b border-gray-100 font-semibold text-google-blue hover:underline text-sm transition-colors">
                            For {scholarship.caste[0] || 'All Categories'}
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        </Link>
                        <Link href={`/scholarships-income/${getCanonicalSlugForIncome(scholarship.income_limit)}`} className="flex items-center justify-between py-3 border-b border-gray-100 font-semibold text-google-blue hover:underline text-sm transition-colors">
                            Income coverage
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        </Link>
                        <Link href={getScholarshipTypeRoute(scholarship.scholarship_type)} className="flex items-center justify-between py-3 font-semibold text-google-blue hover:underline text-sm transition-colors">
                            {scholarship.scholarship_type} listings
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        </Link>
                    </div>
                </section>

                {/* Legal disclaimer — moved to the very end of the article */}
                <section className="pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Legal Disclaimer</h2>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed italic">
                        IndiaScholarships.in attempts to provide accurate information manually curated from official sources. Scholarship details, timelines, and eligibility can change without notice as per the provider's discretion. Applying for a scholarship does not guarantee selection. Always verify all information on the official {scholarship.provider} website before final submission.
                    </p>
                </section>
            </main>

            <Footer />
        </div>
    );
}
