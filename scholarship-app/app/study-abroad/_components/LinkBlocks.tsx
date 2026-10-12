// Automatic link blocks shared by Study Abroad page layouts, built from the database so they stay
// correct as pages are added (docs/study-abroad/templates/LINKING_RULES.md).
import React from 'react';
import Link from 'next/link';
import { COUNTRIES, FUNDS_CALCULATOR, type CardScholarship, type CountrySlug } from '@/lib/study-abroad/data';
import { BANNED } from '@/scripts/lib/sa-inbox';
import { MoreLinks } from './ArticleSections';

const formatDate = (value: string | null | undefined) => {
    if (!value) return '';
    const d = new Date(value.replace(' ', 'T'));
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Same byline on every Study Abroad page (templates/README.md, rule 5)
export const EDITORIAL_TEAM = 'IndiaScholarships Editorial Team';
export function bylineText(checkedAt: string | null | undefined) {
    const checked = formatDate(checkedAt);
    return `By ${EDITORIAL_TEAM}${checked ? ` · Facts checked ${checked}` : ''}`;
}

// A stored value that is really a research note is never shown; readers get a plain "not published"
export const NOT_PUBLISHED = 'Not published by the university';
export const publicValue = (value: string | null | undefined) =>
    value && BANNED.some((rx: RegExp) => rx.test(value)) ? NOT_PUBLISHED : value || null;

export function ScholarshipLinks({ country, scholarships, title }: { country: CountrySlug; scholarships: CardScholarship[]; title?: string }) {
    if (!scholarships.length) return null;
    const c = COUNTRIES[country];
    return (
        <>
            <MoreLinks id="scholarships" title={title || `Scholarships for studying in ${c.name}`} links={scholarships.map(s => ({
                href: `/scholarships/${s.slug}`,
                title: s.title,
                meta: [s.provider, s.deadline ? `Deadline ${s.deadline}` : null].filter(Boolean).join(' · ') || null,
            }))} />
            <Link href={`/study-abroad/study-in/${country}/scholarships`} className="-mt-6 inline-block text-sm font-bold text-google-blue hover:underline">
                All scholarships for {c.name} →
            </Link>
        </>
    );
}

// Sidebar links for the cost section: proof-of-funds calculator and the country's loan pages
export function costLinks(country: CountrySlug) {
    const calc = FUNDS_CALCULATOR[country];
    return [
        ...(calc ? [calc] : []),
        { href: `/study-abroad/study-in/${country}/loans`, label: `Loans and blocked accounts for ${COUNTRIES[country].name}` },
    ];
}
