import Link from 'next/link';
import { studyAbroadDestinations } from '@/lib/study-abroad/planning';

export default function StudyAbroadPlan({ scope, countryOfStudy }: { scope?: string | null; countryOfStudy?: string | null }) {
    const destinations = studyAbroadDestinations(scope, countryOfStudy);
    if (!destinations) return null;

    return (
        <section className="pt-6 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 font-heading">Plan your study abroad</h2>
            <p className="text-sm text-gray-600 mb-4">Use these guides to plan your next steps. Check this scholarship&apos;s eligibility before choosing a university or program.</p>
            {destinations.length ? destinations.map(destination => (
                <div key={destination.slug} className="mb-5">
                    <h3 className="font-bold text-gray-900 mb-2">Study in {destination.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <Link href={`/study-abroad/study-in/${destination.slug}`} className="py-2 text-sm font-semibold text-google-blue hover:underline">Plan your study in {destination.name} →</Link>
                        <Link href={`/study-abroad/study-in/${destination.slug}/universities`} className="py-2 text-sm font-semibold text-google-blue hover:underline">Compare universities →</Link>
                        <Link href={destination.calculator} className="py-2 text-sm font-semibold text-google-blue hover:underline">Estimate study costs →</Link>
                        <Link href={`/study-abroad/study-in/${destination.slug}/visas`} className="py-2 text-sm font-semibold text-google-blue hover:underline">Understand the visa steps →</Link>
                    </div>
                </div>
            )) : (
                <Link href="/scholarships/international" className="text-sm font-semibold text-google-blue hover:underline">Explore international scholarships →</Link>
            )}
        </section>
    );
}
