const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const fixturesDir = path.join(__dirname, '__fixtures__');
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

console.log('🧪 Running Article Audit Tooling Test Suite...\n');

const filler = ('\n\nThis is a standard paragraph with concise sentences.\nIt satisfies all paragraph length limits.').repeat(40);

// 1. Clean valid fixture
const validFixture = path.join(fixturesDir, 'valid-article.md');
fs.writeFileSync(validFixture, `---
slug: "valid-article"
title: "Valid Article for Testing"
takeaways:
  - "Takeaway number one"
  - "Takeaway number two"
  - "Takeaway number three"
targetMoneyLink: "/scholarships/jn-tata-endowment-scholarship"
---

## First Section

Dr. Sharma holds a Ph.D. degree from a prestigious university.

Students must review guideline No. 1 before starting their application.

European applicants can also consult the official portal, etc. when applying.

Track upcoming deadlines on the [Study in USA Hub](/study-abroad/study-in/usa).
${filler}
`, 'utf8');

try {
  execSync(`node "${path.join(__dirname, 'audit-article-links.js')}" --file "${validFixture}"`, { stdio: 'pipe' });
  console.log('✅ Test 1 Passed: Clean fixture with Ph.D., Dr., No. 1 passed audit.');
} catch (e) {
  console.error('❌ Test 1 Failed:', e.stdout?.toString() || e.message);
  process.exit(1);
}

// 2. Case-sensitive pronoun check ('I' flagged, 'i' in i.e. ignored)
const pronounFixture = path.join(fixturesDir, 'pronoun-article.md');
fs.writeFileSync(pronounFixture, `---
slug: "pronoun-article"
title: "Pronoun Article"
takeaways:
  - "Takeaway 1"
  - "Takeaway 2"
  - "Takeaway 3"
targetMoneyLink: "/scholarships/jn-tata-endowment-scholarship"
---

Here i.e. is an allowed abbreviation.

However I must verify all details before submitting.
${filler}
`, 'utf8');

try {
  execSync(`node "${path.join(__dirname, 'audit-article-links.js')}" --file "${pronounFixture}"`, { stdio: 'pipe' });
  console.error('❌ Test 2 Failed: Expected pronoun failure for capital "I", but it passed.');
  process.exit(1);
} catch (e) {
  const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
  if (out.includes('Forbidden first-person pronoun(s): I')) {
    console.log('✅ Test 2 Passed: Capital "I" flagged while "i.e." is permitted.');
  } else {
    console.error('❌ Test 2 Failed: Output did not contain expected pronoun error:', out);
    process.exit(1);
  }
}

// 3. Redirect normalization (query string & trailing slash)
const redirectFixture = path.join(fixturesDir, 'redirect-article.md');
fs.writeFileSync(redirectFixture, `---
slug: "redirect-article"
title: "Redirect Article"
takeaways:
  - "Takeaway 1"
  - "Takeaway 2"
  - "Takeaway 3"
targetMoneyLink: "/scholarships/jn-tata-endowment-scholarship"
---

Check the [Checker](/tools/eligibility-checker/?source=test).
${filler}
`, 'utf8');

try {
  execSync(`node "${path.join(__dirname, 'audit-article-links.js')}" --file "${redirectFixture}"`, { stdio: 'pipe' });
  console.error('❌ Test 3 Failed: Expected redirect failure for /tools/eligibility-checker/, but it passed.');
  process.exit(1);
} catch (e) {
  const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
  if (out.includes('Internal link targets redirected URL')) {
    console.log('✅ Test 3 Passed: Redirected URL with query parameters caught successfully.');
  } else {
    console.error('❌ Test 3 Failed: Output did not contain expected redirect error:', out);
    process.exit(1);
  }
}

// 4. Missing file exits non-zero
try {
  execSync(`node "${path.join(__dirname, 'audit-article-links.js')}" --file "nonexistent-file.md"`, { stdio: 'pipe' });
  console.error('❌ Test 4 Failed: Expected failure on missing file.');
  process.exit(1);
} catch (e) {
  const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
  if (out.includes('TARGET FILE NOT FOUND')) {
    console.log('✅ Test 4 Passed: Missing file explicitly caught and failed.');
  } else {
    console.error('❌ Test 4 Failed: Expected TARGET FILE NOT FOUND error message:', out);
    process.exit(1);
  }
}

// 5. Form I-20 / I-134 not falsely flagged as pronoun 'I'
const formFixture = path.join(fixturesDir, 'form-article.md');
fs.writeFileSync(formFixture, `---
slug: "form-article"
title: "Form Article"
takeaways:
  - "Takeaway 1"
  - "Takeaway 2"
  - "Takeaway 3"
targetMoneyLink: "/scholarships/jn-tata-endowment-scholarship"
---

Applicants must submit Form I-20 and Form I-134 for visa verification.
${filler}
`, 'utf8');

try {
  execSync(`node "${path.join(__dirname, 'audit-article-links.js')}" --file "${formFixture}"`, { stdio: 'pipe' });
  console.log('✅ Test 5 Passed: Form designations I-20 and I-134 permitted.');
} catch (e) {
  console.error('❌ Test 5 Failed: Form designations triggered false positive pronoun failure:', e.stdout?.toString() || e.message);
  process.exit(1);
}

// Clean up fixtures
fs.rmSync(fixturesDir, { recursive: true, force: true });
console.log('🎉 All 5 audit test cases passed cleanly!\n');
