import { COUNTRIES, isCountry, type CountrySlug } from './data';

export interface StudyAbroadDestination {
    slug: CountrySlug;
    name: string;
    calculator: string;
}

// Which scholarship country_of_study values point at each destination. Only launched countries are offered.
const PLANNING_COUNTRIES: (StudyAbroadDestination & { matches: RegExp })[] = [
    { slug: 'germany', name: COUNTRIES.germany.name, calculator: '/study-abroad/tools/blocked-account-calculator', matches: /\bgermany\b/ },
    { slug: 'usa', name: COUNTRIES.usa.name, calculator: '/study-abroad/tools/i20-cost-calculator', matches: /\b(usa|u\.s\.a\.|united states|us)\b/ },
    { slug: 'uk', name: COUNTRIES.uk.name, calculator: '/study-abroad/tools/uk-funds-calculator', matches: /\b(uk|u\.k\.|united kingdom)\b/ },
];

export function studyAbroadDestinations(scope: string | null | undefined, countryOfStudy: string | null | undefined) {
    const country = (countryOfStudy || '').toLowerCase();
    const international = /international|study.abroad/i.test(scope || '') || Boolean(country && country !== 'india');
    if (!international) return null;

    const destinations = PLANNING_COUNTRIES.filter(({ slug, matches }) => isCountry(slug) && matches.test(country));
    return destinations;
}
