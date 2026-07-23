const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const NEWS_DIR = path.join(__dirname, '..', 'content', 'news');
const REPORT_PATH = path.join(__dirname, '..', 'data', 'editorial-gaps-report.md');

console.log('🔍 Checking Editorial Content & News Gaps across database...');

if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database file not found at:', DB_PATH);
    process.exit(1);
}

const db = new Database(DB_PATH);

// 1. Load existing articles
const articles = [];
if (fs.existsSync(ARTICLES_DIR)) {
    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
    files.forEach(file => {
        const content = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8');
        articles.push({ file, slug: file.replace('.md', ''), content: content.toLowerCase() });
    });
}

// 2. Load existing news
const newsList = [];
if (fs.existsSync(NEWS_DIR)) {
    const files = fs.readdirSync(NEWS_DIR).filter(f => f.endsWith('.md'));
    files.forEach(file => {
        const content = fs.readFileSync(path.join(NEWS_DIR, file), 'utf-8');
        newsList.push({ file, slug: file.replace('.md', ''), content: content.toLowerCase() });
    });
}

// 3. Query scholarships from DB
const rows = db.prepare(`
    SELECT id, slug, title, provider, provider_type, scholarship_type, amount_annual, is_featured, verification_year
    FROM scholarships
    ORDER BY 
        CASE WHEN scholarship_type = 'Government' OR provider_type = 'Government' THEN 1 ELSE 2 END,
        amount_annual DESC
`).all();

console.log(`📊 Scanned ${rows.length} scholarships from database.`);
console.log(`📚 Existing Articles: ${articles.length} | 📰 Existing News: ${newsList.length}\n`);

const gapReport = [];

rows.forEach(s => {
    const sSlug = s.slug.toLowerCase();
    const sTitle = s.title;
    const year = s.verification_year || new Date().getFullYear();

    const hasArticle = articles.some(a => 
        a.slug.includes(sSlug) || 
        a.content.includes(sSlug) || 
        a.content.includes(sTitle.toLowerCase())
    );

    const hasNews = newsList.some(n => 
        n.slug.includes(sSlug) || 
        n.content.includes(sSlug) || 
        n.content.includes(sTitle.toLowerCase())
    );

    if (!hasArticle || !hasNews) {
        const isGov = s.scholarship_type === 'Government' || s.provider_type === 'Government';
        const isMajor = isGov || s.amount_annual >= 25000 || s.is_featured === 1;

        gapReport.push({
            id: s.id,
            slug: s.slug,
            title: sTitle,
            amount: s.amount_annual,
            isMajor,
            missingArticle: !hasArticle,
            missingNews: !hasNews,
            suggestedArticle: `How to Apply for ${sTitle} ${year}: Step-by-Step Guide, Eligibility & Documents`,
            suggestedNews: `${sTitle} ${year} Application Portal Update & Key Dates`
        });
    }
});

const majorGaps = gapReport.filter(g => g.isMajor);

console.log(`📌 Found ${gapReport.length} scholarships with content gaps (${majorGaps.length} High Priority).\n`);

console.log('--- Top 10 Recommended Content Additions ---');
majorGaps.slice(0, 10).forEach((g, idx) => {
    console.log(`\n${idx + 1}. [${g.title}] (${g.slug})`);
    if (g.missingNews) {
        console.log(`   📰 Suggested News: "${g.suggestedNews}"`);
    }
    if (g.missingArticle) {
        console.log(`   📝 Suggested Article: "${g.suggestedArticle}"`);
    }
});

let mdContent = `# Editorial & News Content Gap Report\n\n`;
mdContent += `*Generated on ${new Date().toLocaleDateString('en-IN')}*\n\n`;
mdContent += `Total Scholarships Analyzed: **${rows.length}** | High Priority Gaps Identified: **${majorGaps.length}**\n\n`;

mdContent += `## 🚀 High Priority Recommended Articles & News\n\n`;
mdContent += `| Scholarship Title | Missing News | Missing Article | Proposed Article Topic |\n`;
mdContent += `| :--- | :---: | :---: | :--- |\n`;

majorGaps.forEach(g => {
    mdContent += `| **${g.title}**<br>\`[${g.slug}]\` | ${g.missingNews ? '❌ Needs News' : '✅ Covered'} | ${g.missingArticle ? '❌ Needs Article' : '✅ Covered'} | *${g.suggestedArticle}* |\n`;
});

fs.writeFileSync(REPORT_PATH, mdContent);
console.log(`\n✅ Full gap report saved to: data/editorial-gaps-report.md`);
