import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const CATEGORY_SLUG_MAP: Record<string, string> = {
    'all categories (sc/st/obc/minority/general) - must possess valid unique disability id (udid) card issued by department for empowerment of persons with disabilities': 'students-with-disabilities',
    'general category - economically weaker section (ews). includes: children of defense personnel (sc/st parents in army/navy/airforce': 'general-ews',
    'government of india.': 'central-government',
    'jco/or/lower ranks - children of unorganized workers (auto drivers)': 'defense-unorganized-workers',
    'semi-nomadic tribes - caste must be in obc list notified by government of india or state government.': 'semi-nomadic-tribes',
    'students with disabilities (persons with disabilities - pwd) with valid udid': 'students-with-disabilities',
    'etc.). general category students with low income. brahmin community students (separate scheme under brahmin development board - verify).': 'general-brahmin',
    'minority communities: muslim': 'minority-muslim',
};

function slugify(text: string): string {
    if (!text) return '';
    const input = text.toString().toLowerCase().trim();

    if (CATEGORY_SLUG_MAP[input]) {
        return CATEGORY_SLUG_MAP[input];
    }

    const slug = input
        .replace(/\(.*\)/g, '')    // Remove content inside parentheses
        .replace(/[:\/\\-]/g, ' ') // Replace special separators with spaces
        .replace(/[^\w\s-]/g, '')  // Remove other non-word chars except spaces/hyphens
        .replace(/\s+/g, '-')      // Replace spaces with -
        .replace(/--+/g, '-')       // Replace multiple - with single -
        .replace(/^-+/, '')         // Trim - from start
        .replace(/-+$/, '');        // Trim - from end

    const words = slug.split('-');
    if (words.length > 6) {
        return words.slice(0, 6).join('-');
    }
    return slug;
}

const CANONICAL_LEVELS = {
    'class-1-10': { label: 'Class 1 to 10', rawLevels: ['Class 1 to Class 10', 'Class 1 to Class 8 (Note: ONLY up to Class 8, unlike SC/ST/OBC which go to Class 10)', 'Class 5-10', 'Class 9, Class 10', 'Class 9-10', 'Pre-Matric (Class 9-10)', 'School (1-5)', 'School (9-10)'] },
    'class-11-12': { label: 'Class 11 & 12', rawLevels: ['Class 11, Class 12', 'Class 11-12', 'Class 10, Class 12', 'Higher Secondary', 'Post-Matric (Class 11-12)', 'School (11-12)'] },
    'diploma-polytechnic': { label: 'Diploma / Polytechnic', rawLevels: ['Diploma', 'Diploma, Undergraduate', 'Diploma/Polytechnic, ITI/ITC', 'Diploma/Polytechnic'] },
    'iti-courses': { label: 'ITI Courses', rawLevels: ['ITI', 'ITI/ITC'] },
    'graduation-ug': { label: 'Graduation (UG)', rawLevels: ['UG', 'Undergraduate', 'Undergraduate (UG)', 'Graduate', 'Bachelor'] },
    'post-graduation-pg': { label: 'Post-Graduation (PG)', rawLevels: ['PG', 'Postgraduate', 'Postgraduate (PG)', 'Master'] },
    'phd-research': { label: 'PhD & Research', rawLevels: ['PhD', 'Doctoral', 'Fellowship', 'Research'] }
};

