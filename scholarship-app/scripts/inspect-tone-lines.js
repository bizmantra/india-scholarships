const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, '..', 'content', 'articles');
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const filePath = path.join(articlesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    if (idx < 25 && line.startsWith('---')) return; // ignore frontmatter YAML key names if any
    if (/\b(I|me|my)\b/.test(line) || /\b(we (tested|did|verified|checked|tried|found)|our team|our test)\b/i.test(line)) {
      console.log(`${file}:${idx + 1}: ${line.trim()}`);
    }
  });
});
