import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Terms of Service - IndiaScholarships',
    description: 'Terms of Service for IndiaScholarships. Learn about the rules, guidelines, and terms governing the use of our educational directory.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/terms',
    }
};


export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Terms of Service</span>
                </nav>

                <div className="prose prose-blue max-w-none space-y-6 text-gray-600">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">
                        Terms of Service
                    </h1>

                    <p className="text-sm text-gray-500">Last updated: June 25, 2026</p>

                    <p className="text-lg leading-relaxed">
                        Welcome to IndiaScholarships! By accessing or using our website, located at <Link href="/" className="text-blue-600 hover:underline">indiascholarships.in</Link>, you agree to comply with and be bound by the following Terms of Service. If you do not agree to these terms, please do not use our website.
                    </p>

                    <hr className="my-8 border-gray-200" />

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        1. Use of the Site
                    </h2>
                    <p>
                        IndiaScholarships is a decision engine and directory designed to help students discover and verify educational funding opportunities. You are granted a limited, non-exclusive, revocable license to access and use the information on this website solely for personal, non-commercial purposes.
                    </p>
                    <p>
                        You agree not to use the website for any unlawful purpose or in any way that could interrupt, damage, or impair the performance of the website.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        2. Content Accuracy and Disclaimer
                    </h2>
                    <p>
                        While we strive to provide 100% verified, accurate, and up-to-date information on scholarships, deadlines, eligibility criteria, and application processes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>All content on IndiaScholarships is provided for general informational purposes only.</li>
                        <li>Scholarship requirements, amounts, and deadlines are subject to change by their respective providers at any time without notice.</li>
                        <li><strong>We strongly advise users to double-check details with the official scholarship provider or portal before making any financial or academic decisions.</strong></li>
                    </ul>
                    <p className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg my-4 text-orange-950">
                        <strong>Disclaimer:</strong> IndiaScholarships is not a scholarship provider, is not affiliated with any government department or corporate CSR program unless explicitly stated, and has no control over who receives a scholarship. We do not charge students any fees to search or apply for scholarships.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        3. Limitation of Liability
                    </h2>
                    <p>
                        In no event shall IndiaScholarships, its creators, or partners be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use or inability to use this website, or reliance on any information provided on the website, even if advised of the possibility of such damages.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        4. Intellectual Property
                    </h2>
                    <p>
                        All text, logos, custom databases, and structural designs on IndiaScholarships are the intellectual property of IndiaScholarships and protected by copyright laws. You may not copy, scrape, reproduce, redistribute, or use any portion of our database or custom articles for commercial purposes without prior written consent.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        5. External Links
                    </h2>
                    <p>
                        Our website contains links to third-party websites (such as official scholarship application portals). We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites. By clicking these links, you acknowledge that you are leaving our site and subject to the policies of the external site.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        6. Changes to Terms
                    </h2>
                    <p>
                        We reserve the right to modify these Terms of Service at any time. When we make updates, we will change the "Last updated" date at the top of this page. Your continued use of the website following any changes constitutes your acceptance of the new Terms of Service.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        7. Contact Us
                    </h2>
                    <p>
                        If you have any questions about these Terms of Service, please contact us at: <a href="mailto:contact@indiascholarships.in" className="text-blue-600 hover:underline">contact@indiascholarships.in</a>.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
