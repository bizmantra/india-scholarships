import { getAllScholarships } from '@/lib/db';
import DeadlinesClient from './DeadlinesClient';

export const metadata = {
    title: 'Scholarship Deadlines & Closing Dates 2026 | IndiaScholarships',
    description: 'Track live upcoming scholarship application deadlines, closing dates, and remaining days. Filter by state, category/caste, and eligibility.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/scholarships/deadlines',
    }
};


export default async function DeadlinesTrackerPage() {
    const scholarships = await getAllScholarships();
    
    return <DeadlinesClient scholarships={scholarships} />;
}
