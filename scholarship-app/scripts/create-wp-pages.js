// scripts/create-wp-pages.js
// Script to programmatically check, create, and populate required page routes on WordPress with Next.js content.
// Run: node scripts/create-wp-pages.js

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

const aboutUsContent = `
<div style="font-family:'Inter',sans-serif; line-height:1.75; color:#334155;">
    <div style="margin-bottom:40px; text-align:center; max-width:800px; margin-left:auto; margin-right:auto;">
        <span style="color:#2563eb; font-weight:800; uppercase tracking-widest text-xs px-3 py-1 bg-blue-50 rounded-full;">Our Mission</span>
        <h2 style="font-size:36px; font-weight:900; color:#0f172a; margin-top:15px; margin-bottom:20px; tracking-tight: -0.025em;">Democratizing Access to Education Funding</h2>
        <p style="font-size:18px; color:#475569;">
            IndiaScholarships is a scholarship decision engine designed to eliminate information asymmetry, helping every eligible student in India find and win the financial aid they deserve.
        </p>
    </div>

    <!-- Visual Stats Grid -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-bottom:50px;">
        <div style="background:#eff6ff; padding:30px; border-radius:20px; border:1px solid #dbeafe; text-align:center;">
            <h3 style="color:#1d4ed8; font-weight:bold; margin:0 0 5px 0; text-transform:uppercase; font-size:12px; tracking-wider: 0.05em;">Verified Schemes</h3>
            <p style="font-size:36px; font-weight:900; color:#1e3a8a; margin:0;">1,000+</p>
        </div>
        <div style="background:#fff7ed; padding:30px; border-radius:20px; border:1px solid #ffedd5; text-align:center;">
            <h3 style="color:#c2410c; font-weight:bold; margin:0 0 5px 0; text-transform:uppercase; font-size:12px; tracking-wider: 0.05em;">Target Audience</h3>
            <p style="font-size:36px; font-weight:900; color:#7c2d12; margin:0;">80M+ Eligible</p>
        </div>
        <div style="background:#f0fdf4; padding:30px; border-radius:20px; border:1px solid #dcfce7; text-align:center;">
            <h3 style="color:#15803d; font-weight:bold; margin:0 0 5px 0; text-transform:uppercase; font-size:12px; tracking-wider: 0.05em;">Data Accuracy</h3>
            <p style="font-size:36px; font-weight:900; color:#14532d; margin:0;">100% Verified</p>
        </div>
    </div>

    <!-- Details Grid -->
    <div style="display:grid; grid-template-columns:1fr; gap:30px; margin-bottom:50px;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:30px; border-radius:24px;">
            <h3 style="font-size:24px; font-weight:800; color:#0f172a; margin-top:0; margin-bottom:15px;">The Problem We Are Solving</h3>
            <p>Every year, Indian students miss out on over <strong>₹10,000+ crore</strong> in unclaimed government, corporate, and private scholarships. This massive loss is driven by:</p>
            <ul style="padding-left:20px; margin-bottom:0; display:flex; flex-direction:column; gap:10px;">
                <li><strong>Information Scatter:</strong> Opportunities are spread across 50+ government portals and hundreds of corporate CSR websites.</li>
                <li><strong>Eligibility Overload:</strong> Complex qualifications spanning caste, income, state, marks, and gender.</li>
                <li><strong>Outdated Content:</strong> Spam blogs spreading expired deadlines and wrong application procedures.</li>
            </ul>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:30px; border-radius:24px;">
            <h3 style="font-size:24px; font-weight:800; color:#0f172a; margin-top:0; margin-bottom:15px;">How We Solve It</h3>
            <p>Unlike traditional databases that list basic details, our platform is a <strong>decision engine</strong>. We provide:</p>
            <ul style="padding-left:20px; margin-bottom:0; display:flex; flex-direction:column; gap:10px; list-style-type:none;">
                <li style="margin-bottom:8px;">✓ <strong>29 Enriched Data Fields:</strong> Deep detail for every scholarship, from exact document checklists to principal verifications.</li>
                <li style="margin-bottom:8px;">✓ <strong>Smart Eligibility Checks:</strong> Match your profile instantly against hundreds of active funds.</li>
                <li style="margin-bottom:8px;">✓ <strong>Step-by-Step Application Guides:</strong> Clear screenshots and walk-throughs for complex portals.</li>
            </ul>
        </div>
    </div>

    <!-- Core Principles -->
    <div style="margin-bottom:50px;">
        <h3 style="font-size:28px; font-weight:800; color:#0f172a; text-align:center; margin-bottom:30px;">Our Core Principles</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:25px;">
            <div style="border:1px solid #e2e8f0; padding:24px; border-radius:20px;">
                <div style="font-size:32px; margin-bottom:15px;">🛡️</div>
                <h4 style="font-size:18px; font-weight:bold; margin-top:0; margin-bottom:10px;">Trust First</h4>
                <p style="font-size:13.5px; margin:0; color:#475569;">We utilize multi-source verification. We would rather mark a field "Unknown" than present unverified data. Zero hallucinations policy.</p>
            </div>
            <div style="border:1px solid #e2e8f0; padding:24px; border-radius:20px;">
                <div style="font-size:32px; margin-bottom:15px;">🎯</div>
                <h4 style="font-size:18px; font-weight:bold; margin-top:0; margin-bottom:10px;">Decision Support</h4>
                <p style="font-size:13.5px; margin:0; color:#475569;">We don't just dump lists of scholarships. We rank programs by likelihood of selection, difficulty, and total cash benefits.</p>
            </div>
            <div style="border:1px solid #e2e8f0; padding:24px; border-radius:20px;">
                <div style="font-size:32px; margin-bottom:15px;">⚡</div>
                <h4 style="font-size:18px; font-weight:bold; margin-top:0; margin-bottom:10px;">Mobile-First Design</h4>
                <p style="font-size:13.5px; margin:0; color:#475569;">Built for mobile devices. Clean, modern, responsive interfaces that make application processes friction-free.</p>
            </div>
        </div>
    </div>
</div>
`;

