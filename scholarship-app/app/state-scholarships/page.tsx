import { getAllStates, getStateScholarshipCounts } from '@/lib/db';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import StateScholarshipsClient from './StateScholarshipsClient';

export const metadata = {
    title: 'State Scholarships 2026 - Browse Schemes by Domicile State | IndiaScholarships',
    description: 'Explore state-specific post-matric scholarships, fee reimbursements, and welfare grants across all 36 Indian states and UTs. Find official portal guides and deadlines.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/state-scholarships',
    }
};

export default async function StateScholarshipsPage() {
    const states = await getAllStates();
    const countsMap = await getStateScholarshipCounts();

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main>
                <StateScholarshipsClient statesList={states} countsMap={countsMap} />
            </main>
            <Footer />
        </div>
    );
}
