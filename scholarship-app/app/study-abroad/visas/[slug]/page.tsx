import type { Metadata } from 'next';
import { getGuide, getGuides } from '@/lib/study-abroad/data';
import { describe, SITE } from '@/lib/study-abroad/content';
import GuideKindPage from '../../_components/GuideKindPage';

export const revalidate = 86400;

export async function generateStaticParams() {
    return (await getGuides('visa')).map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const g = await getGuide('visa', slug);
    if (!g) return {};
    return {
        title: `${g.seo_title || g.title} | IndiaScholarships`,
        description: describe(g, g.title),
        alternates: { canonical: `${SITE}/study-abroad/visas/${g.slug}` },
    };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <GuideKindPage kind="visa" slug={slug} />;
}
