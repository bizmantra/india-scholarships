import type { Metadata } from 'next';
import ListingShell, { ListingSection } from '../_components/ListingShell';
import SACard, { CardGrid } from '../_components/SACard';
import { TOOLS } from '../_components/tools';
import { SITE, pageTitle } from '@/lib/study-abroad/content';

export const metadata: Metadata = {
    title: pageTitle('Free Study Abroad Calculators for Indian Students'),
    description: 'Free calculators for Indian students going abroad: German blocked account, US I-20 proof of funds, CGPA to German grade, and TCS on foreign remittances.',
    alternates: { canonical: `${SITE}/study-abroad/tools` },
};

export default function ToolsIndex() {
    return (
        <ListingShell crumbs={[{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: 'Calculators' }]}
            title="Study Abroad Calculators" intro={<>Work out the money questions yourself, in rupees. No sign-up and no phone number needed.</>}
            stats={[{ label: 'Calculators', value: String(TOOLS.length), note: 'Free to use', tone: 'blue' }]}>
            <ListingSection id="list" title="All Calculators">
                <CardGrid>{TOOLS.map(t => <SACard key={t.slug} href={`/study-abroad/tools/${t.slug}`} title={t.title} subtitle={t.summary} detail={t.country ? `For ${t.country === 'usa' ? 'the USA' : 'Germany'}` : 'For any country'} cta="Open Calculator →" />)}</CardGrid>
            </ListingSection>
        </ListingShell>
    );
}
