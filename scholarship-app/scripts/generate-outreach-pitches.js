const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const PROSPECTS_JSON = path.join(DATA_DIR, 'backlink-prospects.json');
const OUTREACH_PITCHES_MD = path.join(DATA_DIR, 'outreach-pitches.md');

if (!fs.existsSync(PROSPECTS_JSON)) {
  console.error('[!] Error: backlink-prospects.json not found. Run `node scripts/backlink-prospector.js` first.');
  process.exit(1);
}

const prospects = JSON.parse(fs.readFileSync(PROSPECTS_JSON, 'utf-8'));

function generatePitchForTarget(target) {
  if (target.outreach_type === 'Resource Page Link Request') {
    return `### Outreach Pitch: ${target.domain} (${target.category})
**Target Page**: [${target.title}](${target.url})  
**Authority Score**: ${target.authority_score}/100  
**Suggested Anchor Text**: \`${target.suggested_anchor}\`  
**Target URL**: \`${target.target_link}\`  

**Subject**: Addition to ${target.domain}'s Student Financial Aid & Scholarship Resources Page

Hi [Webmaster / Student Welfare Coordinator],

I hope this email finds you well.

I was recently reviewing the excellent financial aid and student welfare resources listed on your portal at ${target.url}. The curated guidance your institution provides to students navigating educational costs is extremely helpful.

I wanted to bring to your attention **IndiaScholarships.in**, a comprehensive, non-commercial database designed specifically to help Indian students search and verify eligibility for central, state, and corporate scholarship schemes with zero hassle.

Would you consider adding a link to IndiaScholarships (${target.target_link}) under your external student resources section? 

Proposed Resource Title: **${target.suggested_anchor}**  
URL: \`${target.target_link}\`

Thank you for your time and for continuously supporting student welfare.

Warm regards,  
[Your Name / Editorial Lead]  
IndiaScholarships.in Team  

---
`;
  } else if (target.outreach_type === 'Co-Author / Guest Guide Pitch') {
    return `### Outreach Pitch: ${target.domain} (${target.category})
**Target Page**: [${target.title}](${target.url})  
**Authority Score**: ${target.authority_score}/100  
**Suggested Anchor Text**: \`${target.suggested_anchor}\`  
**Target URL**: \`${target.target_link}\`  

**Subject**: Collaboration / Resource update for ${target.domain}'s Scholarship Guide

Hi [Editorial Team / Education Editor],

I read your comprehensive guide on Indian scholarships at ${target.url}—great overview for students!

Our team at IndiaScholarships.in has recently published updated step-by-step troubleshooting workflows for major state portals (like NSP, SSP Karnataka, MahaDBT, and UP Scholarship portal) detailing deadline extensions, biometric verification fixes, and bank seeding status checks.

We would love to provide a quick update or contextual contribution to your article to enhance value for your readers, or explore a joint resource update linking to our active eligibility checker tool: ${target.target_link}.

Let me know if this would be helpful for your editorial team!

Best regards,  
[Your Name]  
IndiaScholarships.in  

---
`;
  }

  return '';
}

function generateAllPitches() {
  console.log('=== Generating Customized Outreach Pitches ===');
  let outputMd = `# High-Authority Outreach Pitches & Lead Directory\n\n`;
  outputMd += `Generated on: ${new Date().toISOString().split('T')[0]}\n\n`;
  outputMd += `> [!NOTE]\n> Below are customized, compliant outreach emails for target .ac.in universities, education portals, and career blogs.\n\n`;

  prospects.forEach((prospect, idx) => {
    outputMd += `## ${idx + 1}. Lead: ${prospect.domain}\n`;
    outputMd += generatePitchForTarget(prospect);
  });

  fs.writeFileSync(OUTREACH_PITCHES_MD, outputMd);
  console.log(`[✔] Generated pitches for ${prospects.length} targets.`);
  console.log(`[✔] Saved to: ${OUTREACH_PITCHES_MD}`);
}

generateAllPitches();