const privacyContent = `
<div style="font-family:'Inter',sans-serif; line-height:1.75; color:#334155;">
    <p>Last updated: June 25, 2026</p>
    <p style="font-size:16px;">
        At IndiaScholarships, accessible from <strong>indiascholarships.in</strong>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by IndiaScholarships and how we use it.
    </p>
    <p>
        If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong>contact@indiascholarships.in</strong>.
    </p>

    <h2 style="font-size:22px; font-weight:bold; color:#0f172a; margin-top:30px;">Google DoubleClick DART Cookie & AdSense Disclosures</h2>
    <p>
        Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. Visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a>.
    </p>

    <h2 style="font-size:22px; font-weight:bold; color:#0f172a; margin-top:30px;">Information We Collect</h2>
    <p>
        The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
    </p>

    <h2 style="font-size:22px; font-weight:bold; color:#0f172a; margin-top:30px;">How We Use Your Information</h2>
    <ul style="padding-left:20px;">
        <li>Provide, operate, and maintain our website</li>
        <li>Improve, personalize, and expand our website</li>
        <li>Understand and analyze how you use our website</li>
        <li>Develop new products, services, features, and functionality</li>
        <li>Communicate with you for updates and promotional reasons</li>
    </ul>

    <h2 style="font-size:22px; font-weight:bold; color:#0f172a; margin-top:30px;">Log Files</h2>
    <p>
        IndiaScholarships follows a standard procedure of using log files. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
    </p>
</div>
`;

const termsContent = `
<div style="font-family:'Inter',sans-serif; line-height:1.75; color:#334155;">
    <p>Last updated: June 25, 2026</p>
    <p style="font-size:16px;">
        Welcome to IndiaScholarships! By accessing or using our website, located at <strong>indiascholarships.in</strong>, you agree to comply with and be bound by the following Terms of Service. If you do not agree to these terms, please do not use our website.
    </p>

    <h2 style="font-size:22px; font-weight:bold; color:#0f172a; margin-top:30px;">1. Use of the Site</h2>
    <p>
        IndiaScholarships is a decision engine and directory designed to help students discover and verify educational funding opportunities. You are granted a limited, non-exclusive, revocable license to access and use the information on this website solely for personal, non-commercial purposes.
    </p>

    <h2 style="font-size:22px; font-weight:bold; color:#0f172a; margin-top:30px;">2. Content Accuracy and Disclaimer</h2>
    <p>
        While we strive to provide 100% verified, accurate, and up-to-date information on scholarships, deadlines, eligibility criteria, and application processes:
    </p>
    <ul style="padding-left:20px;">
        <li>All content on IndiaScholarships is provided for general informational purposes only.</li>
        <li>Scholarship requirements, amounts, and deadlines are subject to change by their respective providers at any time without notice.</li>
        <li><strong>We strongly advise users to double-check details with the official scholarship provider or portal before making any financial or academic decisions.</strong></li>
    </ul>

    <h2 style="font-size:22px; font-weight:bold; color:#0f172a; margin-top:30px;">3. Limitation of Liability</h2>
    <p>
        In no event shall IndiaScholarships, its creators, or partners be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use or inability to use this website.
    </p>
</div>
`;

