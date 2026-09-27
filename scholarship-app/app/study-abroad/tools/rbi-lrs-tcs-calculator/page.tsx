import type { Metadata } from 'next';
import { SITE } from '@/lib/study-abroad/content';
import ToolPage from '../../_components/ToolPage';
import RbiLrsTcsCalculator from '../../_components/calculators/RbiLrsTcsCalculator';

export const metadata: Metadata = {
    title: 'TCS on Foreign Remittance Calculator for Education (LRS) | IndiaScholarships',
    description: 'Calculate the TCS (tax collected at source) on money sent abroad for education under RBI\'s LRS, with and without an education loan.',
    alternates: { canonical: `${SITE}/study-abroad/tools/rbi-lrs-tcs-calculator` },
};

export default function Page() {
    return <ToolPage slug="rbi-lrs-tcs-calculator"><RbiLrsTcsCalculator /></ToolPage>;
}
