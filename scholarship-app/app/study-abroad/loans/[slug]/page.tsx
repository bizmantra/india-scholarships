import type { Metadata } from 'next';
import { getGuide, getGuides } from '@/lib/study-abroad/data';
import { describe, SITE, pageTitle } from '@/lib/study-abroad/content';
import GuideKindPage from '../../_components/GuideKindPage';

export const revalidate = 86400;

export async function generateStaticParams() {
    return (await getGuides('loan')).map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const g = await getGuide('loan', slug);
    if (!g) return {};
    return {
        title: pageTitle(`${g.seo_title || g.title}`),
        description: describe(g, g.title),
        alternates: { canonical: `${SITE}/study-abroad/loans/${g.slug}` },
    };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <GuideKindPage kind="loan" slug={slug} />;
}
