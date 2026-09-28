import type { Metadata } from 'next';
import { getFacts, factNumber } from '@/lib/study-abroad/data';
import { SITE } from '@/lib/study-abroad/content';
import ToolPage from '../../_components/ToolPage';
import BlockedAccountCalculator from '../../_components/calculators/BlockedAccountCalculator';

export const revalidate = 86400;
export const metadata: Metadata = {
    title: 'Germany Blocked Account Calculator in INR | IndiaScholarships',
    description: 'Calculate the rupee amount for your German blocked account (Sperrkonto), including Expatrio, Fintiba and Coracle fees and bank transfer charges.',
    alternates: { canonical: `${SITE}/study-abroad/tools/blocked-account-calculator` },
};

const PROVIDERS = [
    { id: 'expatrio', name: 'Expatrio', freeInsurance: true },
    { id: 'fintiba', name: 'Fintiba', freeInsurance: false },
    { id: 'coracle', name: 'Coracle', freeInsurance: true },
];

export default async function Page() {
    const facts = await getFacts();
    const used = ['germany.blocked_account.annual_eur', 'germany.blocked_account.monthly_withdrawal_eur', 'germany.blocked_account.buffer_eur', 'germany.fx.eur_inr',
        ...PROVIDERS.flatMap(p => [`germany.blocked_account.${p.id}_setup_eur`, `germany.blocked_account.${p.id}_monthly_eur`])];
    return (
        <ToolPage slug="blocked-account-calculator" facts={used.map(k => facts[k]).filter(Boolean)}>
            <BlockedAccountCalculator
                monthlyWithdrawalEur={factNumber(facts, 'germany.blocked_account.monthly_withdrawal_eur', 992)}
                bufferEur={factNumber(facts, 'germany.blocked_account.buffer_eur', 100)}
                eurToInr={factNumber(facts, 'germany.fx.eur_inr', 90.5)}
                providers={PROVIDERS.map(p => ({
                    ...p,
                    feeEur: factNumber(facts, `germany.blocked_account.${p.id}_setup_eur`, 0),
                    monthlyEur: factNumber(facts, `germany.blocked_account.${p.id}_monthly_eur`, 0),
                }))}
            />
        </ToolPage>
    );
}
