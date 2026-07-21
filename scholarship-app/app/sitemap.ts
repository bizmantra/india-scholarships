import { MetadataRoute } from 'next';
import {
    getAllScholarships,
    getAllStates,
    getAllCategories,
    getIncomeRanges,
    getMajorCourses,
    getAllProviderTypes,
    getScholarshipsByState
} from '@/lib/db';
import { slugify, CANONICAL_LEVELS } from '@/lib/utils';
import { UNIVERSITIES } from '@/lib/universities';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.indiascholarships.in';

    // Static Routes
    const staticRoutes = [
        '',
        '/scholarships',
        '/scholarships/deadlines',
        '/scholarships/recently-added',
        '/scholarships/trending',
        '/state-scholarships',
        '/scholarships-by-category',
        '/scholarships-by-education',
        '/scholarships-by-income',
        '/government-scholarships',
        '/private-scholarships',
        '/corporate-scholarships',
        '/eligibility-checker',
        '/guides',
        '/guides/nsp',
        '/guides/nsp/status-check',
        '/guides/nsp/student-login',
        '/guides/nsp/documents-list',
        '/guides/nsp/schemes',
        '/guides/ssp-karnataka',
        '/guides/ssp-karnataka/status-check',
        '/guides/ssp-karnataka/student-login',
        '/guides/ssp-karnataka/documents-list',
        '/guides/ssp-karnataka/schemes',
        '/guides/e-kalyan-jharkhand',
        '/guides/e-kalyan-jharkhand/status-check',
        '/guides/e-kalyan-jharkhand/student-login',
        '/guides/e-kalyan-jharkhand/documents-list',
        '/guides/e-kalyan-jharkhand/schemes',
        '/guides/digital-gujarat-mysy',
        '/guides/digital-gujarat-mysy/status-check',
        '/guides/digital-gujarat-mysy/student-login',
        '/guides/digital-gujarat-mysy/documents-list',
        '/guides/digital-gujarat-mysy/schemes',
        '/guides/aikyashree-west-bengal',
        '/guides/aikyashree-west-bengal/status-check',
        '/guides/aikyashree-west-bengal/student-login',
        '/guides/aikyashree-west-bengal/documents-list',
        '/guides/aikyashree-west-bengal/schemes',
        '/guides/talliki-vandanam-ap',
        '/guides/talliki-vandanam-ap/status-check',
        '/guides/talliki-vandanam-ap/student-login',
        '/guides/talliki-vandanam-ap/documents-list',
        '/guides/talliki-vandanam-ap/schemes',
        '/guides/mptaas-mmvy-mp',
        '/guides/mptaas-mmvy-mp/status-check',
        '/guides/mptaas-mmvy-mp/student-login',
        '/guides/mptaas-mmvy-mp/documents-list',
        '/guides/mptaas-mmvy-mp/schemes',
        '/guides/e-grantz-kerala',
        '/guides/e-grantz-kerala/status-check',
        '/guides/e-grantz-kerala/student-login',
        '/guides/e-grantz-kerala/documents-list',
        '/guides/e-grantz-kerala/schemes',
        '/guides/tracking',
        '/guides/documents',
        '/about',
        '/scholarships-by-university',
    ].map((route: string) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Scholarship Detail Pages
    const scholarships = await getAllScholarships();
    const scholarshipRoutes = scholarships.map((s: any) => ({
        url: `${baseUrl}/scholarships/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Dynamic State Listing Pages
    const states = await getAllStates();
    const stateRoutes = states.map((state: any) => ({
        url: `${baseUrl}/scholarships-in/${slugify(state)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // Dynamic Category Listing Pages
    const categories = await getAllCategories();
    const categoryRoutes = categories.map((cat: any) => ({
        url: `${baseUrl}/scholarships-for/${slugify(cat)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // Dynamic Education Level Listing Pages
    const levelRoutes = Object.keys(CANONICAL_LEVELS).map((level: string) => ({
        url: `${baseUrl}/scholarships-level/${level}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // Dynamic Level x Country Listing Pages
    const targetLevels = ['phd', 'mba', 'masters', 'undergraduate'];
    const targetCountries = ['usa', 'uk', 'canada', 'australia', 'germany', 'europe', 'japan', 'singapore'];
    const levelCountryRoutes: any[] = [];
    for (const lvl of targetLevels) {
        for (const cnt of targetCountries) {
            levelCountryRoutes.push({
                url: `${baseUrl}/scholarships-for/${lvl}/in/${cnt}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            });
        }
    }

    // Dynamic Income Listing Pages
    const incomeRanges = await getIncomeRanges();
    const incomeRoutes = incomeRanges.map((range: any) => ({
        url: `${baseUrl}/scholarships-income/${range.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }));

    // Dynamic Course Listing Pages
    const courses = getMajorCourses();
    const courseRoutes = courses.map((course: any) => ({
        url: `${baseUrl}/scholarships-by-course/${course.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }));

    // Dynamic Scholarship Subpage Cluster Pages (Fix 3)
    const subpageKeys = [
        'eligibility',
        'income-limit',
        'documents-required',
        'last-date',
        'selection-process',
        'apply-online',
        'renewal-process'
    ];
    const subpageRoutes = [];
    for (const s of scholarships) {
        for (const subpage of subpageKeys) {
            subpageRoutes.push({
                url: `${baseUrl}/scholarships/${s.slug}/${subpage}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.65,
            });
        }
    }

    // Dynamic State Hub Subpage Pages (Filter thin states with < 3 scholarships)
    const stateSubpageRoutes = [];
    for (const state of states) {
        const stateSlug = slugify(state);
        const stateScholarships = await getScholarshipsByState(state);
        if (stateScholarships.length >= 3) {
            for (const subpage of subpageKeys) {
                stateSubpageRoutes.push({
                    url: `${baseUrl}/scholarships-in/${stateSlug}/${subpage}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.6,
                });
            }
        }
    }

    // Dynamic University Listing Pages
    const universityRoutes = UNIVERSITIES.map((uni: any) => ({
        url: `${baseUrl}/scholarships-by-university/${uni.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // Dynamic Localized Scholarship Details and Subpage Cluster Pages
    const locales = ['hi', 'bn', 'ta', 'te', 'or', 'kn'];
    const localizedScholarshipRoutes: any[] = [];
    const localizedSubpageRoutes: any[] = [];

    for (const locale of locales) {
        for (const s of scholarships) {
            localizedScholarshipRoutes.push({
                url: `${baseUrl}/${locale}/scholarships/${s.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.65,
            });

            for (const subpage of subpageKeys) {
                localizedSubpageRoutes.push({
                    url: `${baseUrl}/${locale}/scholarships/${s.slug}/${subpage}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.6,
                });
            }
        }
    }

    return [
        ...staticRoutes,
        ...scholarshipRoutes,
        ...stateRoutes,
        ...categoryRoutes,
        ...levelRoutes,
        ...levelCountryRoutes,
        ...incomeRoutes,
        ...courseRoutes,
        ...subpageRoutes,
        ...stateSubpageRoutes,
        ...universityRoutes,
        // ...localizedScholarshipRoutes,
        // ...localizedSubpageRoutes,
    ];
}
