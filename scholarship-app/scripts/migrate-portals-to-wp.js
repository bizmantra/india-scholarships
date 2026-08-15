// scripts/migrate-portals-to-wp.js
// Script to migrate dynamic Portal Guides and their nested sub-routes to WordPress CPT: portal.
// Run: node scripts/migrate-portals-to-wp.js

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const WP_URL = 'https://mediumpurple-sparrow-753119.hostingersite.com';
const USERNAME = process.env.WORDPRESS_USERNAME;
const APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

if (!USERNAME || !APP_PASSWORD) {
  console.error('❌ Error: WORDPRESS_USERNAME and WORDPRESS_APP_PASSWORD must be defined in your .env.local file.');
  process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString('base64');

// We require the portals data file dynamically
const { PORTALS_DATA } = require('./../lib/portalsData.ts');

const PORTAL_SUBPAGES = {
  'status-check': {
    titleSuffix: 'Application & PFMS Status Check 2026: Track Payment',
    label: 'Status Check'
  },
  'student-login': {
    titleSuffix: 'Student Login & Registration Guide 2026: Portal Help',
    label: 'Student Login'
  },
  'documents-list': {
    titleSuffix: 'Documents Required 2026: Upload Checklist & Formats',
    label: 'Documents List'
  },
  'scholarships-list': {
    titleSuffix: 'All Scholarships List 2026: SC, ST, OBC & Merit Grants',
    label: 'Top Scholarships'
  }
};

async function checkPostExists(slug, cpt) {
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/${cpt}?slug=${slug}&status=any`, {
      headers: { 'Authorization': authHeader }
    });
    if (res.ok) {
      const posts = await res.json();
      return posts && posts.length > 0 ? posts[0] : null;
    }
  } catch (err) {
    console.error(`Error checking slug "${slug}":`, err.message);
  }
  return null;
}

async function uploadPost(title, slug, htmlContent, cpt, parentId = 0) {
  const postData = {
    title: title,
    slug: slug,
    content: htmlContent,
    status: 'publish'
  };

  if (parentId > 0) {
    postData.parent = parentId;
  }

  const existingPost = await checkPostExists(slug, cpt);

  try {
    let endpoint = `${WP_URL}/wp-json/wp/v2/${cpt}`;
    let method = 'POST';

    if (existingPost) {
      // Check if it has a parent match
      if (parentId > 0 && existingPost.parent !== parentId) {
        postData.parent = parentId;
      }
      endpoint += `/${existingPost.id}`;
      console.log(`  Updating existing ${cpt} (ID: ${existingPost.id})...`);
    } else {
      console.log(`  Creating new ${cpt}...`);
    }

    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(postData)
    });

    const result = await response.json();
    if (response.ok) {
      console.log(`  ✅ Successfully synced "${title}"! ID: ${result.id}`);
      return result.id;
    } else {
      console.error(`  ❌ Failed to sync portal post:`, result.message || result);
    }
  } catch (err) {
    console.error(`  ❌ Network error uploading "${title}":`, err.message);
  }
  return null;
}

// HTML Generator Helpers
function generateParentPortalHtml(portal) {
  let html = `
<p>${portal.description}</p>

<div class="portal-quick-stats" style="background:#f4f6fc; border-left:4px solid #1a73e8; padding:15px; margin:20px 0; border-radius:4px;">
  <h4 style="margin:0 0 10px 0; color:#1a73e8;">📊 Portal Key Information</h4>
  <ul style="margin:0; padding-left:20px;">
    <li><strong>Active Schemes:</strong> ${portal.stats.activeSchemes}</li>
    <li><strong>Annual Beneficiaries:</strong> ${portal.stats.beneficiaries}</li>
    <li><strong>Disbursement Mode:</strong> ${portal.stats.disbursementType}</li>
    <li><strong>Verification Stage:</strong> ${portal.stats.verificationMode}</li>
  </ul>
</div>

<h2>How to Login to ${portal.name}</h2>
<ol style="margin-bottom:25px;">
  ${portal.loginSteps.map(step => `
    <li style="margin-bottom:15px;">
      <strong>${step.title}</strong>
      <p style="margin:5px 0 0 0; color:#555;">${step.desc}</p>
    </li>
  `).join('')}
</ol>

<h2>How to Check Application Status</h2>
<ul style="margin-bottom:25px;">
  ${portal.statusSteps.map(step => `
    <li style="margin-bottom:10px;">
      <strong>${step.title}:</strong> ${step.desc}
    </li>
  `).join('')}
</ul>

<h2>Required Documents Checklist</h2>
<table class="wp-block-table" style="width:100%; border-collapse:collapse; margin-bottom:25px;">
  <thead>
    <tr style="background:#f5f5f5;">
      <th style="padding:10px; border:1px solid #ddd; text-align:left;">Document Name</th>
      <th style="padding:10px; border:1px solid #ddd; text-align:left;">Max File Size / Format</th>
      <th style="padding:10px; border:1px solid #ddd; text-align:left;">Important Note</th>
    </tr>
  </thead>
  <tbody>
    ${portal.documents.map(doc => `
      <tr>
        <td style="padding:10px; border:1px solid #ddd;"><strong>${doc.name}</strong></td>
        <td style="padding:10px; border:1px solid #ddd;">${doc.format}</td>
        <td style="padding:10px; border:1px solid #ddd; color:#666;">${doc.note}</td>
      </tr>
    `).join('')}
  </tbody>
</table>

<h2>Top Scholarships Hosted</h2>
<table class="wp-block-table" style="width:100%; border-collapse:collapse; margin-bottom:25px;">
  <thead>
    <tr style="background:#f5f5f5;">
      <th style="padding:10px; border:1px solid #ddd; text-align:left;">Scholarship Name</th>
      <th style="padding:10px; border:1px solid #ddd; text-align:left;">Target Group</th>
      <th style="padding:10px; border:1px solid #ddd; text-align:left;">Award Amount</th>
    </tr>
  </thead>
  <tbody>
    ${portal.topSchemes.map(sch => `
      <tr>
        <td style="padding:10px; border:1px solid #ddd;"><strong>${sch.name}</strong></td>
        <td style="padding:10px; border:1px solid #ddd;">${sch.targetGroup}</td>
        <td style="padding:10px; border:1px solid #ddd; color:#1a73e8;">${sch.amount}</td>
      </tr>
    `).join('')}
  </tbody>
</table>

<div class="portal-helpdesk-callout" style="background:#fff3cd; border:1px solid #ffeeba; border-left:4px solid #ffc107; padding:15px; border-radius:4px; margin-top:30px;">
  <h4 style="margin:0 0 10px 0; color:#856404;">📞 Official Helpdesk Support</h4>
  <p style="margin:5px 0;"><strong>Phone Helpline:</strong> ${portal.helpline.phone}</p>
  <p style="margin:5px 0;"><strong>Support Email:</strong> ${portal.helpline.email}</p>
  <p style="margin:5px 0;"><strong>Address:</strong> ${portal.helpline.address}</p>
  <p style="margin:5px 0;"><strong>Office Hours:</strong> ${portal.helpline.hours}</p>
</div>
`;

  // Add FAQs if exist
  if (portal.faqs && portal.faqs.length > 0) {
    html += `
<h2>Frequently Asked Questions (FAQs)</h2>
<div class="portal-faqs" style="margin-top:20px;">
  ${portal.faqs.map(faq => `
    <div style="margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:15px;">
      <p style="font-weight:bold; color:#333; margin-bottom:5px;">Q: ${faq.q}</p>
      <p style="color:#666; margin-top:0;">A: ${faq.a}</p>
    </div>
  `).join('')}
</div>
`;
  }

  return html;
}

function generatePortalSubpageHtml(portal, subpageKey) {
  let html = '';
  
  if (subpageKey === 'status-check') {
    html = `
<p>Checking your scholarship disbursement status regularly is essential to ensure you receive your financial aid on time. Below is the step-by-step procedure to check your status on the official ${portal.name}.</p>

<h2>Detailed Status Verification Procedure</h2>
<ol style="margin-bottom:25px;">
  ${portal.statusSteps.map(step => `
    <li style="margin-bottom:15px;">
      <strong>${step.title}</strong>
      <p style="margin:5px 0 0 0; color:#555;">${step.desc}</p>
    </li>
  `).join('')}
</ol>

<h2>Disbursement Method Details</h2>
<p>Once your application is fully approved, payments are released via <strong>${portal.stats.disbursementType}</strong>. Ensure your bank account is linked to your Aadhaar card and active to avoid transaction failures.</p>

<div class="portal-helpdesk-callout" style="background:#fff3cd; border:1px solid #ffeeba; border-left:4px solid #ffc107; padding:15px; border-radius:4px; margin-top:30px;">
  <h4 style="margin:0 0 10px 0; color:#856404;">📞 Need Help with Status?</h4>
  <p>If your status shows "Rejected" or is stuck at "Pending at Institute" for too long, contact the support line immediately:</p>
  <p style="margin:5px 0;"><strong>Phone:</strong> ${portal.helpline.phone}</p>
  <p style="margin:5px 0;"><strong>Email:</strong> ${portal.helpline.email}</p>
</div>
`;
  } 
  
  else if (subpageKey === 'student-login') {
    html = `
<p>Logging into your student profile lets you apply for renewal schemes, check notifications, and submit queries. Follow these instructions to securely login to your account on the official ${portal.name}.</p>

<h2>Portal Login & Registration Steps</h2>
<ol style="margin-bottom:25px;">
  ${portal.loginSteps.map(step => `
    <li style="margin-bottom:15px;">
      <strong>${step.title}</strong>
      <p style="margin:5px 0 0 0; color:#555;">${step.desc}</p>
    </li>
  `).join('')}
</ol>

<div style="background:#e8f0fe; border-left:4px solid #1a73e8; padding:15px; margin:25px 0; border-radius:4px;">
  <p style="margin:0;"><strong>Official Link:</strong> Access the login console directly here: <a href="${portal.officialUrl}" target="_blank" rel="noopener">${portal.officialUrl}</a></p>
</div>
`;
  } 
  
  else if (subpageKey === 'documents-list') {
    html = `
<p>Uploading incorrect document formats or blurred copies is the #1 reason why scholarship applications get rejected. Prepare clear, scanned copies of all files listed in the checklist below before applying to ${portal.name}.</p>

<h2>Required Documents Checklist & Scanned Formats</h2>
<table class="wp-block-table" style="width:100%; border-collapse:collapse; margin-bottom:25px;">
  <thead>
    <tr style="background:#f5f5f5;">
      <th style="padding:10px; border:1px solid #ddd; text-align:left;">Required Document</th>
      <th style="padding:10px; border:1px solid #ddd; text-align:left;">Max File Size / Format</th>
      <th style="padding:10px; border:1px solid #ddd; text-align:left;">Mandatory Note</th>
    </tr>
  </thead>
  <tbody>
    ${portal.documents.map(doc => `
      <tr>
        <td style="padding:10px; border:1px solid #ddd;"><strong>${doc.name}</strong></td>
        <td style="padding:10px; border:1px solid #ddd;">${doc.format}</td>
        <td style="padding:10px; border:1px solid #ddd; color:#666;">${doc.note}</td>
      </tr>
    `).join('')}
  </tbody>
</table>
`;
  } 
  
  else if (subpageKey === 'scholarships-list') {
    html = `
<p>The following verified scholarships are currently hosted on the ${portal.name}. You can submit your application for any of these schemes by logging in during the open application window.</p>

<h2>Active Scholarships hosted on ${portal.name}</h2>
<table class="wp-block-table" style="width:100%; border-collapse:collapse; margin-bottom:25px;">
  <thead>
    <tr style="background:#f5f5f5;">
      <th style="padding:10px; border:1px solid #ddd; text-align:left;">Scholarship Scheme Name</th>
      <th style="padding:10px; border:1px solid #ddd; text-align:left;">Target Student Group</th>
      <th style="padding:10px; border:1px solid #ddd; text-align:left;">Annual Benefit Amount</th>
    </tr>
  </thead>
  <tbody>
    ${portal.topSchemes.map(sch => `
      <tr>
        <td style="padding:10px; border:1px solid #ddd;"><strong>${sch.name}</strong></td>
        <td style="padding:10px; border:1px solid #ddd;">${sch.targetGroup}</td>
        <td style="padding:10px; border:1px solid #ddd; color:#1a73e8;">${sch.amount}</td>
      </tr>
    `).join('')}
  </tbody>
</table>
`;
  }

  return html;
}

async function run() {
  console.log('🏁 Starting Portal Guides Migration to WordPress (CPT: portal)...');
  
  const portalIds = Object.keys(PORTALS_DATA);
  console.log(`Found ${portalIds.length} portals in data file.`);

  for (const id of portalIds) {
    const portal = PORTALS_DATA[id];
    console.log(`\n--------------------------------------------`);
    console.log(`Processing Portal: "${portal.name}" (slug: ${portal.id})...`);
    
    // 1. Sync Parent Portal Page
    const parentHtml = generateParentPortalHtml(portal);
    const parentPostId = await uploadPost(portal.fullTitle, portal.id, parentHtml, 'portal', 0);
    
    if (!parentPostId) {
      console.error(`❌ Failed to sync parent portal page for "${portal.name}". Skipping child pages.`);
      continue;
    }

    // 2. Sync nested child subpages
    const subpageKeys = Object.keys(PORTAL_SUBPAGES);
    for (const key of subpageKeys) {
      const config = PORTAL_SUBPAGES[key];
      const childTitle = `${portal.name} ${config.titleSuffix}`;
      const childSlug = `${portal.id}-${key}`; // unique slug key (e.g. e-kalyan-jharkhand-status-check)
      
      console.log(`  Syncing Portal Sub-page: "${config.label}" (slug: ${childSlug})...`);
      const childHtml = generatePortalSubpageHtml(portal, key);
      
      await uploadPost(childTitle, childSlug, childHtml, 'portal', parentPostId);
    }
  }

  console.log('\n🏆 Portal Guides Migration Finished!');
}

run();
