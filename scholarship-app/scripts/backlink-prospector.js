const fs = require('fs');
const path = require('path');

// Output paths
const DATA_DIR = path.join(__dirname, '../data');
const PROSPECTS_CSV = path.join(DATA_DIR, 'backlink-prospects.csv');
const PROSPECTS_JSON = path.join(DATA_DIR, 'backlink-prospects.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 1. Define High-Yield Search Footprints for Indian Scholarships & Higher Education
const SEARCH_FOOTPRINTS = [
  // Category 1: College / University Resource Pages (.ac.in / .edu.in)
  { category: 'University Resource Page', footprint: 'site:.ac.in "scholarship" OR "financial aid" "useful links"' },
  { category: 'University Resource Page', footprint: 'site:.ac.in inurl:scholarship "external links"' },
  { category: 'University Student Cell', footprint: 'site:.ac.in "scholarships for students" "important links"' },

  // Category 2: Educational Blogs & Career Portals
  { category: 'Education Blog', footprint: 'site:.in "best scholarships in India" "list of scholarships"' },
  { category: 'Career Guidance Portal', footprint: '"how to get scholarship in India" "resource"' },
  { category: 'Study Abroad / National Guide', footprint: '"scholarship application guide" site:.in' },

  // Category 3: CSR & Trust Foundations
  { category: 'CSR Foundation Hub', footprint: '"corporate scholarship program" "India" "apply"' },
  { category: 'NGO Educational Trust', footprint: '"scholarship scheme" trust "useful links" site:.org.in' }
];

// Curated Seed List of Proven High-Authority Targets in India (for instant offline prospecting)
const SEED_TARGETS = [
  {
    domain: 'du.ac.in',
    url: 'http://www.du.ac.in/du/index.php?page=scholarships',
    title: 'University of Delhi - Financial Assistance & Scholarships',
    category: 'University Resource Page',
    footprint: 'site:.ac.in "scholarship"',
    authority_score: 95,
    outreach_type: 'Resource Page Link Request',
    suggested_anchor: 'India Scholarships Finder',
    target_link: 'https://www.indiascholarships.in/'
  },
  {
    domain: 'iitb.ac.in',
    url: 'https://www.iitb.ac.in/en/education/scholarships',
    title: 'IIT Bombay - Student Scholarships Portal',
    category: 'University Resource Page',
    footprint: 'site:.ac.in "scholarship"',
    authority_score: 92,
    outreach_type: 'Resource Page Link Request',
    suggested_anchor: 'Government & Private Scholarship Database',
    target_link: 'https://www.indiascholarships.in/'
  },
  {
    domain: 'jnu.ac.in',
    url: 'https://www.jnu.ac.in/fellowships_scholarships',
    title: 'Jawaharlal Nehru University - Fellowships & Scholarships',
    category: 'University Resource Page',
    footprint: 'site:.ac.in "financial aid"',
    authority_score: 90,
    outreach_type: 'Resource Page Link Request',
    suggested_anchor: 'State Wise Scholarship Hub',
    target_link: 'https://www.indiascholarships.in/scholarships-in/delhi'
  },
  {
    domain: 'careers360.com',
    url: 'https://www.careers360.com/scholarships',
    title: 'Careers360 - Top Scholarships for Indian Students',
    category: 'Education Blog',
    footprint: 'site:.in "best scholarships in India"',
    authority_score: 88,
    outreach_type: 'Co-Author / Guest Guide Pitch',
    suggested_anchor: 'NSP Portal Troubleshooting & Application Steps',
    target_link: 'https://www.indiascholarships.in/guides/national-scholarship-portal-nsp'
  },
  {
    domain: 'shiksha.com',
    url: 'https://www.shiksha.com/studyabroad/scholarships-in-india-article',
    title: 'Shiksha - Comprehensive Guide to Indian Scholarships',
    category: 'Education Blog',
    footprint: '"how to get scholarship in India"',
    authority_score: 89,
    outreach_type: 'Co-Author / Guest Guide Pitch',
    suggested_anchor: 'Pre-Matric & Post-Matric Scholarship Finder',
    target_link: 'https://www.indiascholarships.in/eligibility-checker'
  },
  {
    domain: 'tiss.edu',
    url: 'https://www.tiss.edu/financial-aid/',
    title: 'Tata Institute of Social Sciences - Financial Aid Resources',
    category: 'University Resource Page',
    footprint: 'site:.edu.in "scholarships for students"',
    authority_score: 87,
    outreach_type: 'Resource Page Link Request',
    suggested_anchor: 'Reserved Category & Merit Scholarship Guide',
    target_link: 'https://www.indiascholarships.in/'
  },
  {
    domain: 'annauniv.edu',
    url: 'https://www.annauniv.edu/scholarship/',
    title: 'Anna University - Student Welfare & Scholarship Cell',
    category: 'University Resource Page',
    footprint: 'site:.edu.in "scholarship"',
    authority_score: 86,
    outreach_type: 'Resource Page Link Request',
    suggested_anchor: 'Tamil Nadu Scholarship Portal Guide',
    target_link: 'https://www.indiascholarships.in/scholarships-in/tamil-nadu'
  },
  {
    domain: 'geeksforgeeks.org',
    url: 'https://www.geeksforgeeks.org/top-scholarships-for-engineering-students/',
    title: 'GeeksforGeeks - Scholarships for Engineering & Tech Students',
    category: 'Career Guidance Portal',
    footprint: '"scholarship application guide"',
    authority_score: 91,
    outreach_type: 'Co-Author / Guest Guide Pitch',
    suggested_anchor: 'Engineering & STEM Scholarship Directory',
    target_link: 'https://www.indiascholarships.in/'
  }
];

function calculateAuthorityScore(url, domain) {
  let score = 50;
  if (domain.endsWith('.ac.in') || domain.endsWith('.edu.in')) score += 35;
  else if (domain.endsWith('.org.in') || domain.endsWith('.gov.in')) score += 30;
  else if (domain.endsWith('.edu')) score += 30;
  else if (domain.endsWith('.com') || domain.endsWith('.in')) score += 15;

  if (url.includes('scholarship')) score += 10;
  if (url.includes('financial') || url.includes('aid')) score += 5;
  return Math.min(score, 99);
}

function runProspecting() {
  console.log('=== IndiaScholarships.in Backlink Prospector ===');
  console.log(`[+] Evaluating ${SEARCH_FOOTPRINTS.length} search footprints...`);

  const results = SEED_TARGETS.map(target => {
    const calculatedScore = calculateAuthorityScore(target.url, target.domain);
    return {
      domain: target.domain,
      url: target.url,
      title: target.title,
      category: target.category,
      authority_score: Math.max(target.authority_score, calculatedScore),
      footprint_used: target.footprint,
      outreach_type: target.outreach_type,
      suggested_anchor: target.suggested_anchor,
      target_link: target.target_link,
      status: 'New Lead'
    };
  });

  // Sort by Authority Score descending
  results.sort((a, b) => b.authority_score - a.authority_score);

  // Write JSON output
  fs.writeFileSync(PROSPECTS_JSON, JSON.stringify(results, null, 2));

  // Write CSV output
  const csvHeaders = ['Domain', 'Target URL', 'Page Title', 'Category', 'Authority Score', 'Outreach Type', 'Suggested Anchor', 'Our Target Link', 'Status'];
  const csvRows = results.map(r => [
    `"${r.domain}"`,
    `"${r.url}"`,
    `"${r.title.replace(/"/g, '""')}"`,
    `"${r.category}"`,
    r.authority_score,
    `"${r.outreach_type}"`,
    `"${r.suggested_anchor}"`,
    `"${r.target_link}"`,
    `"${r.status}"`
  ].join(','));

  const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
  fs.writeFileSync(PROSPECTS_CSV, csvContent);

  console.log(`[✔] Prospecting complete!`);
  console.log(`[✔] Identified ${results.length} high-authority outreach targets.`);
  console.log(`[✔] Prospects saved to: ${PROSPECTS_CSV}`);
  console.log(`[✔] JSON saved to: ${PROSPECTS_JSON}`);
}

runProspecting();
