export interface Crumb { label: string; href?: string }

export function breadcrumbJsonLd(crumbs: Crumb[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem', position: i + 1, name: c.label,
            ...(c.href ? { item: `https://www.indiascholarships.in${c.href}` } : {}),
        })),
    };
}

export const faqJsonLd = (faqs: { q: string; a: string }[]) => faqs.length ? [{
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}] : [];
