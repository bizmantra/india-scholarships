import { MetadataRoute } from 'next';
import {
    getAllScholarships,
    getAllStates,
    getAllCategories,
    getIncomeRanges,
    getMajorCourses,
    getAllProviderTypes
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
        '/guides/ssp',
        '/guides/tracking',
        '/guides/documents',
        '/about',
        '/scholarships-by-university',
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Scholarship Detail Pages
    const scholarships = await getAllScholarships();
    const scholarshipRoutes = scholarships.map(s => ({
        url: `${baseUrl}/scholarships/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Dynamic State Listing Pages
    const states = await getAllStates();
    const stateRoutes = states.map(state => ({
        url: `${baseUrl}/scholarships-in/${slugify(state)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // Dynamic Category Listing Pages
    const categories = await getAllCategories();
    const categoryRoutes = categories.map(cat => ({
        url: `${baseUrl}/scholarships-for/${slugify(cat)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // Dynamic Education Level Listing Pages
    const levelRoutes = Object.keys(CANONICAL_LEVELS).map(level => ({
        url: `${baseUrl}/scholarships-level/${level}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // Dynamic Income Listing Pages
    const incomeRanges = await getIncomeRanges();
    const incomeRoutes = incomeRanges.map(range => ({
        url: `${baseUrl}/scholarships-income/${range.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }));

    // Dynamic Course Listing Pages
    const courses = getMajorCourses();
    const courseRoutes = courses.map(course => ({
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

    // Dynamic State Hub Subpage Pages
    const stateSubpageRoutes = [];
    for (const state of states) {
        const stateSlug = slugify(state);
        for (const subpage of subpageKeys) {
            stateSubpageRoutes.push({
                url: `${baseUrl}/scholarships-in/${stateSlug}/${subpage}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            });
        }
    }

    // Dynamic University Listing Pages
    const universityRoutes = UNIVERSITIES.map(uni => ({
        url: `${baseUrl}/scholarships-by-university/${uni.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // Dynamic Localized Scholarship Details and Subpage Cluster Pages
    const locales = ['hi', 'bn', 'ta', 'te', 'or'];
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
        ...incomeRoutes,
        ...courseRoutes,
        ...subpageRoutes,
        ...stateSubpageRoutes,
        ...universityRoutes,
        ...localizedScholarshipRoutes,
        ...localizedSubpageRoutes,
    ];
}
