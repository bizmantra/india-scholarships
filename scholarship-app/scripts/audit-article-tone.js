const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, '..', 'content', 'articles');
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));

console.log('=== AUDITING ARTICLE TONE & PERSONA RULES ===\n');

files.forEach(file => {
  const content = fs.readFileSync(path.join(articlesDir, file), 'utf8');
  
  // Exclude frontmatter from author check if it says "IndiaScholarships Editorial Team"
  const body = content.replace(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+/, '');

  const firstPersonMatches = [];
  const fakeWeMatches = [];

  // Match I, me, my as whole words
  const fpRegex = /\b(I|me|my)\b/g;
  let m;
  while ((m = fpRegex.exec(body)) !== null) {
    firstPersonMatches.push(m[0]);
  }

  // Match fake "we tested", "we did", "we verified", "our team"
  const fakeRegex = /\b(we (tested|did|verified|checked|tried|found)|our team|our test|we ran)\b/gi;
  while ((m = fakeRegex.exec(body)) !== null) {
    fakeWeMatches.push(m[0]);
  }

  if (firstPersonMatches.length > 0 || fakeWeMatches.length > 0) {
    console.log(`📄 Article: ${file}`);
    if (firstPersonMatches.length > 0) {
      console.log(`   ❌ Forbidden first-person words (${firstPersonMatches.length}): ${[...new Set(firstPersonMatches)].join(', ')}`);
    }
    if (fakeWeMatches.length > 0) {
      console.log(`   ❌ Fake team/test claims (${fakeWeMatches.length}): ${[...new Set(fakeWeMatches)].join(', ')}`);
    }
    console.log('');
  }
});
