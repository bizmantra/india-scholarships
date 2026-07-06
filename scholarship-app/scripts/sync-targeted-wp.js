// scripts/sync-targeted-wp.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const Database = require('better-sqlite3');

const WP_URL = 'https://mediumpurple-sparrow-753119.hostingersite.com';
const USERNAME = process.env.WORDPRESS_USERNAME;
const APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

if (!USERNAME || !APP_PASSWORD) {
  console.error('❌ Error: WORDPRESS_USERNAME and WORDPRESS_APP_PASSWORD must be defined in your .env.local file.');
  process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString('base64');
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

const slugsToSync = [
  'bits-pilani-tuition-blind-admission-scholarship',
  'bits-pilani-institute-merit-mcn-awards',
  'bits-pilani-board-topper-alumni-scholarships',
  'iit-bombay-merit-cum-means-scholarship',
  'iit-bombay-free-messing-facility',
  'iit-bombay-tuition-fee-remission',
  'iit-delhi-merit-cum-means-scholarship',
  'iit-delhi-free-studentship-fee-remission',
  'iit-delhi-donor-endowed-scholarships',
  'iit-madras-merit-cum-means-alumni-tuition-support',
  'iit-madras-institute-tuition-fee-waiver',
  'iit-kharagpur-merit-cum-means-scholarship',
  'iit-kharagpur-endowment-donor-scholarships',
  'iit-kharagpur-free-studentship-fee-remission',
  'nit-trichy-tuition-fee-remission',
  'nit-trichy-recal-foundation-scholarships',
  'nit-surathkal-merit-cum-means-scholarships',
  'nit-surathkal-tuition-fee-remission',
  'nit-surathkal-garrett-memorial-scholarships'
];

// Helper to try parsing JSON arrays safely
function parseJsonSafe(val, fallback = []) {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
}

async function syncTargeted() {
  console.log(`🔄 Loading targeted ${slugsToSync.length} scholarships from SQLite...`);
  
  const placeholders = slugsToSync.map(() => '?').join(',');
  const rows = db.prepare(`SELECT * FROM scholarships WHERE slug IN (${placeholders})`).all(...slugsToSync);
  console.log(`Loaded ${rows.length} scholarships to sync.`);

  for (const row of rows) {
    console.log(`\nSyncing "${row.title}" (slug: ${row.slug})...`);
    
    // 1. Check if post already exists on WordPress by matching slug
    let post = null;
    try {
      const searchRes = await fetch(`${WP_URL}/wp-json/wp/v2/scholarship?slug=${row.slug}`, {
        headers: { 'Authorization': authHeader }
      });
      if (searchRes.ok) {
        const matches = await searchRes.json();
        if (matches && matches.length > 0) {
          post = matches[0];
        }
      }
    } catch (err) {
      console.error(`Error checking slug "${row.slug}":`, err.message);
      continue;
    }

    // Helper to translate level names to match WordPress strict select options
    const mapLevelsToWp = (levelStr) => {
      if (!levelStr) return [];
      const val = String(levelStr).toLowerCase();
      const output = new Set();

      if (val.includes('class 1') || val.includes('class 5') || val.includes('class 6') || val.includes('class 8') || val.includes('class 9') || val.includes('class 10') || val.includes('school') || val.includes('pre-matric')) {
        output.add('Class 1-10');
      }
      if (val.includes('class 11') || val.includes('class 12') || val.includes('higher secondary') || val.includes('post-matric') || val.includes('puc')) {
        output.add('Class 11-12');
      }
      if (val.includes('diploma') || val.includes('polytechnic')) {
        output.add('Diploma / Polytechnic');
      }
      if (val.includes('iti') || val.includes('itc')) {
        output.add('ITI Courses');
      }
      if (val.includes('undergraduate') || val.includes('graduation') || val.includes('ug') || val.includes('b.sc') || val.includes('btech') || val.includes('mbbs')) {
        output.add('Graduation (UG)');
      }
      if (val.includes('postgraduate') || val.includes('post-graduate') || val.includes('pg') || val.includes('m.sc') || val.includes('mtech') || val.includes('mba')) {
        output.add('Post-Graduation (PG)');
      }
      if (val.includes('phd') || val.includes('ph.d') || val.includes('research') || val.includes('fellowship')) {
        output.add('PhD & Research');
      }

      return Array.from(output);
    };

    const formatStringField = (val) => {
      if (!val) return '';
      const list = parseJsonSafe(val, [val]);
      return Array.isArray(list) ? list.join(', ') : String(val);
    };

    const mapProviderType = (typeStr) => {
      if (!typeStr) return 'Government';
      const val = String(typeStr).trim().toLowerCase();
      if (val.includes('government') || val.includes('state') || val.includes('central')) return 'Government';
      if (val.includes('corporate') || val.includes('company')) return 'Corporate';
      if (val.includes('private') || val.includes('trust') || val.includes('foundation')) return 'Private';
      return 'Government';
    };

    const mapGender = (genderStr) => {
      if (!genderStr) return 'All';
      const val = String(genderStr).trim().toLowerCase();
      if (val === 'female' || val === 'girls' || val.includes('female only') || val.includes('girls only')) return 'Female Only';
      if (val === 'male' || val === 'boys' || val.includes('male only') || val.includes('boys only')) return 'Male Only';
      return 'All';
    };

    const postData = {
      title: row.title,
      slug: row.slug,
      status: 'publish',
      acf: {
        provider: row.provider || '',
        provider_type: mapProviderType(row.provider_type),
        intro_seo: row.intro_seo || '',
        amount_annual: row.amount_annual ? Number(row.amount_annual) : 0,
        amount_min: row.amount_min ? Number(row.amount_min) : 0,
        amount_description: row.amount_description || '',
        benefits: row.benefits || '',
        income_limit: row.income_limit ? Number(row.income_limit) : 0,
        min_marks: row.min_marks ? Number(row.min_marks) : 0,
        level: mapLevelsToWp(row.level),
        state: formatStringField(row.state),
        gender: mapGender(row.gender),
        age_limit: row.age_limit || '',
        caste: formatStringField(row.caste),
        selection: row.selection || '',
        renewal: row.renewal || '',
        step_guide: row.step_guide || '',
        docs_needed: formatStringField(row.docs_needed),
        apply_url: row.apply_url || '',
        deadline: row.deadline || '',
        deadline_description: row.deadline_description || '',
        helpline: row.helpline || '',
        faq_json: row.faq_json || '[]',
        tags: formatStringField(row.tags),
        thumbnail_url: row.thumbnail_url || ''
      }
    };

    try {
      let endpoint = `${WP_URL}/wp-json/wp/v2/scholarship`;
      let method = 'POST';

      if (post) {
        endpoint += `/${post.id}`;
        console.log(`  Updating existing post (ID: ${post.id})...`);
      } else {
        console.log(`  Creating new post...`);
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
        console.log(`  ✅ Successfully synchronized! ID: ${result.id}`);
      } else {
        console.error(`  ❌ Failed to sync:`, result.message || result);
      }
    } catch (err) {
      console.error(`  ❌ Network error syncing "${row.title}":`, err.message);
    }
  }

  console.log('\n🏁 Targeted synchronization complete!');
  db.close();
}

syncTargeted().catch(console.error);
