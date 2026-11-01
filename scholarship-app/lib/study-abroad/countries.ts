// Study Abroad country list. Kept free of DB imports so client components (the header) can use it.
// launched:false countries are hidden: isCountry() rejects them, so their routes 404
// and they stay out of static params, sitemap and nav until the launch checklist passes.
export const COUNTRIES = {
    germany: { slug: 'germany', name: 'Germany', currency: 'EUR', scholarshipCountry: 'Germany', launched: true },
    usa: { slug: 'usa', name: 'USA', currency: 'USD', scholarshipCountry: 'United States', launched: true },
    uk: { slug: 'uk', name: 'UK', currency: 'GBP', scholarshipCountry: 'United Kingdom', launched: false },
    canada: { slug: 'canada', name: 'Canada', currency: 'CAD', scholarshipCountry: 'Canada', launched: false },
    australia: { slug: 'australia', name: 'Australia', currency: 'AUD', scholarshipCountry: 'Australia', launched: false },
    ireland: { slug: 'ireland', name: 'Ireland', currency: 'EUR', scholarshipCountry: 'Ireland', launched: false },
} as const;
export type CountrySlug = keyof typeof COUNTRIES;
export const LAUNCHED_COUNTRIES = (Object.keys(COUNTRIES) as CountrySlug[]).filter(c => COUNTRIES[c].launched);
export const isCountry = (slug: string): slug is CountrySlug => slug in COUNTRIES && COUNTRIES[slug as CountrySlug].launched;
