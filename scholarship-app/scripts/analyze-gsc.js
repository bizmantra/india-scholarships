const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'gsc-june-2026');

function loadJSON(filename) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function analyze() {
    console.log('📈 IndiaScholarships - GSC Performance Analysis (June 2026)\n');

    // 1. Devices Analysis
    const devices = loadJSON('devices.json');
    if (devices.length > 0) {
        console.log('📱 Devices Performance:');
        console.log('Device | Clicks | Impressions | CTR | Position');
        console.log('--- | --- | --- | --- | ---');
        devices.slice(1).forEach(row => {
            console.log(`${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} | ${Number(row[4]).toFixed(1)}`);
        });
        console.log('\n');
    }

    // 2. Total metrics check (sum of queries or chart data)
    const chart = loadJSON('chart.json');
    let totalClicks = 0;
    let totalImpressions = 0;
    if (chart.length > 1) {
        chart.slice(1).forEach(row => {
            totalClicks += Number(row[1] || 0);
            totalImpressions += Number(row[2] || 0);
        });
        console.log(`📊 Overall Stats (from Chart history):`);
        console.log(`- Total Clicks: ${totalClicks}`);
        console.log(`- Total Impressions: ${totalImpressions}`);
        console.log(`- Avg CTR: ${((totalClicks / totalImpressions) * 100).toFixed(2)}%`);
        console.log('\n');
    }

    // 3. Top 15 Queries
    const queries = loadJSON('queries.json');
    if (queries.length > 0) {
        console.log('🔍 Top 15 Search Queries by Clicks:');
        console.log('Query | Clicks | Impressions | CTR | Position');
        console.log('--- | --- | --- | --- | ---');
        queries.slice(1, 16).forEach(row => {
            console.log(`${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} | ${Number(row[4]).toFixed(1)}`);
        });
        console.log('\n');

        // Low-hanging fruits (high impressions, low clicks, position 5-15)
        console.log('💡 SEO Opportunity Queries (Position 5-15, High Impressions, Low CTR):');
        console.log('Query | Clicks | Impressions | CTR | Position');
        console.log('--- | --- | --- | --- | ---');
        const opportunities = queries.slice(1)
            .map(row => ({
                query: row[0],
                clicks: Number(row[1] || 0),
                impressions: Number(row[2] || 0),
                ctr: parseFloat(row[3]) || 0,
                position: Number(row[4] || 0)
            }))
            .filter(q => q.position >= 4 && q.position <= 15 && q.impressions > 200 && q.ctr < 5)
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 10);
        
        opportunities.forEach(q => {
            console.log(`${q.query} | ${q.clicks} | ${q.impressions} | ${q.ctr.toFixed(2)}% | ${q.position.toFixed(1)}`);
        });
        console.log('\n');
    }

    // 4. Top 15 Pages
    const pages = loadJSON('pages.json');
    if (pages.length > 0) {
        console.log('📄 Top 15 Pages by Clicks:');
        console.log('Page | Clicks | Impressions | CTR | Position');
        console.log('--- | --- | --- | --- | ---');
        pages.slice(1, 16).forEach(row => {
            const cleanUrl = row[0].replace('https://www.indiascholarships.in', '');
            console.log(`${cleanUrl || '/'} | ${row[1]} | ${row[2]} | ${row[3]} | ${Number(row[4]).toFixed(1)}`);
        });
        console.log('\n');
    }

    // 5. Top Countries
    const countries = loadJSON('countries.json');
    if (countries.length > 0) {
        console.log('🌍 Top 5 Countries:');
        console.log('Country | Clicks | Impressions | CTR | Position');
        console.log('--- | --- | --- | --- | ---');
        countries.slice(1, 6).forEach(row => {
            console.log(`${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} | ${Number(row[4]).toFixed(1)}`);
        });
        console.log('\n');
    }
}

analyze();
