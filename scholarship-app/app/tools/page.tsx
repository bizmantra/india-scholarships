import { Suspense } from 'react';
import { getClient } from '@/lib/db';
import ToolsClient from './ToolsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Free Scholarship Tools & Calculators for Indian Students | IndiaScholarships',
    description: 'Use free IndiaScholarships tools to check scholarship eligibility, convert CGPA to percentage, calculate family income limits, estimate scholarship amounts, plan education budgets, and compare EMI for student loans.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/tools',
    },
    openGraph: {
        title: 'Free Scholarship Calculators & Tools | IndiaScholarships',
        description: 'India\'s most complete suite of free scholarship tools — eligibility checker, CGPA converter, income calculator, amount estimator, study cost planner, and EMI calculator.',
        url: 'https://www.indiascholarships.in/tools',
        type: 'website',
    },
};


const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'Are all IndiaScholarships tools free to use?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes — every tool on IndiaScholarships is completely free. There are no sign-ups, paywalls, or hidden charges.',
            },
        },
        {
            '@type': 'Question',
            name: 'Which scholarship tool should I start with?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Start with the Scholarship Eligibility Checker. It takes under 2 minutes and instantly shows which of 200+ schemes you qualify for.',
            },
        },
        {
            '@type': 'Question',
            name: 'How accurate are the eligibility results?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Our tools use verified data from official government portals (NSP, state scholarship portals) and corporate scholarship websites. Always confirm details on the official portal before applying.',
            },
        },
        {
            '@type': 'Question',
            name: 'What is the CGPA to Percentage Converter used for?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Many scholarships specify eligibility as a minimum percentage. Our CGPA to Percentage Converter translates your grade so you can verify you meet the cutoff for scholarship applications.',
            },
        },
        {
            '@type': 'Question',
            name: 'Can I use IndiaScholarships tools on my phone?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Absolutely. All IndiaScholarships tools are fully responsive and designed for mobile. They load fast and work smoothly on any device.',
            },
        },
    ],
};

export default async function ToolsHubPage() {
    const client = getClient();
    const res = await client.execute(`
        SELECT COUNT(*) as total, SUM(amount_annual) as total_value 
        FROM scholarships 
        WHERE status = 'Active'
    `);
    const stats = res.rows[0];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading Tools Hub...</div>}>
                <ToolsClient
                    totalScholarships={Number(stats?.total || 0)}
                    totalValue={Number(stats?.total_value || 0)}
                />
            </Suspense>
        </>
    );
}
