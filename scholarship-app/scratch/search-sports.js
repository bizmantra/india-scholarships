const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

console.log("Analyzing current matches in detail...");

const query = `
    SELECT id, title, slug, tags, course_stream, benefits, selection, renewal 
    FROM scholarships 
    WHERE title LIKE '%sport%' 
       OR title LIKE '%athlete%' 
       OR title LIKE '%sports%'
       OR tags LIKE '%sport%'
       OR tags LIKE '%sports%'
       OR benefits LIKE '%sport%'
       OR benefits LIKE '%sports%'
       OR course_stream LIKE '%sport%'
       OR course_stream LIKE '%sports%'
`;

const results = db.prepare(query).all();

results.forEach((row, index) => {
    console.log(`\n${index + 1}. Title: ${row.title}`);
    console.log(`   Slug: ${row.slug}`);
    
    // Check where matches occurred
    if (row.title.toLowerCase().includes('sport') || row.title.toLowerCase().includes('athlete')) {
        console.log(`   -> Matched in Title: "${row.title}"`);
    }
    if (row.tags && row.tags.toLowerCase().includes('sport')) {
        console.log(`   -> Matched in Tags: "${row.tags}"`);
    }
    if (row.course_stream && row.course_stream.toLowerCase().includes('sport')) {
        console.log(`   -> Matched in Course/Stream: "${row.course_stream}"`);
    }
    if (row.benefits && row.benefits.toLowerCase().includes('sport')) {
        // Look for exact word or context
        const index = row.benefits.toLowerCase().indexOf('sport');
        const snippet = row.benefits.substring(Math.max(0, index - 30), Math.min(row.benefits.length, index + 40));
        console.log(`   -> Matched in Benefits: "...${snippet}..."`);
    }
    if (row.selection && row.selection.toLowerCase().includes('sport')) {
        const index = row.selection.toLowerCase().indexOf('sport');
        const snippet = row.selection.substring(Math.max(0, index - 30), Math.min(row.selection.length, index + 40));
        console.log(`   -> Matched in Selection: "...${snippet}..."`);
    }
    if (row.renewal && row.renewal.toLowerCase().includes('sport')) {
        const index = row.renewal.toLowerCase().indexOf('sport');
        const snippet = row.renewal.substring(Math.max(0, index - 30), Math.min(row.renewal.length, index + 40));
        console.log(`   -> Matched in Renewal: "...${snippet}..."`);
    }
});
