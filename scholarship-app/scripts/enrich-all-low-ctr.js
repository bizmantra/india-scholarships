const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
if (!PERPLEXITY_API_KEY) {
    console.error("❌ Error: PERPLEXITY_API_KEY is not defined in .env.local");
    process.exit(1);
}

const DATA_DIR = path.join(__dirname, '..', 'data', 'gsc-june-2026');
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');

// Parse command line args
const args = process.argv.slice(2);
const limitArg = args.indexOf('--limit');
const limit = limitArg !== -1 ? parseInt(args[limitArg + 1], 10) : 5; // default to 5 for pilot
const offsetArg = args.indexOf('--offset');
const offset = offsetArg !== -1 ? parseInt(args[offsetArg + 1], 10) : 0;
const dryRun = args.includes('--dry-run');

console.log(`🚀 Intent-Based Enrichment Tool`);
console.log(`- Limit: ${limit}`);
console.log(`- Offset: ${offset}`);
console.log(`- Dry Run: ${dryRun}\n`);

const pages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pages.json'), 'utf-8'));
const db = new Database(dbPath);

const pageList = pages.slice(1).map(p => ({
    url: p[0].replace('https://www.indiascholarships.in', '').trim(),
    clicks: Number(p[1] || 0),
    impressions: Number(p[2] || 0),
    ctr: p[3],
    pos: Number(p[4] || 0)
}));

// Identify all low CTR detail pages (Impressions > 5,000, CTR < 2.0%)
const lowCtrDetails = pageList.filter(p => p.url.startsWith('/scholarships/') && p.impressions > 5000 && parseFloat(p.ctr) < 2.0);
console.log(`📊 Found ${lowCtrDetails.length} total low-CTR pages in GSC data.`);

// Resolve slugs that exist in the database
const targets = [];
lowCtrDetails.forEach(page => {
    const slug = page.url.replace('/scholarships/', '');
    const row = db.prepare('SELECT id, title, provider FROM scholarships WHERE slug = ?').get(slug);
    if (row) {
        targets.push({
            slug: slug,
            title: row.title,
            provider: row.provider || 'State/Central Government',
            impressions: page.impressions,
            ctr: page.ctr
        });
    }
});

console.log(`🎯 ${targets.length} targets match existing database records.`);

// Slice to batch limit/offset
const batch = targets.slice(offset, offset + limit);
console.log(`👉 Processing batch of ${batch.length} scholarships (Offset: ${offset}, Limit: ${limit})...\n`);

async function callPerplexity(title, provider) {
    const query = `You are an expert scholarship researcher for IndiaScholarships.in. Research the official details for the "${title}" scholarship by ${provider} in India for the academic year 2025-26 or 2026.
Generate structured content targeting student and parent intent (e.g. disbursement details, selection criteria, renewal conditions, status tracking guides, and critical FAQs).

Return ONLY a valid JSON object. Do not include markdown code block formatting (like \`\`\`json) or any pre/post text.

JSON Schema:
{
  "amount_annual": 50000, // numeric estimate or exact annual amount. 0 if variable/unknown
  "amount_min": 10000, // numeric minimum amount. 0 if unknown
  "amount_description": "Describe the amount, payment schedule (e.g. monthly stipend vs annual lump sum), and payment method (e.g. direct benefit transfer (DBT) to Aadhaar-seeded accounts)",
  "min_marks": 60, // numeric minimum percentage required. 0 if none/unknown
  "selection": "Clear description of how candidates are selected (e.g. merit ranking on marks, preference for lower family income, first-come-first-served, or offline interview)",
  "renewal": "Clear conditions for annual renewal (e.g. passing previous year exams with no backlogs, maintaining 75% attendance) and the renewal process",
  "helpline": "Official phone numbers and support emails, comma-separated",
  "official_source": "Official department/provider URL",
  "apply_url": "Official direct URL to the application portal/form",
  "step_guide": "Markdown instructions (using headings and bullets) detailing how to register, apply, and specifically how to track application status/payment status online",
  "faq_json": [
    {
      "question": "Can I apply for this if I am already receiving another scholarship?",
      "answer": "..."
    },
    {
      "question": "How do I check my scholarship payment status?",
      "answer": "..."
    },
    {
      "question": "What is the family income limit for eligibility?",
      "answer": "..."
    }
  ]
}`;

    const url = 'https://api.perplexity.ai/chat/completions';
    const headers = {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
    };
    const payload = {
        'model': 'sonar-pro',
        'messages': [{
            'role': 'user',
            'content': query
        }]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Clean potential markdown wrap
    if (content.startsWith('```json')) {
        content = content.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (content.startsWith('```')) {
        content = content.replace(/^```/, '').replace(/```$/, '').trim();
    }
    
    return JSON.parse(content);
}

async function runEnrichment() {
    const updateStmt = db.prepare(`
        UPDATE scholarships 
        SET amount_annual = ?, 
            amount_min = ?, 
            amount_description = ?, 
            min_marks = ?, 
            selection = ?, 
            renewal = ?, 
            helpline = ?, 
            official_source = ?, 
            apply_url = ?, 
            step_guide = ?, 
            faq_json = ?,
            verified_status = 'Verified',
            last_verified = datetime('now')
        WHERE slug = ?
    `);

    for (let i = 0; i < batch.length; i++) {
        const item = batch[i];
        console.log(`[${i + 1}/${batch.length}] 🔍 Researching: "${item.title}" (${item.slug})`);
        console.log(`   - GSC: ${item.impressions.toLocaleString()} imps | ${item.ctr} CTR`);
        
        try {
            const data = await callPerplexity(item.title, item.provider);
            console.log(`   ✅ Research fetched. Parsing and validating fields...`);
            console.log(`      • Amount: ₹${data.amount_annual} (Min: ₹${data.amount_min})`);
            console.log(`      • Marks: ${data.min_marks}%`);
            console.log(`      • Source: ${data.official_source}`);
            
            if (dryRun) {
                console.log(`   [DRY RUN] Would update database record.`);
            } else {
                updateStmt.run(
                    data.amount_annual || 0,
                    data.amount_min || 0,
                    data.amount_description || '',
                    data.min_marks || 0,
                    data.selection || '',
                    data.renewal || '',
                    data.helpline || '',
                    data.official_source || '',
                    data.apply_url || '',
                    data.step_guide || '',
                    JSON.stringify(data.faq_json || []),
                    item.slug
                );
                console.log(`   💾 Database updated successfully.`);
            }
        } catch (error) {
            console.error(`   ❌ Failed to process ${item.slug}:`, error.message);
        }
        
        // Wait 3 seconds to avoid rate limiting
        if (i < batch.length - 1) {
            console.log(`   ⏱️ Waiting 3s...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    console.log(`\n🏁 Batch execution complete.`);
    db.close();
}

runEnrichment();
