import { useMemo } from 'react';
import Link from 'next/link';
import { CheckCircle2, MapPin, Globe, Users, ShieldCheck, GraduationCap, IndianRupee, Target, ArrowRight } from 'lucide-react';
import ScholarshipCard from './components/ScholarshipCard';
import Header from './components/Header';
import Footer from './components/Footer';

interface Scholarship {
    id: number;
    slug: string;
    title: string;
    provider: string;
    state: string;
    caste: string[];
    amount_annual: number;
    amount_min?: number;
    deadline?: string;
    application_mode: string;
    level: string;
    last_verified: string;
    income_limit?: number;
    is_popular?: number;
    created_at?: string;
}

interface HomeClientProps {
    scholarships: Scholarship[];
}

export default function HomeClient({ scholarships }: HomeClientProps) {
    // Get featured/popular scholarships (limit to 6)
    const featuredScholarships = useMemo(() => {
        return scholarships
            .filter(s => s.is_popular === 1)
            .slice(0, 6);
    }, [scholarships]);

    // Calculate stats for states count
    const stats = useMemo(() => {
        const uniqueStates = new Set(scholarships.map(s => s.state).filter(Boolean));
        return {
            totalStates: uniqueStates.size,
        };
    }, [scholarships]);

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative bg-white pt-20 pb-16 md:pt-32 md:pb-24 border-b border-gray-100 overflow-hidden text-center">
                    <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                        <h1 className="text-4xl md:text-7xl font-black text-gray-900 tracking-tight mb-8 font-serif leading-[1.1]">
                            Scholarships in India – Find Verified & Updated Opportunities
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
                            Discover government and private scholarships in India for school, college, and higher education students. <span className="text-blue-700 font-bold italic">Search by class, state, category, income, and more — all in one place.</span>
                        </p>

                        <div className="flex justify-center">
                            <Link
                                href="/scholarships"
                                className="inline-flex items-center justify-center px-10 py-5 bg-blue-700 text-white rounded-2xl font-black text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 active:scale-95"
                            >
                                Find Scholarships Now
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Feature Cards Section */}
                <section className="py-12 bg-gray-50/50 border-b border-gray-100">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {[
                                { title: `Verified Scholarships`, desc: 'Dated stamps & multi-source verified' },
                                { title: 'Smart Matching', desc: 'Based on income, caste, and grades' },
                                { title: 'Actionable Guides', desc: 'Step-by-step application support' }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4 group p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="bg-green-100 p-3 rounded-2xl h-fit shrink-0 group-hover:bg-green-200 transition-colors">
                                        <CheckCircle2 className="h-6 w-6 text-green-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1 text-lg">{feature.title}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Intro Section */}
                <section className="py-20 bg-white border-b border-gray-100">
                    <div className="container mx-auto px-6 max-w-4xl text-center md:text-left">
                        <div className="space-y-8">
                            <p className="text-xl md:text-3xl text-gray-800 font-medium leading-relaxed font-serif">
                                IndiaScholarships.in helps students and parents easily find legitimate scholarships in India without confusion, false promises, or outdated information.
                            </p>
                            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                                We track scholarships from central government, state governments, private organizations, trusts, and foundations, and link directly to official application portals.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Browse Section */}
                <section className="py-24 container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-3 font-serif tracking-tight text-gray-900">Find Scholarships Based on Your Need</h2>
                        <p className="text-gray-500 text-lg font-medium">Browse opportunities by category, state, and eligibility</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                        {[
                            {
                                icon: MapPin,
                                title: 'State-wise Scholarships in India',
                                description: 'Find scholarships in your state',
                                href: '/state-scholarships',
                                color: 'blue',
                                count: stats.totalStates
                            },
                            {
                                icon: Globe,
                                title: 'Government Scholarships',
                                description: 'State & National level schemes',
                                href: '/government-scholarships',
                                color: 'emerald',
                                count: null
                            },
                            {
                                icon: Users,
                                title: 'Scholarships for SC / ST / OBC / Minority Students',
                                description: 'Category-specific programs',
                                href: '/scholarships-by-category',
                                color: 'purple',
                                count: null
                            },
                            {
                                icon: ShieldCheck,
                                title: 'Private Scholarships',
                                description: 'Foundation & NGO programs',
                                href: '/private-scholarships',
                                color: 'indigo',
                                count: null
                            },
                            {
                                icon: GraduationCap,
                                title: 'Scholarships After 10th / 12th',
                                description: 'School & Higher Secondary',
                                href: '/scholarships-by-education',
                                color: 'green',
                                count: null
                            },
                            {
                                icon: IndianRupee,
                                title: 'Scholarships for Low Income Families',
                                description: 'Based on family income',
                                href: '/scholarships-by-income',
                                color: 'orange',
                                count: null
                            }
                        ].map((tile, i) => {
                            const Icon = tile.icon;
                            const colorClasses = {
                                blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 shadow-blue-100/50',
                                emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 shadow-emerald-100/50',
                                purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100 shadow-purple-100/50',
                                indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 shadow-indigo-100/50',
                                green: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-100 shadow-green-100/50',
                                orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100 shadow-orange-100/50'
                            };

                            return (
                                <Link
                                    key={i}
                                    href={tile.href}
                                    className={`group p-8 border-2 rounded-[2.5rem] transition-all hover:-translate-y-2 hover:shadow-2xl ${colorClasses[tile.color as keyof typeof colorClasses]}`}
                                >
                                    <div className="flex flex-col h-full">
                                        <Icon className="h-12 w-12 mb-6" />
                                        <h3 className="text-xl font-black mb-3 leading-tight">{tile.title}</h3>
                                        <p className="text-sm opacity-80 mb-6 flex-grow font-medium leading-relaxed">{tile.description}</p>
                                        {tile.count && (
                                            <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-4">{tile.count} states covered</p>
                                        )}
                                        <div className="flex items-center gap-2 font-bold text-sm">
                                            View Opportunities <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="max-w-4xl mx-auto bg-gray-50 rounded-[3rem] p-8 md:p-12 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ul className="space-y-4">
                                {[
                                    { label: "Scholarships After 10th Class", href: "/scholarships-level/class-1-10" },
                                    { label: "Scholarships After 12th Class", href: "/scholarships-level/class-11-12" },
                                    { label: "Undergraduate (UG) Scholarships", href: "/scholarships-level/graduation-ug" },
                                    { label: "Postgraduate (PG) Scholarships", href: "/scholarships-level/post-graduation-pg" }
                                ].map((item, i) => (
                                    <li key={i}>
                                        <Link href={item.href} className="flex items-center gap-3 font-bold text-gray-700 hover:text-blue-700 transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <ul className="space-y-4">
                                {[
                                    { label: "Scholarships for Girl Students", href: "/scholarships?gender=Female" },
                                    { label: "For SC / ST / OBC Students", href: "/scholarships-by-category" },
                                    { label: "For Low Income Families", href: "/scholarships-by-income" },
                                    { label: "More State Scholarships", href: "/state-scholarships" }
                                ].map((item, i) => (
                                    <li key={i}>
                                        <Link href={item.href} className="flex items-center gap-3 font-bold text-gray-700 hover:text-blue-700 transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Featured Scholarships Section */}
                <section className="py-24 container mx-auto px-6 bg-gray-50 rounded-[4rem] mb-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-3 font-serif tracking-tight text-gray-900">Featured Scholarships</h2>
                        <p className="text-gray-500 text-lg font-medium">Most searched and high-impact opportunities</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {featuredScholarships.map((scholarship) => (
                            <ScholarshipCard
                                key={scholarship.id}
                                scholarship={scholarship}
                                viewMode="grid"
                            />
                        ))}
                    </div>

                    <div className="text-center">
                        <Link
                            href="/scholarships"
                            className="inline-flex items-center gap-2 px-10 py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all shadow-xl active:scale-95"
                        >
                            View All Scholarships <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </section>

                {/* Eligibility Checker CTA */}
                <section className="py-24 bg-gradient-to-br from-blue-700 to-blue-900 text-white relative overflow-hidden">
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <div className="max-w-3xl mx-auto">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl mb-8 border border-white/20">
                                <Target className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-6 font-serif tracking-tight">
                                Not sure which scholarships you qualify for?
                            </h2>
                            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Take our 2-minute eligibility quiz and get a personalized list of scholarships matched to your profile based on income, caste, state, and academic performance.
                            </p>
                            <Link
                                href="/eligibility-checker"
                                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-700 font-black text-lg rounded-[2rem] hover:bg-blue-50 transition-all transform hover:-translate-y-1 shadow-2xl active:scale-95"
                            >
                                Check My Eligibility <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-[0.03] rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.05] rounded-full translate-x-1/3 translate-y-1/3" />
                </section>

                {/* Content Guide Section */}
                <section className="py-24 bg-white border-b border-gray-100">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <h2 className="text-3xl md:text-5xl font-black mb-12 font-serif text-gray-900 tracking-tight leading-tight">
                            Scholarships in India – Complete Guide for Students
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-600 leading-relaxed text-lg">
                            <p>
                                Scholarships in India are financial assistance programs designed to help students continue their education without financial burden. These scholarships are offered by the Central Government, State Governments, private institutions, NGOs, trusts, and corporate foundations.
                            </p>
                            <p>
                                Students can apply for scholarships at different stages of education, including school level, pre-university, undergraduate, postgraduate, and doctoral programs. Many scholarships are awarded based on merit, family income, category (SC/ST/OBC/Minority), gender, disability, or state of residence.
                            </p>
                        </div>

                        <div className="mt-12 p-10 bg-gray-50 border border-gray-100 rounded-[3rem]">
                            <p className="text-xl text-gray-800 leading-relaxed mb-8 font-medium">
                                On IndiaScholarships.in, students can search scholarships that match their education level and eligibility, check last dates and deadlines, understand eligibility criteria, benefits, and required documents, and apply safely through official scholarship portals.
                            </p>
                            <p className="text-lg text-gray-500 leading-relaxed italic">
                                Missing deadlines or applying to the wrong scholarship is common. Our goal is to make scholarship discovery simple, transparent, and reliable for every student in India.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Why Use Section */}
                <section className="py-24 bg-gray-50 border-b border-gray-100">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <h2 className="text-4xl font-black text-gray-900 mb-14 font-serif tracking-tight">
                            Why Use IndiaScholarships.in?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                            {[
                                "Regularly updated scholarship information",
                                "Direct links to official application portals only",
                                "Covers central, state, and private scholarships",
                                "No login required",
                                "Completely free for students"
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="mt-1 bg-blue-700 rounded-full p-1 shrink-0">
                                        <CheckCircle2 className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-lg font-bold text-gray-800 leading-tight">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 pt-10 border-t border-gray-200 text-center">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Disclaimer</p>
                            <p className="text-sm text-gray-500 leading-relaxed italic max-w-2xl mx-auto">
                                IndiaScholarships.in is not a government website. We aim to help students discover and understand scholarship opportunities available in India.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 md:py-32 container mx-auto px-6 max-w-4xl">
                    <h2 className="text-4xl font-black text-gray-900 mb-16 text-center font-serif tracking-tight">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-12">
                        {[
                            {
                                q: "Who can apply for scholarships in India?",
                                a: "Students studying in school, college, or higher education, depending on eligibility such as income, category, gender, or academic performance."
                            },
                            {
                                q: "Are these scholarships genuine?",
                                a: "Yes. We list scholarships sourced from official government portals and trusted private organizations."
                            },
                            {
                                q: "Is IndiaScholarships.in free to use?",
                                a: "Yes. There is no cost and no registration required."
                            },
                            {
                                q: "Do you help with application submission?",
                                a: "We guide students to the official application website and explain the process clearly."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="group">
                                <h3 className="text-2xl font-black text-gray-900 mb-4 flex gap-4 transition-colors group-hover:text-blue-700">
                                    <span className="text-blue-200 font-serif italic text-4xl leading-none">Q.</span>
                                    {faq.q}
                                </h3>
                                <p className="text-lg text-gray-600 pl-14 leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer Note Section */}
                <section className="py-16 bg-white border-t border-gray-50 italic">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <p className="text-gray-500 text-sm leading-relaxed max-w-3xl mx-auto">
                            IndiaScholarships.in is an independent information platform built to help students discover scholarship opportunities across India. Always verify details on the official application portal before applying.
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
