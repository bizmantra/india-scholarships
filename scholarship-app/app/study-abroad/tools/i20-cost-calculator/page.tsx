import type { Metadata } from 'next';
import { getFacts, factNumber } from '@/lib/study-abroad/data';
import { SITE } from '@/lib/study-abroad/content';
import ToolPage from '../../_components/ToolPage';
import I20Calculator from '../../_components/calculators/I20Calculator';

export const revalidate = 86400;
export const metadata: Metadata = {
    title: 'US I-20 Proof of Funds Calculator in INR | IndiaScholarships',
    description: 'Work out how much money you must show for your US F-1 visa, based on your I-20 tuition and living costs, in rupees.',
    alternates: { canonical: `${SITE}/study-abroad/tools/i20-cost-calculator` },
};

export default async function Page() {
    const facts = await getFacts();
    return (
        <ToolPage slug="i20-cost-calculator" facts={['usa.fx.usd_inr', 'usa.visa.sevis_i901_fee_usd', 'usa.visa.f1_mrv_fee_usd'].map(k => facts[k]).filter(Boolean)}>
            <I20Calculator usdToInr={factNumber(facts, 'usa.fx.usd_inr', 83.8)} />
        </ToolPage>
    );
}
