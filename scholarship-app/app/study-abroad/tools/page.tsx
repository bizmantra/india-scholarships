import type { Metadata } from 'next';
import HubShell, { breadcrumbJsonLd } from '../_components/HubShell';
import { LinkList } from '../_components/blocks';
import { TOOLS } from '../_components/tools';
import { SITE, pageTitle } from '@/lib/study-abroad/content';

export const metadata: Metadata = {
    title: pageTitle('Free Study Abroad Calculators for Indian Students'),
    description: 'Free calculators for Indian students going abroad: German blocked account, US I-20 proof of funds, CGPA to German grade, and TCS on foreign remittances.',
    alternates: { canonical: `${SITE}/study-abroad/tools` },
};

export default function ToolsIndex() {
    const crumbs = [{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: 'Calculators' }];
    return (
        <HubShell crumbs={crumbs} title="Study abroad calculators" jsonLd={[breadcrumbJsonLd(crumbs)]}
            intro="Work out the money questions yourself, in rupees. No sign-up and no phone number needed.">
            <LinkList items={TOOLS.map(t => ({ title: t.title, href: `/study-abroad/tools/${t.slug}`, meta: t.summary }))} />
        </HubShell>
    );
}
