import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllScholarships, getScholarshipBySlug } from '@/lib/db';
import { ExternalLink, ChevronRight } from 'lucide-react';

// Generate static params for all scholarships
export async function generateStaticParams() {
    const scholarships = getAllScholarships();
    return scholarships.map((scholarship: any) => ({
        slug: scholarship.slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const scholarship = getScholarshipBySlug(slug);

    if (!scholarship) {
        return {
            title: 'Scholarship Not Found',
        };
    }

    return {
        title: `${scholarship.title} – Eligibility, Amount & How to Apply`,
        description: `${scholarship.title} details including eligibility, benefits, income limit, application process, and official source.`,
    };
}

export default async function ScholarshipDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const scholarship = getScholarshipBySlug(slug);

    if (!scholarship) {
        notFound();
    }

    // Helper to display value or "Not specified"
    const displayValue = (value: any) => {
        if (value === null || value === undefined || value === '') return 'Not specified';
        return value;
    };

    // Format amount
    const formatAmount = (amount: number | null) => {
        if (!amount) return 'Not specified';
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white">
                <div className="container mx-auto flex h-14 items-center px-4">
                    <Link href="/" className="text-xl font-bold text-blue-700">
                        IndiaScholarships
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link href="/" className="hover:text-blue-700">Scholarships</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-gray-900">{scholarship.title}</span>
                </nav>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {scholarship.title}
                    </h1>
                    <p className="text-sm text-gray-600">
                        Provider: {scholarship.provider} | Type: {scholarship.provider_type}
                    </p>
                </div>

                {/* Quick Facts */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Facts</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Provider:</span>
                            <span className="flex-1 font-medium">{scholarship.provider}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Provider Type:</span>
                            <span className="flex-1 font-medium">{scholarship.provider_type}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Education Level:</span>
                            <span className="flex-1 font-medium">{displayValue(scholarship.level)}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Category:</span>
                            <span className="flex-1 font-medium">{scholarship.caste.join(', ')}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Gender:</span>
                            <span className="flex-1 font-medium">{displayValue(scholarship.gender)}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Applicable State:</span>
                            <span className="flex-1 font-medium">{scholarship.state}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Income Limit:</span>
                            <span className="flex-1 font-medium">
                                {scholarship.income_limit ? `₹${(scholarship.income_limit / 100000).toFixed(1)} Lakh/year` : 'Not specified'}
                            </span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Scholarship Type:</span>
                            <span className="flex-1 font-medium">{displayValue(scholarship.selection)}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Type of Support:</span>
                            <span className="flex-1 font-medium">{displayValue(scholarship.amount_description)}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Scholarship Amount:</span>
                            <span className="flex-1 font-medium">{formatAmount(scholarship.amount_annual)}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Application Mode:</span>
                            <span className="flex-1 font-medium">{scholarship.application_mode}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Official Source:</span>
                            <span className="flex-1 font-medium">
                                <a href={scholarship.official_source} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline inline-flex items-center gap-1">
                                    Official Portal <ExternalLink className="h-3 w-3" />
                                </a>
                            </span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Last Verified:</span>
                            <span className="flex-1 font-medium">
                                {new Date(scholarship.last_verified).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Apply Now CTA */}
                <div className="mb-8">
                    <a
                        href={scholarship.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 bg-blue-700 text-white text-center font-medium rounded hover:bg-blue-800 transition-colors"
                    >
                        Apply Now
                    </a>
                </div>

                <hr className="my-8 border-gray-200" />

                {/* Eligibility Criteria */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Eligibility Criteria</h2>

                    <h3 className="text-sm font-bold text-gray-900 mb-2">Category & Residency</h3>
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Eligible Category:</span>
                            <span className="flex-1">{scholarship.caste.join(', ')}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Domicile Requirement:</span>
                            <span className="flex-1">{displayValue(scholarship.residency_requirement)}</span>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 mb-2">Education</h3>
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Minimum Qualification:</span>
                            <span className="flex-1">{scholarship.level} with {scholarship.min_marks}% marks</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Applicable Courses:</span>
                            <span className="flex-1">{scholarship.course_stream.join(', ')}</span>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 mb-2">Income</h3>
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Annual Family Income Limit:</span>
                            <span className="flex-1">
                                {scholarship.income_limit ? `₹${(scholarship.income_limit / 100000).toFixed(1)} Lakh/year` : 'Not specified'}
                            </span>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 mb-2">Other Conditions</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Age Limit:</span>
                            <span className="flex-1">{displayValue(scholarship.age_limit)}</span>
                        </div>
                        {scholarship.special_conditions && (
                            <div className="flex">
                                <span className="w-40 text-gray-600">Special Conditions:</span>
                                <span className="flex-1">{scholarship.special_conditions}</span>
                            </div>
                        )}
                    </div>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Benefits & Financial Support */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Benefits & Financial Support</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Financial Support Type:</span>
                            <span className="flex-1">{displayValue(scholarship.amount_description)}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Amount Details:</span>
                            <span className="flex-1">
                                {scholarship.amount_min && scholarship.amount_annual
                                    ? `₹${scholarship.amount_min.toLocaleString('en-IN')} - ₹${scholarship.amount_annual.toLocaleString('en-IN')}`
                                    : formatAmount(scholarship.amount_annual)
                                }
                            </span>
                        </div>
                        {scholarship.benefits && (
                            <div className="flex">
                                <span className="w-40 text-gray-600">What You'll Receive:</span>
                                <span className="flex-1">{scholarship.benefits}</span>
                            </div>
                        )}
                        <div className="flex">
                            <span className="w-40 text-gray-600">Duration:</span>
                            <span className="flex-1">{displayValue(scholarship.renewal)}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Disbursement Method:</span>
                            <span className="flex-1">Not specified</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-4 italic">
                        Actual scholarship amount and disbursement are subject to government notifications and may vary by academic year.
                    </p>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Application Process */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Application Process</h2>
                    <ol className="space-y-2 text-sm list-decimal list-inside">
                        {scholarship.step_guide.split(/\d\./).filter((s: string) => s.trim()).map((step: string, i: number) => (
                            <li key={i}>{step.trim()}</li>
                        ))}
                    </ol>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Required Documents */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Required Documents</h2>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                        {scholarship.docs_needed.map((doc: string, i: number) => (
                            <li key={i}>{doc}</li>
                        ))}
                    </ul>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Selection & Renewal */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Selection & Renewal</h2>

                    <h3 className="text-sm font-bold text-gray-900 mb-2">Selection Criteria</h3>
                    <p className="text-sm mb-4">{displayValue(scholarship.selection)}</p>

                    {scholarship.total_awards && (
                        <>
                            <h3 className="text-sm font-bold text-gray-900 mb-2">Total Awards</h3>
                            <p className="text-sm mb-4">{scholarship.total_awards.toLocaleString('en-IN')} scholarships available</p>
                        </>
                    )}

                    <h3 className="text-sm font-bold text-gray-900 mb-2">Renewal Information</h3>
                    <p className="text-sm">{displayValue(scholarship.renewal)}</p>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Important Dates */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Important Dates</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Application Deadline:</span>
                            <span className="flex-1">
                                {scholarship.deadline
                                    ? new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                                    : 'Varies yearly'
                                }
                            </span>
                        </div>
                        {scholarship.deadline_description && (
                            <div className="flex">
                                <span className="w-40 text-gray-600">Note:</span>
                                <span className="flex-1">{scholarship.deadline_description}</span>
                            </div>
                        )}
                    </div>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Help & Official Contact */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Help & Official Contact</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Official Website:</span>
                            <span className="flex-1">
                                <a href={scholarship.official_source} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline inline-flex items-center gap-1">
                                    {scholarship.official_source} <ExternalLink className="h-3 w-3" />
                                </a>
                            </span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Helpline:</span>
                            <span className="flex-1">{displayValue(scholarship.helpline)}</span>
                        </div>
                    </div>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Disclaimer */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Disclaimer</h2>
                    <p className="text-sm text-gray-700">
                        Scholarship details are based on publicly available information. Eligibility, benefits, and timelines may change as per official notifications. Applicants are advised to verify details on the official website before applying.
                    </p>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Related Scholarships */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Related Scholarships</h2>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link href="/government-scholarships" className="text-blue-700 hover:underline">
                                Other scholarships by {scholarship.provider_type}
                            </Link>
                        </li>
                        <li>
                            <Link href={`/scholarships-level/${scholarship.level.toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-700 hover:underline">
                                Scholarships for {scholarship.level} students
                            </Link>
                        </li>
                        <li>
                            <Link href={`/scholarships-for/${scholarship.caste[0].toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-700 hover:underline">
                                Scholarships for {scholarship.caste[0]} category
                            </Link>
                        </li>
                        <li>
                            <Link href={`/scholarships-in/${scholarship.state.toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-700 hover:underline">
                                Scholarships in {scholarship.state}
                            </Link>
                        </li>
                    </ul>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                    <p>© 2025 IndiaScholarships. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
