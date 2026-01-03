import EligibilityCheckerClient from './EligibilityClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Scholarship Eligibility Checker | IndiaScholarships',
    description: 'Find scholarships you qualify for in 2 minutes. Check eligibility based on state, category, income, and education level. 100% free tool.',
};

export default function EligibilityCheckerPage() {
    return <EligibilityCheckerClient />;
}
