import { MetadataRoute } from 'next';
import {
    getAllScholarships,
    getAllStates,
    getAllCategories,
    getIncomeRanges,
    getMajorCourses,
    getScholarshipsByState
} from '@/lib/db';
import { slugify, CANONICAL_LEVELS, isSubpageQualifying } from '@/lib/utils';
import { UNIVERSITIES } from '@/lib/universities';

import { getAllArticles } from '@/lib/articles';
import { getAllNews } from '@/lib/news';

export async function generateSitemaps() {
    return [
        { id: 'core' },
        { id: 'scholarships' },
        { id: 'subpages' },
        { id: 'states' },
        { id: 'taxonomies' },
    ];
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.indiascholarships.in';

    const subpageKeys = [
        'eligibility',
        'income-limit',
        'documents-required',
        'last-date',
        'selection-process',
        'apply-online',
        'renewal-process'
    ];

    if (id === 'core') {
        const articles = getAllArticles();
        const articleRoutes = articles.map(art => `/articles/${art.slug}`);

        const news = getAllNews();
        const newsRoutes = news.map(n => `/news/${n.slug}`);

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
            '/articles',
            ...articleRoutes,
            '/news',
            ...newsRoutes,
            '/guides',
            '/guides/nsp',
            '/guides/nsp/status-check',
            '/guides/nsp/student-login',
            '/guides/nsp/documents-list',
            '/guides/nsp/scholarships-list',
            '/guides/ssp-karnataka',
            '/guides/ssp-karnataka/status-check',
            '/guides/ssp-karnataka/student-login',
            '/guides/ssp-karnataka/documents-list',
            '/guides/ssp-karnataka/scholarships-list',
            '/guides/e-kalyan-jharkhand',
            '/guides/e-kalyan-jharkhand/status-check',
            '/guides/e-kalyan-jharkhand/student-login',
            '/guides/e-kalyan-jharkhand/documents-list',
            '/guides/e-kalyan-jharkhand/scholarships-list',
            '/guides/digital-gujarat-mysy',
            '/guides/digital-gujarat-mysy/status-check',
            '/guides/digital-gujarat-mysy/student-login',
            '/guides/digital-gujarat-mysy/documents-list',
            '/guides/digital-gujarat-mysy/scholarships-list',
            '/guides/aikyashree-west-bengal',
            '/guides/aikyashree-west-bengal/status-check',
            '/guides/aikyashree-west-bengal/student-login',
            '/guides/aikyashree-west-bengal/documents-list',
            '/guides/aikyashree-west-bengal/scholarships-list',
            '/guides/talliki-vandanam-ap',
            '/guides/talliki-vandanam-ap/status-check',
            '/guides/talliki-vandanam-ap/student-login',
            '/guides/talliki-vandanam-ap/documents-list',
            '/guides/talliki-vandanam-ap/scholarships-list',
            '/guides/mptaas-mmvy-mp',
            '/guides/mptaas-mmvy-mp/status-check',
            '/guides/mptaas-mmvy-mp/student-login',
            '/guides/mptaas-mmvy-mp/documents-list',
            '/guides/mptaas-mmvy-mp/scholarships-list',
            '/guides/e-grantz-kerala',
            '/guides/e-grantz-kerala/status-check',
            '/guides/e-grantz-kerala/student-login',
            '/guides/e-grantz-kerala/documents-list',
            '/guides/e-grantz-kerala/scholarships-list',
            '/guides/tracking',
            '/guides/documents',
            '/about',
            '/scholarships-by-university',
        ];

        return staticRoutes.map((route: string) => ({
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: route === '' ? 1 : 0.8,
        }));
    }

    if (id === 'scholarships') {
        const scholarships = await getAllScholarships();
        return scholarships.map((s: any) => ({
            url: `${baseUrl}/scholarships/${s.slug}`,
            lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    }

    if (id === 'subpages') {
        const scholarships = await getAllScholarships();
        const subpageRoutes: MetadataRoute.Sitemap = [];
        for (const s of scholarships) {
            if (isSubpageQualifying(s)) {
                for (const subpage of subpageKeys) {
                    subpageRoutes.push({
                        url: `${baseUrl}/scholarships/${s.slug}/${subpage}`,
                        lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
                        changeFrequency: 'weekly' as const,
                        priority: 0.65,
                    });
                }
            }
        }
        return subpageRoutes;
    }

    if (id === 'states') {
        const states = await getAllStates();
        const stateRoutes: MetadataRoute.Sitemap = [];

        for (const state of states) {
            const stateSlug = slugify(state);
            stateRoutes.push({
                url: `${baseUrl}/scholarships-in/${stateSlug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            });

            const stateScholarships = await getScholarshipsByState(state);
            if (stateScholarships.length >= 3) {
                for (const subpage of subpageKeys) {
                    stateRoutes.push({
                        url: `${baseUrl}/scholarships-in/${stateSlug}/${subpage}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly' as const,
                        priority: 0.6,
                    });
                }
            }
        }
        return stateRoutes;
    }

    if (id === 'taxonomies') {
        const routes: MetadataRoute.Sitemap = [];

        // Categories
        const categories = await getAllCategories();
        categories.forEach((cat: any) => {
            routes.push({
                url: `${baseUrl}/scholarships-for/${slugify(cat)}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            });
        });

        // Education levels
        Object.keys(CANONICAL_LEVELS).forEach((level: string) => {
            routes.push({
                url: `${baseUrl}/scholarships-level/${level}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            });
        });

        // Level x Country combinations
        const targetLevels = ['phd', 'mba', 'masters', 'undergraduate'];
        const targetCountries = ['usa', 'uk', 'canada', 'australia', 'germany', 'europe', 'japan', 'singapore'];
        for (const lvl of targetLevels) {
            for (const cnt of targetCountries) {
                routes.push({
                    url: `${baseUrl}/scholarships-for/${lvl}/in/${cnt}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.6,
                });
            }
        }

        // Income ranges
        const incomeRanges = await getIncomeRanges();
        incomeRanges.forEach((range: any) => {
            routes.push({
                url: `${baseUrl}/scholarships-income/${range.slug}`,
                lastModified: new Date(),
                changeFrequency: 'monthly' as const,
                priority: 0.5,
            });
        });

        // Major courses
        const courses = getMajorCourses();
        courses.forEach((course: any) => {
            routes.push({
                url: `${baseUrl}/scholarships-by-course/${course.slug}`,
                lastModified: new Date(),
                changeFrequency: 'monthly' as const,
                priority: 0.5,
            });
        });

        // Universities
        UNIVERSITIES.forEach((uni: any) => {
            routes.push({
                url: `${baseUrl}/scholarships-by-university/${uni.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            });
        });

        return routes;
    }

    return [];
}
