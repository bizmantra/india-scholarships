import type { Metadata } from 'next';
import { getFacts, factNumber, isCountry } from '@/lib/study-abroad/data';
import { SITE, pageTitle } from '@/lib/study-abroad/content';
import ToolPage from '../../_components/ToolPage';
import UkFundsCalculator from '../../_components/calculators/UkFundsCalculator';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: pageTitle('UK Student Visa Proof of Funds Calculator in INR'),
        description: 'Calculate the exact GBP and INR funds required for a UK Student visa, including London vs outside London living costs, 9-month cap, 28-day rule, and IHS.',
        alternates: { canonical: `${SITE}/study-abroad/tools/uk-funds-calculator` },
        ...(isCountry('uk') ? {} : { robots: { index: false, follow: false } }),
    };
}

const FACT_KEYS = [
    'uk.funds.monthly_london_gbp',
    'uk.funds.monthly_outside_london_gbp',
    'uk.funds.max_months',
    'uk.funds.hold_days',
    'uk.funds.hold_window_days',
    'uk.ihs.annual_gbp',
    'uk.fx.gbp_inr',
];

export default async function Page() {
    const facts = await getFacts();
    const usedFacts = FACT_KEYS.map(k => facts[k]).filter(Boolean);
    const checkedAt = usedFacts.map(f => f.checked_at).filter(Boolean).sort().pop() || null;

    return (
        <ToolPage slug="uk-funds-calculator" facts={usedFacts}>
            <UkFundsCalculator
                checkedAt={checkedAt}
                rates={{
                    monthlyLondonGbp: factNumber(facts, 'uk.funds.monthly_london_gbp', 1529),
                    monthlyOutsideLondonGbp: factNumber(facts, 'uk.funds.monthly_outside_london_gbp', 1171),
                    maxMonths: factNumber(facts, 'uk.funds.max_months', 9),
                    holdDays: factNumber(facts, 'uk.funds.hold_days', 28),
                    holdWindowDays: factNumber(facts, 'uk.funds.hold_window_days', 31),
                    ihsAnnualGbp: factNumber(facts, 'uk.ihs.annual_gbp', 776),
                    gbpToInr: factNumber(facts, 'uk.fx.gbp_inr', 123.5),
                }}
            />
        </ToolPage>
    );
}
