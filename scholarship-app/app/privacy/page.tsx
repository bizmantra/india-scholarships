import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Privacy Policy - IndiaScholarships',
    description: 'Privacy Policy for IndiaScholarships. Learn about how we handle user data, cookie usage, and our Google AdSense advertising disclosures.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/privacy',
    }
};


export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Privacy Policy</span>
                </nav>

                <div className="prose prose-blue max-w-none space-y-6 text-gray-600">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">
                        Privacy Policy
                    </h1>

                    <p className="text-sm text-gray-500">Last updated: June 25, 2026</p>

                    <p className="text-lg leading-relaxed">
                        At IndiaScholarships, accessible from <Link href="/" className="text-blue-600 hover:underline">indiascholarships.in</Link>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by IndiaScholarships and how we use it.
                    </p>

                    <p>
                        If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="mailto:contact@indiascholarships.in" className="text-blue-600 hover:underline">contact@indiascholarships.in</a>.
                    </p>

                    <hr className="my-8 border-gray-200" />

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        Google DoubleClick DART Cookie & AdSense Disclosures
                    </h2>
                    <p>
                        Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.indiascholarships.in and other sites on the internet.
                    </p>
                    <p className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg my-4 text-blue-900">
                        <strong>Important:</strong> Visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-800">https://policies.google.com/technologies/ads</a>.
                    </p>
                    <p>
                        Some of the advertisers on our site may use cookies and web beacons. Our advertising partners include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Google AdSense</strong> (Privacy policy link: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Advertising Policies</a>)</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        Privacy Policies of Third-Party Advertisers
                    </h2>
                    <p>
                        Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on IndiaScholarships, which are sent directly to users' browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
                    </p>
                    <p>
                        Note that IndiaScholarships has no access to or control over these cookies that are used by third-party advertisers.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        Information We Collect
                    </h2>
                    <p>
                        The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
                    </p>
                    <p>
                        If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        How We Use Your Information
                    </h2>
                    <p>
                        We use the information we collect in various ways, including to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Provide, operate, and maintain our website</li>
                        <li>Improve, personalize, and expand our website</li>
                        <li>Understand and analyze how you use our website</li>
                        <li>Develop new products, services, features, and functionality</li>
                        <li>Communicate with you, either directly or through one of our partners, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
                        <li>Send you emails</li>
                        <li>Find and prevent fraud</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        Log Files
                    </h2>
                    <p>
                        IndiaScholarships follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        CCPA Privacy Rights (Do Not Sell My Personal Information)
                    </h2>
                    <p>
                        Under the CCPA, among other rights, California consumers have the right to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
                        <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
                        <li>Request that a business that sells a consumer's personal data, not sell the consumer's personal data.</li>
                    </ul>
                    <p>
                        If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        GDPR Data Protection Rights
                    </h2>
                    <p>
                        We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>The right to access</strong> – You have the right to request copies of your personal data. We may charge you a small fee for this service.</li>
                        <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.</li>
                        <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.</li>
                        <li><strong>The right to restrict processing</strong> – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                        <li><strong>The right to object to processing</strong> – You have the right to object to our processing of your personal data, under certain conditions.</li>
                        <li><strong>The right to data portability</strong> – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        Children's Information
                    </h2>
                    <p>
                        Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
                    </p>
                    <p>
                        IndiaScholarships does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
