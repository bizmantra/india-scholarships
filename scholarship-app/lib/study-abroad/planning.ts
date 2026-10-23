import { COUNTRIES, type CountrySlug } from './data';

export interface StudyAbroadDestination {
    slug: CountrySlug;
    name: string;
    calculator: string;
}

const PLANNING_COUNTRIES: StudyAbroadDestination[] = [
    { slug: 'germany', name: COUNTRIES.germany.name, calculator: '/study-abroad/tools/blocked-account-calculator' },
    { slug: 'usa', name: COUNTRIES.usa.name, calculator: '/study-abroad/tools/i20-cost-calculator' },
];

export function studyAbroadDestinations(scope: string | null | undefined, countryOfStudy: string | null | undefined) {
    const country = (countryOfStudy || '').toLowerCase();
    const international = /international|study.abroad/i.test(scope || '') || Boolean(country && country !== 'india');
    if (!international) return null;

    const destinations = PLANNING_COUNTRIES.filter(({ slug }) => slug === 'germany'
        ? /\bgermany\b/.test(country)
        : /\b(usa|u\.s\.a\.|united states|us)\b/.test(country));
    return destinations;
}
