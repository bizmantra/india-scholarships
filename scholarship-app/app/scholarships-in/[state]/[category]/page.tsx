import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByState, getAllStates } from '@/lib/db';
import ScholarshipsList from '@/app/components/ScholarshipsList';
import { slugify, formatDeadlineDate } from '@/lib/utils';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const CATEGORIES = ['sc', 'st', 'obc', 'general', 'minority', 'pwd'];

const CATEGORY_MAP: Record<string, string> = {
    'sc': 'SC',
    'st': 'ST',
    'obc': 'OBC',
    'general': 'General',
    'minority': 'Minority',
    'pwd': 'PWD'
};

// Generate static params for Cartesian product of states × categories
export async function generateStaticParams() {
    const states = await getAllStates();
    const params: Array<{ state: string; category: string }> = [];
    
    for (const state of states) {
        for (const cat of CATEGORIES) {
            params.push({
                state: slugify(state),
                category: cat
            });
        }
    }
    
    return params;
}

// Generate metadata for category-specific state landing page
export async function generateMetadata({ params }: { params: Promise<{ state: string; category: string }> }) {
    try {
        const { state: stateSlug, category: catSlug } = await params;
        const states = await getAllStates();
        const originalState = states.find((s: string) => slugify(s) === stateSlug) || stateSlug;
        
        const catName = CATEGORY_MAP[catSlug.toLowerCase()];
        if (!catName) return { title: 'Scholarships - Not Found' };

        const year = new Date().getFullYear();
        const titleStr = `${catName} Scholarships in ${originalState} ${year}: Apply Online & Eligibility`;
        const descStr = `Find all ${catName} category scholarships in ${originalState}. Comprehensive list of active government and private schemes with eligibility rules, amounts, and deadlines.`;

        return {
            title: titleStr,
            description: descStr,
            alternates: {
                canonical: `https://www.indiascholarships.in/scholarships-in/${stateSlug}/${catSlug.toLowerCase()}`,
            }
        };
    } catch (error) {
        return { title: 'Scholarships - Not Found' };
    }
}

export default async function StateCategoryHubPage({ params }: { params: Promise<{ state: string; category: string }> }) {
    try {
        const { state: stateSlug, category: catSlug } = await params;
        
        const catName = CATEGORY_MAP[catSlug.toLowerCase()];
        if (!catName) return notFound();

        // Resolve original state name
        const states = await getAllStates();
        const stateName = states.find((s: string) => slugify(s) === stateSlug);

        if (!stateName) return redirect('/state-scholarships');

        // Fetch state scholarships
        const allStateScholarships = await getScholarshipsByState(stateName);
        
        // Filter by category dynamically to prevent thin content rendering
        const lowerCategory = catName.toLowerCase();
        const scholarships = allStateScholarships.filter((s: any) => {
            if (s.scholarship_scope && String(s.scholarship_scope).toLowerCase() === 'international') {
                return false;
            }
            const casteArray = s.caste || [];
            const isOpenToAll = casteArray.length === 0 || casteArray.some((c: string) => {
                const cl = c.toLowerCase();
                return cl === 'all' || cl.includes('open to all') || cl.includes('all categories');
            });
            if (isOpenToAll) return true;
            
            return casteArray.some((c: string) => {
                const cLower = c.toLowerCase();
                if (lowerCategory === 'pwd') {
                    return cLower.includes('pwd') || cLower.includes('disabilit');
                }
                if (lowerCategory === 'general') {
                    return cLower.includes('general') || cLower.includes('ews') || cLower.includes('ebc');
                }
                return cLower.includes(lowerCategory);
            });
        });

        if (scholarships.length === 0) {
            // Redirect back to main state hub if no specific schemes exist
            return redirect(`/scholarships-in/${stateSlug}`);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const openCount = scholarships.filter((s: any) => {
            if (!s.deadline) return true;
            const d = new Date(s.deadline);
            return isNaN(d.getTime()) || d >= today;
        }).length;

        return (
            <div className="min-h-screen bg-white">
                <Header />

                <main className="max-w-5xl mx-auto px-4 py-8">
                    {/* Dynamic Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                        <Link href="/" className="hover:text-google-blue">Home</Link>
                        <span>/</span>
                        <Link href="/state-scholarships" className="hover:text-google-blue">States</Link>
                        <span>/</span>
                        <Link href={`/scholarships-in/${stateSlug}`} className="hover:text-google-blue">{stateName}</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{catName} Category</span>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                            {catName} Scholarships in {stateName} 2026
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                            Complete list of active scholarship schemes in {stateName} specifically for {catName} category students. 
                            Found <span className="font-bold text-google-blue">{scholarships.length} verified schemes</span>.
                        </p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                            <h3 className="text-google-blue font-bold mb-1">Total Available</h3>
                            <p className="text-3xl font-extrabold text-blue-900">{scholarships.length}</p>
                            <p className="text-xs text-blue-600 mt-2">SC/ST/OBC/EWS/Minority schemes</p>
                        </div>
                        <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100">
                            <h3 className="text-green-700 font-bold mb-1">Max Benefit</h3>
                            <p className="text-3xl font-extrabold text-green-900">
                                ₹{Math.max(...scholarships.map((s: any) => s.amount_annual || 0)).toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600 mt-2">Per academic year</p>
                        </div>
                        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                            <h3 className="text-emerald-700 font-bold mb-1">Active Now</h3>
                            <p className="text-3xl font-extrabold text-emerald-900">{openCount}</p>
                            <p className="text-xs text-emerald-600 mt-2">Open applications</p>
                        </div>
                    </div>

                    {/* Scholarships List */}
                    <div className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Active {catName} Schemes</h2>
                        <ScholarshipsList 
                            scholarships={allStateScholarships} 
                            showCategoryFilters={true} 
                            initialCategory={catName} 
                        />
                    </div>
                </main>

                <Footer />
            </div>
        );
    } catch (error) {
        return notFound();
    }
}
