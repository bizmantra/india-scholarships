const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, '..', 'content', 'articles');
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));

console.log('Searching for any I/me/my/we/our in article files...\n');

files.forEach(file => {
  const filePath = path.join(articlesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Reframes
  content = content.replace(/### Q2: What should I do if my college name is not listed on SSP\?/g, '### Q2: What to Do If College Name Is Not Listed on SSP?');
  content = content.replace(/### Q3: When will the scholarship money reach my bank\?/g, '### Q3: When Is Scholarship Money Credited to Bank Accounts?');
  content = content.replace(/### Q2: Can I apply for renewal if I fail one subject\?/g, '### Q2: Can Students Apply for Renewal After Failing One Subject?');
  content = content.replace(/### Q3: How will I receive the scholarship amount\?/g, '### Q3: How Is the Scholarship Amount Disbursed?');
  content = content.replace(/### Q2: Can I apply for both schemes together\?/g, '### Q2: Can Students Apply for Both Schemes Together?');
  content = content.replace(/### Q3: When will scholarship money reach my bank\?/g, '### Q3: When Is Scholarship Money Disbursed to Bank Accounts?');
  content = content.replace(/### Q1: Can I get both Pudhumai Penn and Post-Matric scholarships\?/g, '### Q1: Can Students Receive Both Pudhumai Penn and Post-Matric Scholarships?');
  content = content.replace(/### Q3: How do I know if PFMS approved my payment\?/g, '### Q3: How to Confirm IF PFMS Approved Payment?');
  content = content.replace(/### Q3: When will SVMCM money reach my bank account\?/g, '### Q3: When Is SVMCM Money Credited to Bank Accounts?');

  // Single girl child affidavit sample reframing
  content = content.replace(/I, \[Father\/Mother Name\], son\/daughter of \[Grandfather Name\],/g, 'Affidavit declaration stating parent name, son/daughter of grandfather name,');
  content = content.replace(/1\. That I am the parent of \[Girl Student Name\], born on \[Date of Birth\]\./g, '1. Statement of being the parent of [Girl Student Name], born on [Date of Birth].');
  content = content.replace(/4\. That the statements made above are true to the best of my knowledge\./g, '4. Confirmation that all statements made are true and correct.');

  // Remove any remaining "our" or "we" phrasing
  content = content.replace(/our free \[\/eligibility-checker\]\(\/eligibility-checker\)/g, 'the free [/eligibility-checker](/eligibility-checker)');
  content = content.replace(/our free \[Scholarship Eligibility Checker\]\(\/eligibility-checker\)/g, 'the free [Scholarship Eligibility Checker](/eligibility-checker)');
  content = content.replace(/our free \[Eligibility Checker Tool\]\(\/eligibility-checker\)/g, 'the free [Eligibility Checker Tool](/eligibility-checker)');
  content = content.replace(/our free \[Eligibility Checker\]\(\/eligibility-checker\)/g, 'the free [Eligibility Checker](/eligibility-checker)');
  content = content.replace(/our \[Andhra Pradesh Scholarships Hub\]/g, 'the [Andhra Pradesh Scholarships Hub]');
  content = content.replace(/our \[OBC Scholarships Guide\]/g, 'the [OBC Scholarships Guide]');
  content = content.replace(/our main \[PM Yasasvi Scholarship\]/g, 'the main [PM Yasasvi Scholarship]');
  content = content.replace(/our general \[NSP Portal Guide\]/g, 'the general [NSP Portal Guide]');
  content = content.replace(/Here is Our Step-by-Step Fix/g, 'Step-by-Step Troubleshooting Fix');
  content = content.replace(/We tested the registration at 6:00 AM, and the OTP arrived in less than 10 seconds!/g, 'Registering at 6:00 AM off-peak hours typically delivers the OTP within 10 seconds.');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Cleaned tone & persona in: ${file}`);
  }
});
