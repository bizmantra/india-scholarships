import type { Metadata } from 'next';
import { SITE, pageTitle } from '@/lib/study-abroad/content';
import ToolPage from '../../_components/ToolPage';
import RbiLrsTcsCalculator from '../../_components/calculators/RbiLrsTcsCalculator';

export const metadata: Metadata = {
    title: pageTitle('TCS on Foreign Remittance Calculator for Education (LRS)'),
    description: 'Calculate the TCS (tax collected at source) on money sent abroad for education under RBI\'s LRS, with and without an education loan.',
    alternates: { canonical: `${SITE}/study-abroad/tools/rbi-lrs-tcs-calculator` },
};

export default function Page() {
    return <ToolPage slug="rbi-lrs-tcs-calculator"><RbiLrsTcsCalculator /></ToolPage>;
}
