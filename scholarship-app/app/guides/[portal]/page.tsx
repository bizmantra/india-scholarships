import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { PORTALS_DATA } from '@/lib/portalsData';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { getPillarBySlug, getAllPillars } from '@/lib/pillars';
// Pillars now resolve under /guides too (taxonomy decision: Guides/Articles/Pillars are all
// one Editorial content type at the URL level). Reusing the existing Pillar page component
// as-is rather than duplicating its rendering — /pillars/[slug] redirects here (next.config.ts).
import PillarPage from '@/app/pillars/[slug]/page';
// Same for the remaining 24 unique Articles (the 4 duplicates already redirect straight to
// their matching Portal Guide, so they never reach this branch) — /articles/[slug] redirects
// here (next.config.ts).
import ArticlePage from '@/app/articles/[slug]/page';
import { getArticleBySlug, getAllArticles } from '@/lib/articles';
// IS-113 — unified Editorial renderer + Portal Guide adapter, used by all Portal Guides.
import EditorialTemplate from '@/app/components/EditorialTemplate';
import { portalGuideToEditorial } from '@/lib/editorial';

// Generate static params for all portal guides + aliases + pillars
export async function generateStaticParams() {
    const params: Array<{ portal: string }> = [];

    Object.values(PORTALS_DATA).forEach(p => {
        params.push({ portal: p.id });
        p.aliases.forEach(alias => {
            params.push({ portal: alias });
        });
    });

    getAllPillars().forEach(p => {
        params.push({ portal: p.slug });
    });

    getAllArticles().forEach(a => {
        params.push({ portal: a.slug });
    });

    return params;
}

// Generate dynamic metadata
export async function generateMetadata({ params }: { params: Promise<{ portal: string }> }): Promise<Metadata> {
    const { portal } = await params;
    const key = portal.toLowerCase();

    const data = Object.values(PORTALS_DATA).find(p => p.id === key || p.aliases.includes(key));

    if (!data) {
        // Not a portal — check if it's a Pillar (built the metadata inline rather than
        // delegating to the Pillar page's own generateMetadata, since that sets the
        // canonical to /pillars/... and this needs /guides/... instead).
        const pillar = getPillarBySlug(key);
        if (pillar) {
            return {
                title: pillar.seoTitle ? `${pillar.seoTitle} | IndiaScholarships.in` : `${pillar.title} | IndiaScholarships.in`,
                description: pillar.seoDescription || pillar.takeaways[0] || `Complete guide to ${pillar.title}.`,
                alternates: {
                    canonical: `https://www.indiascholarships.in/guides/${pillar.slug}`,
                },
            };
        }

        // Not a Pillar either — check if it's an Article. Same reasoning: build metadata
        // inline with a /guides/... canonical rather than delegating to the Article page's
        // own generateMetadata, which still points at /articles/....
        const article = getArticleBySlug(key);
        if (article) {
            return {
                title: article.seoTitle ? `${article.seoTitle} | IndiaScholarships.in` : `${article.title} | IndiaScholarships.in`,
                description: article.seoDescription || article.takeaways[0] || `Step-by-step guide on ${article.title} for Indian students.`,
                alternates: {
                    canonical: `https://www.indiascholarships.in/guides/${article.slug}`,
                },
            };
        }

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
        // Not a portal guide — delegate to the Pillar renderer if this slug is a Pillar.
        // Reuses the existing component as-is; only the URL changed, not the rendering.
        if (getPillarBySlug(key)) {
            return <PillarPage params={Promise.resolve({ slug: key })} />;
        }
        // Not a Pillar either — try the 24 unique Articles the same way.
        if (getArticleBySlug(key)) {
            return <ArticlePage params={Promise.resolve({ slug: key })} />;
        }
        notFound();
    }

    if (key !== data.id) {
        redirect(`/guides/${data.id}`);
    }

    // IS-113: all Portal Guides now render through the unified EditorialTemplate (via
    // portalGuideToEditorial adapter), proven first on ssp-karnataka alone, now rolled out
    // to all 8. HowTo + FAQ JSON-LD schema preserved from the legacy render path below.
    const editorialContent = portalGuideToEditorial(data);
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
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': data.faqs.map(f => ({
            '@type': 'Question',
            'name': f.q,
            'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
        }))
    };

    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <Header />
            <EditorialTemplate
                content={editorialContent}
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Guides', href: '/guides' },
                    { label: data.name },
                ]}
            />
            <Footer />
        </div>
    );
}

