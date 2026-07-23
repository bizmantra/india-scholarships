const fs = require('fs');
const path = require('path');

const articlesDirectory = path.join(__dirname, '../content/articles');
const todayStr = '2026-07-23';

console.log('🔄 Resetting all article publishing dates to:', todayStr);

if (!fs.existsSync(articlesDirectory)) {
  console.error('❌ Articles directory not found at:', articlesDirectory);
  process.exit(1);
}

const files = fs.readdirSync(articlesDirectory);
let count = 0;

files.forEach(file => {
  if (!file.endsWith('.md')) return;

  const filePath = path.join(articlesDirectory, file);
  let fileContent = fs.readFileSync(filePath, 'utf8');

  // Replace date: "YYYY-MM-DD" with date: "2026-07-23"
  const dateRegex = /^date:\s*["']?\d{4}-\d{2}-\d{2}["']?/m;
  
  if (dateRegex.test(fileContent)) {
    fileContent = fileContent.replace(dateRegex, `date: "${todayStr}"`);
    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(`✅ Updated date for: ${file}`);
    count++;
  } else {
    // If no date field exists, insert it in frontmatter
    console.log(`⚠️ No date field matched in: ${file}`);
  }
});

console.log(`🎉 Successfully updated ${count} articles to publish immediately!`);
