import type { Metadata } from 'next';
import { SITE, pageTitle } from '@/lib/study-abroad/content';
import ToolPage from '../../_components/ToolPage';
import BavarianGradeCalculator from '../../_components/calculators/BavarianGradeCalculator';

export const metadata: Metadata = {
    title: pageTitle('CGPA to German Grade Converter (Bavarian Formula)'),
    description: 'Convert your Indian CGPA or percentage to the German grading scale (1.0 to 4.0) using the Bavarian formula German universities apply.',
    alternates: { canonical: `${SITE}/study-abroad/tools/bavarian-grade-calculator` },
};

export default function Page() {
    return <ToolPage slug="bavarian-grade-calculator"><BavarianGradeCalculator /></ToolPage>;
}
