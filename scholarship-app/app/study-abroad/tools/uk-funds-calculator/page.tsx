import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFacts, factNumber, isCountry } from '@/lib/study-abroad/data';
import { getRbiRate } from '@/lib/study-abroad/rbi-rate';
import { SITE, pageTitle } from '@/lib/study-abroad/content';
import ToolPage from '../../_components/ToolPage';
import UkFundsCalculator from '../../_components/calculators/UkFundsCalculator';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: pageTitle('UK Student Visa Proof of Funds Calculator in INR'),
        description: 'Calculate the exact GBP and INR funds required for a UK Student visa, including London vs outside London living costs, 9-month cap, 28-day rule, and IHS.',
        alternates: { canonical: `${SITE}/study-abroad/tools/uk-funds-calculator` },
    };
}

const FACT_KEYS = [
    'uk.funds.monthly_london_gbp',
    'uk.funds.monthly_outside_london_gbp',
    'uk.funds.max_months',
    'uk.funds.hold_days',
    'uk.funds.hold_window_days',
    'uk.ihs.annual_gbp',
];

export default async function Page() {
    // The UK is hidden until it launches: a clean 404 (Next marks 404s noindex) and no sitemap entry
    if (!isCountry('uk')) notFound();
    const [facts, fx] = await Promise.all([getFacts(), getRbiRate('GBP')]);
    const usedFacts = FACT_KEYS.map(k => facts[k]).filter(Boolean);
    const checkedAt = usedFacts.map(f => f.checked_at).filter(Boolean).sort().pop() || null;

    return (
        <ToolPage slug="uk-funds-calculator" facts={usedFacts}>
            <UkFundsCalculator
                checkedAt={checkedAt}
                fx={{ asOf: fx.asOf, live: fx.live, sourceUrl: fx.sourceUrl }}
                rates={{
                    // Fallbacks are the HC 584 amounts for applications from 30 November 2026 (Appendix Student ST 12.3), used only if the fact rows are missing
                    monthlyLondonGbp: factNumber(facts, 'uk.funds.monthly_london_gbp', 1570),
                    monthlyOutsideLondonGbp: factNumber(facts, 'uk.funds.monthly_outside_london_gbp', 1203),
                    maxMonths: factNumber(facts, 'uk.funds.max_months', 9),
                    holdDays: factNumber(facts, 'uk.funds.hold_days', 28),
                    holdWindowDays: factNumber(facts, 'uk.funds.hold_window_days', 31),
                    ihsAnnualGbp: factNumber(facts, 'uk.ihs.annual_gbp', 776),
                    gbpToInr: fx.rate,
                }}
            />
        </ToolPage>
    );
}
