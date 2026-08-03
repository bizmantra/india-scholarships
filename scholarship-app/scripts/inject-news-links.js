const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, '..', 'content', 'news');
const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.md'));

const newsMappings = [
  {
    pattern: 'aicte',
    targetSlug: 'aicte-pragati-scholarship-for-girl-students',
    targetTitle: 'AICTE Pragati Scholarship for Girls',
    hubUrl: '/guides/nsp',
    hubTitle: 'National Scholarship Portal (NSP) Guide'
  },
  {
    pattern: 'ap-talliki-vandanam',
    targetSlug: 'jagananna-vidya-deevena-ap',
    targetTitle: 'Jagananna Vidya Deevena Scheme AP',
    hubUrl: '/scholarships-in/andhra-pradesh',
    hubTitle: 'Andhra Pradesh Scholarships Hub'
  },
  {
    pattern: 'digital-gujarat-scholarship-registration',
    targetSlug: 'gujarat-post-matric-scholarship-for-obc',
    targetTitle: 'Digital Gujarat Post-Matric Scholarship for SEBC/OBC',
    hubUrl: '/guides/digital-gujarat-mysy',
    hubTitle: 'Digital Gujarat Portal Guide'
  },
  {
    pattern: 'government-strengthens',
    targetSlug: 'pm-yashasvi-scholarship',
    targetTitle: 'PM Yashasvi Scholarship Scheme',
    hubUrl: '/scholarships-for/obc',
    hubTitle: 'OBC Category Scholarships Hub'
  },
  {
    pattern: 'gujarat-mysy',
    targetSlug: 'mukhyamantri-yuva-swavalamban-yojana-mysy',
    targetTitle: 'Gujarat MYSY Scholarship Scheme',
    hubUrl: '/guides/digital-gujarat-mysy',
    hubTitle: 'Digital Gujarat & MYSY Portal Guide'
  },
  {
    pattern: 'how-to-check-sats-id',
    targetSlug: 'ssp-pre-matric-post-matric-scholarship-karnataka',
    targetTitle: 'SSP Karnataka Post-Matric Scholarship',
    hubUrl: '/guides/ssp-karnataka',
    hubTitle: 'Karnataka SSP Portal Guide'
  },
  {
    pattern: 'ignou',
    targetSlug: 'central-sector-scheme-of-scholarship-for-college-and-university-students',
    targetTitle: 'Central Sector University Scholarship',
    hubUrl: '/government-scholarships',
    hubTitle: 'Government Scholarships Hub'
  },
  {
    pattern: 'karnataka-ssp-matric',
    targetSlug: 'ssp-pre-matric-post-matric-scholarship-karnataka',
    targetTitle: 'Karnataka SSP Post-Matric Scholarship',
    hubUrl: '/guides/ssp-karnataka',
    hubTitle: 'Karnataka SSP Portal Guide'
  },
  {
    pattern: 'nsp-scholarship',
    targetSlug: 'central-sector-scheme-of-scholarship-for-college-and-university-students',
    targetTitle: 'NSP Central Sector Scheme Scholarship',
    hubUrl: '/guides/nsp',
    hubTitle: 'National Scholarship Portal (NSP) Guide'
  },
  {
    pattern: 'punjab-government',
    targetSlug: 'punjab-post-matric-scholarship-for-sc-students',
    targetTitle: 'Punjab Post-Matric Scholarship for SC Students',
    hubUrl: '/scholarships-in/punjab',
    hubTitle: 'Punjab Scholarships Hub'
  },
  {
    pattern: 'punjab-opens',
    targetSlug: 'punjab-post-matric-scholarship-for-sc-students',
    targetTitle: 'Punjab Post Matric SC Scholarship Portal',
    hubUrl: '/scholarships-in/punjab',
    hubTitle: 'Punjab State Scholarships Hub'
  },
  {
    pattern: 'pwsat-registration',
    targetSlug: 'tata-capital-pankh-scholarship',
    targetTitle: 'Tata Capital Pankh Scholarship',
    hubUrl: '/private-scholarships',
    hubTitle: 'Private & Foundation Scholarships Hub'
  },
  {
    pattern: 'registration-date-for-post-matric',
    targetSlug: 'post-matric-scholarship-for-obcsebc-students-odisha',
    targetTitle: 'Odisha Post-Matric OBC Scholarship',
    hubUrl: '/scholarships-in/odisha',
    hubTitle: 'Odisha State Scholarships Hub'
  },
  {
    pattern: 'scholarships-june-20',
    targetSlug: 'pm-yashasvi-scholarship',
    targetTitle: 'PM Yashasvi Scholarship Scheme',
    hubUrl: '/government-scholarships',
    hubTitle: 'Government Scholarships Hub'
  },
  {
    pattern: 'ssp-karnataka-kutumba',
    targetSlug: 'ssp-pre-matric-post-matric-scholarship-karnataka',
    targetTitle: 'SSP Karnataka Post-Matric Scholarship',
    hubUrl: '/guides/ssp-karnataka',
    hubTitle: 'Karnataka SSP Portal Guide'
  },
  {
    pattern: 'ssp-scholarship-2024-25',
    targetSlug: 'ssp-pre-matric-post-matric-scholarship-karnataka',
    targetTitle: 'Karnataka SSP Scholarship Online',
    hubUrl: '/guides/ssp-karnataka',
    hubTitle: 'Karnataka SSP Portal Guide'
  },
  {
    pattern: 'study-in-the-uk',
    targetSlug: 'narotam-sekhsaria-postgraduate-scholarship',
    targetTitle: 'Narotam Sekhsaria Postgraduate Scholarship',
    hubUrl: '/scholarships-for/masters/in/uk',
    hubTitle: 'UK Masters Overseas Scholarships'
  },
  {
    pattern: 'telangana-offers',
    targetSlug: 'telangana-postmatric-sc',
    targetTitle: 'Telangana ePASS Overseas & Post-Matric SC Scholarship',
    hubUrl: '/scholarships-in/telangana',
    hubTitle: 'Telangana State Scholarships Hub'
  },
  {
    pattern: 'up-cabinet-approves',
    targetSlug: 'up-post-matric-intermediate-scholarship-general-sc-st',
    targetTitle: 'UP Post-Matric Intermediate Scholarship',
    hubUrl: '/scholarships-in/uttar-pradesh',
    hubTitle: 'Uttar Pradesh State Scholarships Hub'
  },
  {
    pattern: 'up-extends-sanskrit',
    targetSlug: 'mukhyamantri-kanya-sumangala-yojana',
    targetTitle: 'UP Mukhyamantri Kanya Sumangala Yojana',
    hubUrl: '/scholarships-in/uttar-pradesh',
    hubTitle: 'Uttar Pradesh State Scholarships Hub'
  },
  {
    pattern: 'up-post-matric',
    targetSlug: 'up-post-matric-intermediate-scholarship-general-sc-st',
    targetTitle: 'UP Post-Matric Intermediate Scholarship',
    hubUrl: '/scholarships-in/uttar-pradesh',
    hubTitle: 'Uttar Pradesh State Scholarships Hub'
  }
];