const pagesToCreate = [
  // CPT directory Pages
  {
    title: 'Trending Scholarships',
    slug: 'trending',
    template: 'template-scholarship-list.php',
    content: 'Latest trending scholarships list dynamically matched by views and popularity.'
  },
  {
    title: 'Scholarship Deadlines',
    slug: 'deadlines',
    template: 'template-scholarship-list.php',
    content: 'Upcoming scholarship deadlines tracker.'
  },
  {
    title: 'Recently Added Scholarships',
    slug: 'recently-added',
    template: 'template-scholarship-list.php',
    content: 'Check out the newly added scholarship programs.'
  },
  {
    title: 'Study Abroad & International Scholarships',
    slug: 'international',
    template: 'template-scholarship-list.php',
    content: 'Opportunities for Indian students to study abroad.'
  },
  {
    title: 'Government Scholarships',
    slug: 'government-scholarships',
    template: 'template-scholarship-list.php',
    content: 'Verified central and state government funding schemes.'
  },
  {
    title: 'Private Scholarships',
    slug: 'private-scholarships',
    template: 'template-scholarship-list.php',
    content: 'Corporate CSR funds, private foundation grants, and NGO trusts.'
  },
  {
    title: 'Corporate Scholarships',
    slug: 'corporate-scholarships',
    template: 'template-scholarship-list.php',
    content: 'Corporate CSR-funded scholarship opportunities.'
  },
  {
    title: 'Scholarships by State',
    slug: 'state-scholarships',
    template: 'template-directory.php',
    content: 'Filter and browse scholarships by state domicile criteria.'
  },
  {
    title: 'Scholarships by Category',
    slug: 'scholarships-by-category',
    template: 'template-directory.php',
    content: 'Search active programs matching your specific category.'
  },
  {
    title: 'Scholarships by Education Level',
    slug: 'scholarships-by-education',
    template: 'template-directory.php',
    content: 'Search active programs matching your specific educational bracket.'
  },
  {
    title: 'Scholarships by Course',
    slug: 'scholarships-by-course',
    template: 'template-directory.php',
    content: 'Explore scholarships matching technical, professional, or general degree streams.'
  },
  // Informational Pages
  {
    title: 'About Us',
    slug: 'about-us',
    content: aboutUsContent
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: privacyContent
  },
  {
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: termsContent
  }
];

async function createPages() {
  console.log('🔄 Checking and creating required page routes on WordPress...');

  for (const page of pagesToCreate) {
    console.log(`\nChecking page: "${page.title}" (slug: ${page.slug})...`);

    // 1. Check if the page exists
    let existingPage = null;
    try {
      const res = await fetch(`${WP_URL}/wp-json/wp/v2/pages?slug=${page.slug}&status=any`, {
        headers: { 'Authorization': authHeader }
      });
      if (res.ok) {
        const matches = await res.json();
        if (matches && matches.length > 0) {
          existingPage = matches[0];
        }
      }
    } catch (e) {
      console.error(`Error querying slug "${page.slug}":`, e.message);
      continue;
    }

    const payload = {
      title: page.title,
      slug: page.slug,
      template: page.template,
      content: page.content,
      status: 'publish'
    };

    async function sendRequest(isRetry = false) {
      const data = { ...payload };
      if (isRetry) {
        delete data.template;
      }
      
      if (existingPage) {
        return fetch(`${WP_URL}/wp-json/wp/v2/pages/${existingPage.id}`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      } else {
        return fetch(`${WP_URL}/wp-json/wp/v2/pages`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }
    }

    try {
      let res = await sendRequest(false);
      if (!res.ok) {
        const err = await res.json();
        if (err.code === 'rest_invalid_param' && err.message.includes('template')) {
          console.log(`⚠️ WordPress rejected template "${page.template}" (child theme might not be active yet). Retrying without template...`);
          res = await sendRequest(true);
        }
      }
      
      if (res.ok) {
        console.log(`✅ Page "${page.title}" set up successfully (URL: /${page.slug}/)!`);
      } else {
        const errBody = await res.json();
        console.error(`❌ Failed setting up page "${page.title}":`, errBody);
      }
    } catch (err) {
      console.error(`Error setting up page:`, err.message);
    }
  }

  console.log('\n🎉 Finished setting up all required page routes!');
}

createPages();
