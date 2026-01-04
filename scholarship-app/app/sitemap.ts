import { MetadataRoute } from 'next';
import {
    getAllScholarships,
    getAllStates,
    getAllCategories,
    CANONICAL_LEVELS,
    getIncomeRanges,
    getMajorCourses,
    getAllProviderTypes
} from '@/lib/db';
import { slugify } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.indiascholarships.in';

    // Static Routes
    const staticRoutes = [
        '',
        '/scholarships',
        '/state-scholarships',
        '/scholarships-by-category',
        '/scholarships-by-education',
        '/scholarships-by-income',
        '/government-scholarships',
        '/private-scholarships',
        '/corporate-scholarships',
        '/eligibility-checker',
        '/guides',
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Scholarship Detail Pages
    const scholarships = getAllScholarships();
    const scholarshipRoutes = scholarships.map(s => ({
        url: `${baseUrl}/scholarships/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Dynamic State Listing Pages
    const states = getAllStates();
    const stateRoutes = states.map(state => ({
        url: `${baseUrl}/scholarships-in/${slugify(state)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // Dynamic Category Listing Pages
    const categories = getAllCategories();
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
    const incomeRanges = getIncomeRanges();
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

    return [
        ...staticRoutes,
        ...scholarshipRoutes,
        ...stateRoutes,
        ...categoryRoutes,
        ...levelRoutes,
        ...incomeRoutes,
        ...courseRoutes,
    ];
}
