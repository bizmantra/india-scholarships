const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, '..', 'content', 'articles');

const replacements = [
  // Links / URLs
  { from: '/tools/eligibility-checker', to: '/eligibility-checker' },
  { from: '/guides/nsp/documents-list', to: '/guides/national-scholarship-portal-nsp/documents-list' },
  { from: '/guides/nsp', to: '/guides/national-scholarship-portal-nsp' },
  
  // Scholarship Slugs in URLs & frontmatter
  { from: 'swami-vivekananda-merit-cum-means-scholarship', to: 'swami-vivekananda-merit-cum-means-scholarship-svmcm' },
  { from: 'oasis-scholarship-west-bengal', to: 'oasis-post-matric-scholarship-for-sc-students-west-bengal' },
  { from: 'kanyashree-prakalpa-k2', to: 'kanyashree-prakalpa-scheme-west-bengal' },
  { from: 'suvarna-jubilee-merit-scholarship-kerala', to: 'kerala-suvarna-jubilee-merit-scholarship' },
  { from: 'kerala-egrantz-30-postmatric-sc-st-oec', to: 'e-grantz-kerala-scstoecobc-support' },
  { from: 'reliance-foundation-undergraduate-scholarships', to: 'reliance-foundation-undergraduate-scholarship' },
  { from: 'pragati-scholarship-for-girls-aitcte', to: 'aicte-pragati-scholarship-for-girl-students' },
  { from: 'rajasthan-uttar-matric-scholarship-sc-st-obc', to: 'rajasthan-post-matric-scholarship-sc' },
  { from: 'ssp-postmatric-sc-st-obc-karnataka', to: 'ssp-pre-matric-post-matric-scholarship-karnataka' },
  { from: 'vidyasiri-food-accommodation-scholarship', to: 'vidyasiri-food-and-accommodation-scholarship-for-obc-students-karnataka' },
  { from: 'bihar-postmatric-pms-bcebc-sc-st', to: 'bihar-post-matric-scholarship-bcebc' },
  { from: 'tamil-nadu-postmatric-sc-st', to: 'tamil-nadu-post-matric-scholarship-for-scst' },
  { from: 'telangana-postmatric-st', to: 'telangana-postmatric-sc' },
  { from: 'mahadbt-postmatric-scholarships-maharashtra', to: 'mahadbt-post-matric-scholarship-maharashtra' },
  { from: 'mukhyamantri-medhavi-vidyarthi-yojana-mp', to: 'mukhyamantri-medhavi-vidyarthi-yojana-mmvy' },
  { from: 'mp-taas-sc-st-postmatric', to: 'mp-mptaas-post-matric-scholarship-for-sc-students' },
  { from: 'post-matric-scholarships-scheme-for-minorities', to: 'up-post-matric-other-than-intermediate-minority' },
  { from: 'merit-cum-means-scholarship-for-professional-and-technical-courses', to: 'merit-cum-means-mcm-scholarship-for-minorities-professional-and-technical-courses-karnataka' },
  { from: 'central-sector-scheme-for-top-class-education-sc', to: 'pm-yasasvi-top-class-education' },
  { from: 'post-matric-scholarship-for-sc-students-punjab', to: 'punjab-post-matric-scholarship-for-sc-students' },
  { from: 'post-matric-scholarship-for-st-students-surat', to: 'digital-gujarat-post-matric-scholarship-for-st-students' },
  { from: 'nationwide-education-and-scholarship-test-nest-senior', to: 'colgate-keep-india-smiling-scholarship' },
  { from: 'keep-india-smiling-foundational-scholarship', to: 'colgate-keep-india-smiling-scholarship' },
];

const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));

console.log(`Fixing links across ${files.length} article files...`);

files.forEach(file => {
  const filePath = path.join(articlesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(r => {
    // replace exact matches
    content = content.split(r.from).join(r.to);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Updated links in: ${file}`);
  }
});

console.log('Finished updating article links.');
