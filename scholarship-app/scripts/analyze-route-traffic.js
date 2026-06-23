const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'gsc-june-2026');
const pages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pages.json'), 'utf-8'));

function getRouteGroup(url) {
    const cleanUrl = url.replace('https://www.indiascholarships.in', '').trim() || '/';

    if (cleanUrl === '/') return 'Homepage (/)';
    if (cleanUrl.startsWith('/scholarships/')) return 'Detail Pages (/scholarships/[slug])';
    if (cleanUrl.startsWith('/scholarships-in/')) return 'State Pages (/scholarships-in/[state])';
    if (cleanUrl.startsWith('/scholarships-for/')) return 'Caste Category Pages (/scholarships-for/[category])';
    if (cleanUrl.startsWith('/scholarships-level/')) return 'Level Pages (/scholarships-level/[level])';
    if (cleanUrl.startsWith('/scholarships-income/')) return 'Income Pages (/scholarships-income/[range])';
    if (cleanUrl.startsWith('/scholarships-by-course/')) return 'Course Pages (/scholarships-by-course/[course])';
    if (cleanUrl === '/eligibility-checker') return 'Eligibility Checker (/eligibility-checker)';
    if (cleanUrl === '/scholarships') return 'Directory (/scholarships)';
    if (cleanUrl === '/state-scholarships') return 'State Hub (/state-scholarships)';
    if (cleanUrl === '/scholarships-by-category') return 'Category Hub (/scholarships-by-category)';
    if (cleanUrl === '/scholarships-by-education') return 'Education Hub (/scholarships-by-education)';
    if (cleanUrl === '/scholarships-by-income') return 'Income Hub (/scholarships-by-income)';
    if (cleanUrl === '/government-scholarships' || cleanUrl === '/private-scholarships' || cleanUrl === '/corporate-scholarships') return 'Provider Type Hubs';
    if (cleanUrl.startsWith('/guides')) return 'Guides (/guides)';
    
    return 'Other/Misc';
}

function analyzeRouteGroups() {
    const groups = {};

    pages.slice(1).forEach(row => {
        const url = row[0];
        const clicks = Number(row[1] || 0);
        const impressions = Number(row[2] || 0);

        const groupName = getRouteGroup(url);
        if (!groups[groupName]) {
            groups[groupName] = { clicks: 0, impressions: 0, pagesCount: 0 };
        }

        groups[groupName].clicks += clicks;
        groups[groupName].impressions += impressions;
        groups[groupName].pagesCount += 1;
    });

    console.log('📊 IndiaScholarships.in - Traffic Distribution by Page Type/Template\n');
    console.log('Page Type | Pages Count | Clicks | Clicks % | Impressions | Impressions % | Avg CTR');
    console.log('--- | --- | --- | --- | --- | --- | ---');

    let totalClicks = 0;
    let totalImpressions = 0;
    Object.values(groups).forEach(g => {
        totalClicks += g.clicks;
        totalImpressions += g.impressions;
    });

    Object.entries(groups)
        .sort((a, b) => b[1].clicks - a[1].clicks)
        .forEach(([name, data]) => {
            const clickPct = ((data.clicks / totalClicks) * 100).toFixed(1);
            const impPct = ((data.impressions / totalImpressions) * 100).toFixed(1);
            const ctr = ((data.clicks / data.impressions) * 100).toFixed(2);
            console.log(`${name} | ${data.pagesCount} | ${data.clicks} | ${clickPct}% | ${data.impressions} | ${impPct}% | ${ctr}%`);
        });
}

analyzeRouteGroups();
