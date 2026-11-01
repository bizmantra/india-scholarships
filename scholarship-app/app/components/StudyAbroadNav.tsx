'use client';

// Section menu shown under the main header on /study-abroad pages only.
// Lists the launched countries; when the page belongs to a country, that country's sections follow it.
import Link from 'next/link';
import { COUNTRIES, LAUNCHED_COUNTRIES, isCountry, type CountrySlug } from '@/lib/study-abroad/countries';

const COUNTRY_SECTIONS = [
    { label: 'Universities', path: 'universities' },
    { label: 'Visas', path: 'visas' },
    { label: 'Loans', path: 'loans' },
    { label: 'Scholarships', path: 'scholarships' },
];

// Country pages keep the country in the second path segment: /study-abroad/{study-in|programs|program-detail}/{country}/...
function countryFromPath(pathname: string): CountrySlug | null {
    const [, , kind, slug] = pathname.split('/');
    if (!['study-in', 'programs', 'program-detail'].includes(kind)) return null;
    return slug && isCountry(slug) ? slug : null;
}

export default function StudyAbroadNav({ pathname }: { pathname: string }) {
    const country = countryFromPath(pathname);
    const linkClass = (active: boolean) =>
        `shrink-0 px-1 py-2 transition-colors ${active ? 'text-violet-800 font-bold' : 'text-gray-600 hover:text-violet-800'}`;

    return (
        <nav aria-label="Study Abroad" className="w-full border-b-2 border-violet-600 bg-violet-50/60">
            <div className="container mx-auto flex items-center gap-5 px-4 h-10 overflow-x-auto scrollbar-none whitespace-nowrap text-xs font-semibold">
                <Link href="/study-abroad" className={linkClass(pathname === '/study-abroad')}>Home</Link>
                {LAUNCHED_COUNTRIES.map(c => (
                    <span key={c} className="flex items-center gap-5">
                        <Link href={`/study-abroad/study-in/${c}`} className={linkClass(pathname === `/study-abroad/study-in/${c}`)}>
                            {COUNTRIES[c].name}
                        </Link>
                        {country === c && COUNTRY_SECTIONS.map(s => {
                            const href = `/study-abroad/study-in/${c}/${s.path}`;
                            return <Link key={s.path} href={href} className={linkClass(pathname === href)}>{s.label}</Link>;
                        })}
                    </span>
                ))}
                <span className="h-4 w-px bg-violet-200 shrink-0" aria-hidden="true" />
                <Link href="/study-abroad/tools" className={linkClass(pathname.startsWith('/study-abroad/tools'))}>Cost calculators</Link>
                <Link href="/scholarships/international" className={linkClass(false)}>Scholarships abroad</Link>
            </div>
        </nav>
    );
}