let count = 0;

files.forEach(file => {
  const filePath = path.join(newsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const config = newsMappings.find(m => file.includes(m.pattern));
  if (!config) return;

  // Clean frontmatter
  content = content.replace(/relatedScholarships:\s*\[[^\]]*\]/g, `relatedScholarships: ["${config.targetSlug}"]`);
  content = content.replace(/targetMoneyLink:\s*["']?[^"'\r\n]+["']?/g, `targetMoneyLink: "/scholarships/${config.targetSlug}"`);

  // Replace invalid inline links if any
  content = content.replace(/\/scholarships\/[a-z0-9-]*dashmottar/g, `/scholarships/${config.targetSlug}`);
  content = content.replace(/\/scholarships\/[a-z0-9-]*digital-gujarat-post-matric-scholarship-for-scst-obc-ebc/g, `/scholarships/${config.targetSlug}`);

  if (!content.includes('## Related Scholarship Portals & Money Pages')) {
    content = content.trim() + `\n\n## Related Scholarship Portals & Money Pages\nFor complete eligibility, document requirements, and step-by-step application instructions, visit our dedicated resources:\n\n* **Official Scholarship Detail**: Check full guidelines and deadlines on the [${config.targetTitle}](/scholarships/${config.targetSlug}).\n* **State & Portal Hub**: Explore all active schemes and status tracking guides on the [${config.hubTitle}](${config.hubUrl}).\n`;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  count++;
});

console.log(`Successfully updated ${count} news files with verified DB slugs.`);