const BASE_URL = 'https://www.indiascholarships.in';
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const downloadCsv = searchParams.get('download') === 'true';

    const dbPath = path.join(process.cwd(), 'data', 'scholarships.db');
    if (!fs.existsSync(dbPath)) {
        return NextResponse.json({ error: 'Database file not found.' }, { status: 500 });
    }

    const db = new Database(dbPath);

    try {
        const pagesList: any[] = [];

        // 1. Static Routes
        const staticRoutes = [
            { path: '/', title: 'Home Page', priority: '1.0' },
            { path: '/scholarships', title: 'Scholarships Directory', priority: '0.8' },
            { path: '/state-scholarships', title: 'Scholarships by Indian States', priority: '0.8' },
            { path: '/scholarships-by-category', title: 'Scholarships by Category', priority: '0.8' },
            { path: '/scholarships-by-education', title: 'Scholarships by Education Level', priority: '0.8' },
            { path: '/scholarships-by-income', title: 'Scholarships by Family Income Limit', priority: '0.8' },
            { path: '/government-scholarships', title: 'Government Scholarships', priority: '0.8' },
            { path: '/private-scholarships', title: 'Private Scholarships', priority: '0.8' },
            { path: '/corporate-scholarships', title: 'Corporate Scholarships', priority: '0.8' },
            { path: '/eligibility-checker', title: 'Scholarship Eligibility Checker', priority: '0.8' },
            { path: '/guides', title: 'Scholarship Application Guides Hub', priority: '0.8' },
            { path: '/guides/nsp', title: 'National Scholarship Portal (NSP) Guide', priority: '0.8' },
            { path: '/guides/ssp', title: 'State Scholarship Portal (SSP) Guide', priority: '0.8' },
            { path: '/guides/tracking', title: 'Tracking Application Status Guide', priority: '0.8' },
            { path: '/guides/documents', title: 'Required Documents Guide', priority: '0.8' },
            { path: '/about', title: 'About Us', priority: '0.8' }
        ];

        staticRoutes.forEach(r => {
            pagesList.push({
                path: r.path,
                absoluteUrl: `${BASE_URL}${r.path === '/' ? '' : r.path}`,
                pageClass: 'Static Route',
                templateFile: r.path === '/' ? 'app/page.tsx' : `app${r.path}/page.tsx`,
                title: r.title,
                variable: 'None',
                dbId: 'N/A',
                itemCount: 'All',
                priority: r.priority,
                verifiedStatus: 'System',
                completeness: 'Always Complete'
            });
        });

        // 2. Fetch scholarships from DB
        const scholarships: any[] = db.prepare('SELECT id, title, slug, state, level, caste, amount_annual, verified_status, status FROM scholarships').all();

        // 3. Dynamic State listing pages
        const statesResult: any[] = db.prepare(`
            SELECT DISTINCT state FROM scholarships 
            WHERE state IS NOT NULL 
            AND state != '' 
            AND state != 'All India' 
            AND state != 'Multiple States'
            AND state != 'Selected Cities'
            AND state != 'Selected States'
            ORDER BY state
        `).all();
        
        statesResult.forEach(row => {
            const stateName = row.state;
            const slug = slugify(stateName);
            const urlPath = `/scholarships-in/${slug}`;
            const countRow: any = db.prepare('SELECT COUNT(*) as cnt FROM scholarships WHERE state = ?').get(stateName);
            const count = countRow ? countRow.cnt : 0;
            
            pagesList.push({
                path: urlPath,
                absoluteUrl: `${BASE_URL}${urlPath}`,
                pageClass: 'State Hub Listing',
                templateFile: 'app/scholarships-in/[state]/page.tsx',
                title: `Scholarships in ${stateName} 2026 - Apply Online`,
                variable: stateName,
                dbId: 'N/A',
                itemCount: count,
                priority: '0.6',
                verifiedStatus: 'Dynamic',
                completeness: count > 0 ? 'Active content' : 'Empty hub warning'
            });

            // Subpages for State Hub
            const stateSubpageKeys = [
                { key: 'eligibility', name: 'Eligibility Criteria' },
                { key: 'income-limit', name: 'Income Limit Rules' },
                { key: 'documents-required', name: 'Documents Required' },
                { key: 'last-date', name: 'Last Dates & Deadlines' },
                { key: 'selection-process', name: 'Selection Process' },
                { key: 'apply-online', name: 'Apply Online step-guide' },
                { key: 'renewal-process', name: 'Renewal Process' }
            ];

            stateSubpageKeys.forEach(sub => {
                const subPath = `/scholarships-in/${slug}/${sub.key}`;
                pagesList.push({
                    path: subPath,
                    absoluteUrl: `${BASE_URL}${subPath}`,
                    pageClass: `State Hub Subpage (${sub.key})`,
                    templateFile: 'app/scholarships-in/[state]/[subpage]/page.tsx',
                    title: `${stateName} Scholarships ${sub.name} 2026`,
                    variable: `${stateName} - ${sub.name}`,
                    dbId: 'N/A',
                    itemCount: count,
                    priority: '0.6',
                    verifiedStatus: 'Dynamic',
                    completeness: count > 0 ? 'Active content (Dynamic Cluster)' : 'Empty hub warning'
                });
            });
        });

        // 4. Dynamic Category listing pages
        const categoriesSet = new Set<string>();
        scholarships.forEach(row => {
            try {
                const castes = JSON.parse(row.caste);
                if (Array.isArray(castes)) {
                    castes.forEach(c => categoriesSet.add(c));
                } else if (row.caste) {
                    categoriesSet.add(row.caste);
                }
            } catch {
                if (row.caste) categoriesSet.add(row.caste);
            }
        });

        const sortedCategories = Array.from(categoriesSet).sort();
        sortedCategories.forEach(catName => {
            const slug = slugify(catName);
            const urlPath = `/scholarships-for/${slug}`;
            const countRow: any = db.prepare('SELECT COUNT(*) as cnt FROM scholarships WHERE caste LIKE ?').get(`%${catName}%`);
            const count = countRow ? countRow.cnt : 0;

            pagesList.push({
                path: urlPath,
                absoluteUrl: `${BASE_URL}${urlPath}`,
                pageClass: 'Category Hub Listing',
                templateFile: 'app/scholarships-for/[category]/page.tsx',
                title: `Scholarships for ${catName} Students 2026`,
                variable: catName,
                dbId: 'N/A',
                itemCount: count,
                priority: '0.6',
                verifiedStatus: 'Dynamic',
                completeness: count > 0 ? 'Active content' : 'Empty hub warning'
            });
        });

        // 5. Dynamic Education Level listing pages
        Object.keys(CANONICAL_LEVELS).forEach(levelKey => {
            const levelConfig = (CANONICAL_LEVELS as any)[levelKey];
            const urlPath = `/scholarships-level/${levelKey}`;

            const likeClauses = levelConfig.rawLevels.map(() => 'level LIKE ?').join(' OR ');
            const countQuery = `
                SELECT COUNT(*) as cnt FROM scholarships 
                WHERE ${likeClauses}
                OR level LIKE ?
            `;
            const likeParams = levelConfig.rawLevels.map((raw: string) => `%${raw}%`);
            likeParams.push(`%${levelConfig.label}%`);
            const countRow: any = db.prepare(countQuery).get(...likeParams);
            const count = countRow ? countRow.cnt : 0;

            pagesList.push({
                path: urlPath,
                absoluteUrl: `${BASE_URL}${urlPath}`,
                pageClass: 'Education Level Hub Listing',
                templateFile: 'app/scholarships-level/[level]/page.tsx',
                title: `Scholarships for ${levelConfig.label} Students 2026`,
                variable: levelConfig.label,
                dbId: 'N/A',
                itemCount: count,
                priority: '0.6',
                verifiedStatus: 'Dynamic',
                completeness: count > 0 ? 'Active content' : 'Empty hub warning'
            });
        });

        // 6. Dynamic Income listing pages
        const incomeRanges = [
            { label: 'No Income Bar', min: -1, max: 0, slug: 'no-income-bar' },
            { label: '0-1L', min: 1, max: 100000, slug: '0-1l' },
            { label: '1-2.5L', min: 100001, max: 250000, slug: '1-2.5l' },
            { label: '2.5-5L', min: 250001, max: 500000, slug: '2.5-5l' },
            { label: '5L+', min: 500001, max: 10000000, slug: '5l-plus' },
        ];
        incomeRanges.forEach(range => {
            const urlPath = `/scholarships-income/${range.slug}`;
            
            let count = 0;
            if (range.min === -1) {
                const countRow: any = db.prepare("SELECT COUNT(*) as cnt FROM scholarships WHERE (income_limit IS NULL OR income_limit = 0 OR income_limit = '')").get();
                count = countRow ? countRow.cnt : 0;
            } else {
                const countRow: any = db.prepare('SELECT COUNT(*) as cnt FROM scholarships WHERE income_limit >= ? AND income_limit <= ?').get(range.min, range.max);
                count = countRow ? countRow.cnt : 0;
            }

            pagesList.push({
                path: urlPath,
                absoluteUrl: `${BASE_URL}${urlPath}`,
                pageClass: 'Income Hub Listing',
                templateFile: 'app/scholarships-income/[range]/page.tsx',
                title: `Scholarships with ${range.label} Income Limit`,
                variable: range.label,
                dbId: 'N/A',
                itemCount: count,
                priority: '0.5',
                verifiedStatus: 'Dynamic',
                completeness: count > 0 ? 'Active content' : 'Empty hub warning'
            });
        });

        // 7. Dynamic Course listing pages
        const courses = [
            { name: 'Engineering', slug: 'engineering' },
            { name: 'Medical', slug: 'medical' },
            { name: 'Commerce', slug: 'commerce' },
            { name: 'Science', slug: 'science' },
            { name: 'Arts', slug: 'arts' },
            { name: 'Nursing', slug: 'nursing' },
            { name: 'Pharmacy', slug: 'pharmacy' },
            { name: 'Agriculture', slug: 'agriculture' },
            { name: 'Law', slug: 'law' },
            { name: 'Management', slug: 'management' },
        ];
        courses.forEach(course => {
            const urlPath = `/scholarships-by-course/${course.slug}`;
            const countRow: any = db.prepare('SELECT COUNT(*) as cnt FROM scholarships WHERE course_stream LIKE ?').get(`%${course.name}%`);
            const count = countRow ? countRow.cnt : 0;

            pagesList.push({
                path: urlPath,
                absoluteUrl: `${BASE_URL}${urlPath}`,
                pageClass: 'Course Hub Listing',
                templateFile: 'app/scholarships-by-course/[course]/page.tsx',
                title: `Scholarships for ${course.name} Courses 2026`,
                variable: course.name,
                dbId: 'N/A',
                itemCount: count,
                priority: '0.5',
                verifiedStatus: 'Dynamic',
                completeness: count > 0 ? 'Active content' : 'Empty hub warning'
            });
        });

        // 8. Dynamic Scholarship Leaf Pages and Subpages
        const subpages = [
            { key: 'eligibility', name: 'Eligibility Criteria' },
            { key: 'income-limit', name: 'Income Limit' },
            { key: 'documents-required', name: 'Documents Required' },
            { key: 'last-date', name: 'Last Date' },
            { key: 'selection-process', name: 'Selection Process' },
            { key: 'apply-online', name: 'Apply Online Step Guide' },
            { key: 'renewal-process', name: 'Renewal Process' }
        ];

        scholarships.forEach(s => {
            const isLegacy = s.title.startsWith('[LEGACY]') || s.slug.startsWith('legacy-');
            const isVerified = s.verified_status && ['yes', 'verified', 'true'].includes(String(s.verified_status).toLowerCase());
            const completeness = isVerified ? 'Audited & Verified' : 'Draft / Unverified';
            
            // Leaf Page
            const leafPath = `/scholarships/${s.slug}`;
            pagesList.push({
                path: leafPath,
                absoluteUrl: `${BASE_URL}${leafPath}`,
                pageClass: isLegacy ? 'Legacy Scholarship Detail' : 'Scholarship Detail',
                templateFile: 'app/scholarships/[slug]/page.tsx',
                title: `${s.title} 2026 - Apply Online`,
                variable: s.title,
                dbId: s.id,
                itemCount: '1',
                priority: '0.7',
                verifiedStatus: isVerified ? 'Verified' : 'Pending Verification',
                completeness
            });

            // Subpage Clusters
            subpages.forEach(sub => {
                const clusterPath = `/scholarships/${s.slug}/${sub.key}`;
                pagesList.push({
                    path: clusterPath,
                    absoluteUrl: `${BASE_URL}${clusterPath}`,
                    pageClass: `Scholarship Detail Subpage (${sub.key})`,
                    templateFile: 'app/scholarships/[slug]/[subpage]/page.tsx',
                    title: `${s.title} ${sub.name} 2026`,
                    variable: `${s.title} - ${sub.name}`,
                    dbId: s.id,
                    itemCount: '1',
                    priority: '0.65',
                    verifiedStatus: isVerified ? 'Verified' : 'Pending Verification',
                    completeness: `${completeness} (Dynamic Cluster)`
                });
            });
        });

        // 9. Format response based on query params
        if (downloadCsv) {
            // Compile CSV content
            const csvRows = [];
            csvRows.push([
                'Clean Path',
                'Absolute URL',
                'Page Class',
                'Template Code File',
                'Title Tag Template / Active Title',
                'Primary Dynamic Variable',
                'Database Reference ID',
                'Active Scholarships Count',
                'Sitemap Priority',
                'Verification Status',
                'Content Quality Checklist Status'
            ].map(col => `"${col.replace(/"/g, '""')}"`).join(','));

            pagesList.forEach(p => {
                csvRows.push([
                    p.path,
                    p.absoluteUrl,
                    p.pageClass,
                    p.templateFile,
                    p.title,
                    p.variable,
                    p.dbId,
                    p.itemCount,
                    p.priority,
                    p.verifiedStatus,
                    p.completeness
                ].map(col => `"${String(col).replace(/"/g, '""')}"`).join(','));
            });

            const csvContent = csvRows.join('\n');
            
            // Return CSV stream for browser download
            return new Response(csvContent, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': 'attachment; filename="master-page-index.csv"'
                }
            });
        }

        // Return standard JSON response
        return NextResponse.json({ pages: pagesList });

    } catch (error: any) {
        console.error('Error generating SEO audit page data API:', error);
        return NextResponse.json({ error: 'Failed to retrieve page catalog.', details: error.message }, { status: 500 });
    } finally {
        db.close();
    }
}
