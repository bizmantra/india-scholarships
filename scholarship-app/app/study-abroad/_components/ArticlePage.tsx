// One Study Abroad article (guide, visa guide, loan comparison or university) on the main site's EditorialTemplate
import React from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import EditorialTemplate from '@/app/components/EditorialTemplate';
import type { EditorialContent } from '@/lib/editorial';
import { breadcrumbJsonLd, type Crumb } from './HubShell';

export default function ArticlePage({ content, crumbs, children, extraJsonLd = [] }: {
    content: EditorialContent; crumbs: Crumb[]; children?: React.ReactNode; extraJsonLd?: object[];
}) {
    const schemas: object[] = [
        {
            '@context': 'https://schema.org', '@type': 'Article', headline: content.title,
            description: content.seoDescription, author: { '@type': 'Organization', name: 'IndiaScholarships' },
            publisher: { '@type': 'Organization', name: 'IndiaScholarships', url: 'https://www.indiascholarships.in' },
        },
        breadcrumbJsonLd(crumbs),
        ...extraJsonLd,
    ];
    if (content.faqs?.length) {
        schemas.push({
            '@context': 'https://schema.org', '@type': 'FAQPage',
            mainEntity: content.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        });
    }
    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
            <Header />
            <EditorialTemplate content={content} breadcrumbs={crumbs}>{children}</EditorialTemplate>
            <Footer />
        </div>
    );
}
