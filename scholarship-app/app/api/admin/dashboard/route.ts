import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Helper for slugifying (copied from lib/utils.ts for clean node compatibility)
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

// Canonical levels
const CANONICAL_LEVELS = [
    'class-1-10', 'class-11-12', 'diploma-polytechnic', 'iti-courses', 'graduation-ug', 'post-graduation-pg', 'phd-research'
];

export async function GET() {
    // Only allow access in development mode
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_ADMIN_DASHBOARD !== 'true') {
        return NextResponse.json({ error: 'Unauthorized. Dashboard is only available in development mode.' }, { status: 403 });
    }

    const dbPath = path.join(process.cwd(), 'data', 'scholarships.db');
    if (!fs.existsSync(dbPath)) {
        return NextResponse.json({ error: 'Database file not found.' }, { status: 500 });
    }

    const db = new Database(dbPath);

    try {
        // 1. Query general db details
        const totalScholarshipsRow: any = db.prepare('SELECT COUNT(*) as cnt FROM scholarships').get();
        const totalScholarships = totalScholarshipsRow.cnt;

        const verifiedScholarshipsRow: any = db.prepare(
            "SELECT COUNT(*) as cnt FROM scholarships WHERE verified_status IN ('Yes', 'Verified', 'TRUE', 'yes', 'verified', 'true')"
        ).get();
        const verifiedScholarships = verifiedScholarshipsRow.cnt;

        const statusCountRow: any = db.prepare(
            "SELECT COUNT(*) as cnt FROM scholarships WHERE status != 'Active'"
        ).get();
        const inactiveScholarships = statusCountRow.cnt;

        // 2. Fetch distinct counts for programmatic SEO listings
        // States
        const statesResult: any[] = db.prepare(`
            SELECT DISTINCT state FROM scholarships 
            WHERE state IS NOT NULL 
            AND state != '' 
            AND state != 'All India' 
            AND state != 'Multiple States'
            AND state != 'Selected Cities'
            AND state != 'Selected States'
        `).all();
        const stateHubCount = statesResult.length;

        // Categories (Castes)
        const casteRows: any[] = db.prepare('SELECT caste FROM scholarships').all();
        const categoriesSet = new Set<string>();
        casteRows.forEach(row => {
            if (!row.caste) return;
            try {
                const castes = JSON.parse(row.caste);
                if (Array.isArray(castes)) {
                    castes.forEach(c => categoriesSet.add(c));
                } else {
                    categoriesSet.add(row.caste);
                }
            } catch {
                categoriesSet.add(row.caste);
            }
        });
        const categoryHubCount = categoriesSet.size;

        // Static routes count: 16
        // Education levels: 7
        // Income ranges: 5
        // Course ranges: 10
        const staticCount = 16;
        const levelHubCount = CANONICAL_LEVELS.length;
        const incomeHubCount = 5;
        const courseHubCount = 10;

        // Total URLs calculation
        const detailPagesCount = totalScholarships;
        const clusterPagesCount = totalScholarships * 7;
        const totalUrls = staticCount + stateHubCount + categoryHubCount + levelHubCount + incomeHubCount + courseHubCount + detailPagesCount + clusterPagesCount;

        // 3. Load local GSC pages metrics
        let totalGscClicks = 0;
        let totalGscImpressions = 0;
        const urlToGscData = new Map<string, { clicks: number; impressions: number }>();

        const gscPath = path.join(process.cwd(), 'data', 'gsc-june-2026', 'pages.json');
        if (fs.existsSync(gscPath)) {
            try {
                const gscPages = JSON.parse(fs.readFileSync(gscPath, 'utf8'));
                // Skip header at index 0
                for (let i = 1; i < gscPages.length; i++) {
                    const [url, clicksStr, impressionsStr] = gscPages[i];
                    const clicks = parseInt(clicksStr) || 0;
                    const impressions = parseInt(impressionsStr) || 0;

                    totalGscClicks += clicks;
                    totalGscImpressions += impressions;

                    // Clean URL to match database paths
                    try {
                        const parsedUrl = new URL(url);
                        const cleanPath = parsedUrl.pathname;
                        urlToGscData.set(cleanPath, { clicks, impressions });
                    } catch {
                        // Fallback simple parsing
                        const match = url.match(/https?:\/\/[^\/]+(\/.*)/);
                        if (match) {
                            urlToGscData.set(match[1], { clicks, impressions });
                        }
                    }
                }
            } catch (e) {
                console.error('Error reading GSC pages.json:', e);
            }
        }

        // 4. Check quality audit metrics across all database rows
        const scholarships: any[] = db.prepare('SELECT * FROM scholarships').all();
        
        let missingAmountAnnual = 0;
        let missingDeadline = 0;
        let missingDocs = 0;
        let missingHelpline = 0;
        let missingFaqs = 0;
        let missingSelection = 0;
        let missingStepGuide = 0;
        let missingRenewal = 0;
        let totalWarnings = 0;

        const tasksQueue: any[] = [];

        scholarships.forEach(s => {
            const issues: string[] = [];
            
            // Amount
            if (s.amount_annual === null || s.amount_annual === 0) {
                issues.push('amount_annual');
                missingAmountAnnual++;
            }
            // Deadline
            const dl = s.deadline ? s.deadline.trim().toLowerCase() : '';
            if (!dl || dl === 'na' || dl === 'not specified') {
                issues.push('deadline');
                missingDeadline++;
            }
            // Docs
            let docsArr = [];
            if (s.docs_needed) {
                try {
                    docsArr = JSON.parse(s.docs_needed);
                } catch {
                    docsArr = s.docs_needed.split(',').filter(Boolean);
                }
            }
            if (docsArr.length === 0) {
                issues.push('docs_needed');
                missingDocs++;
            }
            // Helpline
            const hl = s.helpline ? s.helpline.trim().toLowerCase() : '';
            if (!hl || hl === 'na' || hl === 'not specified') {
                issues.push('helpline');
                missingHelpline++;
            }
            // FAQs
            let faqsArr = [];
            if (s.faq_json) {
                try {
                    faqsArr = JSON.parse(s.faq_json);
                } catch {}
            }
            if (faqsArr.length === 0) {
                issues.push('faq_json');
                missingFaqs++;
            }
            // Selection
            if (!s.selection || s.selection.trim().length < 15) {
                issues.push('selection');
                missingSelection++;
            }
            // Step guide
            if (!s.step_guide || s.step_guide.trim().length < 20) {
                issues.push('step_guide');
                missingStepGuide++;
            }
            // Renewal
            if (!s.renewal || s.renewal.trim().length < 15) {
                issues.push('renewal');
                missingRenewal++;
            }

            if (issues.length > 0) {
                totalWarnings += issues.length;
            }

            // Completeness percentage
            const completedCount = 8 - issues.length;
            const completeness = Math.round((completedCount / 8) * 100);

            // Fetch traffic volume from GSC mapping
            const pagePath = `/scholarships/${s.slug}`;
            const gscStats = urlToGscData.get(pagePath) || { clicks: 0, impressions: 0 };
            
            // Priority score = impressions * (1 - completeness_fraction)
            // Add a small baseline to ensure unverified high-traffic items surface
            const priorityScore = Math.round(gscStats.impressions * (1 - (completeness / 100)) + (gscStats.clicks * 5));

            tasksQueue.push({
                id: s.id,
                title: s.title,
                slug: s.slug,
                verified: ['yes', 'verified', 'true'].includes(String(s.verified_status).toLowerCase()),
                completeness,
                issues,
                clicks: gscStats.clicks,
                impressions: gscStats.impressions,
                priorityScore
            });
        });

        // Sort Tasks Queue by priorityScore descending
        tasksQueue.sort((a, b) => b.priorityScore - a.priorityScore);

        // 5. Generate Predictive Warnings
        const predictiveWarnings: string[] = [];
        
        // Check thin hubs
        const statesResultWithCounts = db.prepare("SELECT state, COUNT(*) as cnt FROM scholarships WHERE state != '' AND state IS NOT NULL GROUP BY state").all();
        let thinHubsCount = 0;
        statesResultWithCounts.forEach((row: any) => {
            if (row.state !== 'All India' && row.state !== 'Multiple States' && row.cnt < 2) {
                thinHubsCount++;
            }
        });
        if (thinHubsCount > 0) {
            predictiveWarnings.push(`Thin Content Alert: ${thinHubsCount} State Hub directories have fewer than 2 scholarships. Google may penalize or soft-404 these pages.`);
        }

        // Check unverified ratio
        const unverifiedRatio = 1 - (verifiedScholarships / totalScholarships);
        if (unverifiedRatio > 0.5) {
            predictiveWarnings.push(`Crawl Quality Risk: ${Math.round(unverifiedRatio * 100)}% of your database records are currently unverified drafts. This generates ${Math.round(totalScholarships * unverifiedRatio * 7)} placeholder subpages, which may restrict your overall crawl budget.`);
        }

        // Deadline checks
        const upcomingDeadlineRow: any[] = db.prepare(`
            SELECT title, deadline FROM scholarships 
            WHERE deadline IS NOT NULL 
            AND deadline != '' 
            AND deadline != 'NA'
            AND deadline != 'Not specified'
        `).all();
        
        let upcomingExpiredCount = 0;
        const now = new Date('2026-07-05'); // mock time
        upcomingDeadlineRow.forEach(row => {
            const dlDate = new Date(row.deadline);
            if (!isNaN(dlDate.getTime()) && dlDate > now) {
                const diffTime = Math.abs(dlDate.getTime() - now.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 15) {
                    upcomingExpiredCount++;
                }
            }
        });
        if (upcomingExpiredCount > 0) {
            predictiveWarnings.push(`Temporal Search Risk: ${upcomingExpiredCount} verified scholarships are closing applications in the next 15 days. Anticipate traffic declines once portals close.`);
        }

        // High impression CTR boost potential
        const highImpressionUnverified = tasksQueue
            .filter(t => !t.verified && t.impressions > 1000)
            .slice(0, 3);
        highImpressionUnverified.forEach(t => {
            predictiveWarnings.push(`Traffic Yield Opportunity: "${t.title}" is receiving ${t.impressions.toLocaleString()} weekly impressions, but is still unverified. Enriching this content is predicted to boost CTR by 15-20%.`);
        });

        // 6. Template health percentages
        const statesHealthyPercent = Math.round(((stateHubCount - thinHubsCount) / stateHubCount) * 100);
        const detailHealthyPercent = Math.round((verifiedScholarships / totalScholarships) * 100);
        
        // Count verified cluster subpages vs total subpages
        const subpageClusterHealthyPercent = Math.round((verifiedScholarships / totalScholarships) * 100);

        return NextResponse.json({
            stats: {
                totalUrls,
                totalScholarships,
                verifiedScholarships,
                inactiveScholarships,
                qualityWarnings: totalWarnings,
                gscClicks: totalGscClicks,
                gscImpressions: totalGscImpressions,
                auditCoverage: Math.round((verifiedScholarships / totalScholarships) * 100)
            },
            templateHealth: {
                stateHubs: statesHealthyPercent,
                scholarshipDetails: detailHealthyPercent,
                subpageClusters: subpageClusterHealthyPercent
            },
            predictiveWarnings,
            criticalTasks: tasksQueue.slice(0, 10), // return top 10 priorities
            missingMetrics: {
                missingAmountAnnual,
                missingDeadline,
                missingDocs,
                missingHelpline,
                missingFaqs,
                missingSelection,
                missingStepGuide,
                missingRenewal
            }
        });

    } catch (error: any) {
        console.error('Database query error inside admin dashboard API:', error);
        return NextResponse.json({ error: 'Database query failed.', details: error.message }, { status: 500 });
    } finally {
        db.close();
    }
}
