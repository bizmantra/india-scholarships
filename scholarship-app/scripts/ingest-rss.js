const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const Parser = require('rss-parser');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is not defined in .env.local");
    process.exit(1);
}

const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');
const DRAFTS_DIR = path.join(__dirname, '..', 'content', 'news', 'drafts');

// Ensure drafts directory exists
fs.mkdirSync(DRAFTS_DIR, { recursive: true });

// Define test feeds (Google News search RSS format)
const FEEDS = [
    {
        name: 'NSP Central Portal Updates',
        url: 'https://news.google.com/rss/search?q=National+Scholarship+Portal+OR+NSP+deadline+extended+OR+status&hl=en-IN&gl=IN&ceid=IN:en'
    },
    {
        name: 'SSP Karnataka Portal Updates',
        url: 'https://news.google.com/rss/search?q=SSP+Karnataka+scholarship+registration+OR+status&hl=en-IN&gl=IN&ceid=IN:en'
    },
    {
        name: 'UP Scholarship Portal Updates',
        url: 'https://news.google.com/rss/search?q=UP+Scholarship+registration+last+date+OR+disbursement&hl=en-IN&gl=IN&ceid=IN:en'
    },
    {
        name: 'CSR & Private Scholarship Updates (High Impressions)',
        url: 'https://news.google.com/rss/search?q=Sitaram+Jindal+scholarship+OR+HDFC+Parivartan+scholarship&hl=en-IN&gl=IN&ceid=IN:en'
    },
    {
        name: 'AICTE & Technical Schemes (Low CTR Targets)',
        url: 'https://news.google.com/rss/search?q=AICTE+Pragati+scholarship+OR+AICTE+Swanath&hl=en-IN&gl=IN&ceid=IN:en'
    },
    {
        name: 'Telangana & MP Portal Status (High Search Volume)',
        url: 'https://news.google.com/rss/search?q=Telangana+epass+scholarship+OR+MPTAAS+scholarship&hl=en-IN&gl=IN&ceid=IN:en'
    },
    {
        name: 'PM YASASVI & Yashasvi Scheme Alerts',
        url: 'https://news.google.com/rss/search?q=PM+YASASVI+scholarship+OR+Yashasvi+scholarship+OR+Yasaswi+scholarship&hl=en-IN&gl=IN&ceid=IN:en'
    },
    {
        name: 'Overseas & Study Abroad Scholarship Alerts',
        url: 'https://news.google.com/rss/search?q=Chevening+Scholarship+OR+Rhodes+Scholarship+OR+Commonwealth+Scholarship&hl=en-IN&gl=IN&ceid=IN:en'
    }
];

const parser = new Parser();

// Helper to load current scholarships mapping
function getScholarshipLookup() {
    if (!fs.existsSync(DB_PATH)) {
        return [];
    }
    const db = new Database(DB_PATH);
    const rows = db.prepare("SELECT title, slug FROM scholarships WHERE status = 'Active' OR status IS NULL").all();
    db.close();
    return rows;
}

// Convert title to slug
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

// Prompt Gemini to curate and rewrite the news article
async function curateNewsWithGemini(feedItem, scholarshipLookup) {
    const lookupString = scholarshipLookup.map(s => `- Title: "${s.title}", Slug: "${s.slug}"`).join('\n');

    const prompt = `You are a premium education content curator for IndiaScholarships.in.
We have found a trending news update in Google News:
Title: "${feedItem.title}"
Published Date: "${feedItem.pubDate}"
Original Link: "${feedItem.link}"
Snippet: "${feedItem.contentSnippet || feedItem.content || ''}"

Your task is to verify the details of this news alert, research the official current parameters (such as eligibility, deadlines, state, portal links) using your search tool, and rewrite it into a highly curated, clear, search-optimized news update.

### Instructions and Guidelines:
1. **Short Sentences:** Maximum 15 words per sentence.
2. **Short Paragraphs:** Maximum 3 lines per paragraph.
3. **No Fluff:** Maintain simple English, zero jargon, clear and helpful tone.
4. **Takeaways:** Define 3 high-impact bulleted key takeaways at the top.
5. **Aadhaar/DBT Reminders:** If this update mentions portal registrations, include practical warnings/tips (like NPCI bank account mapping).
6. **Related Scholarships:** Select matching related scholarships from this active database list (provide their slugs EXACTLY if related):
${lookupString}
7. **Frontmatter:** Output the parsed metadata exactly in YAML frontmatter format:
---
title: "A clear, actionable news title"
date: "YYYY-MM-DD"
author: "IndiaScholarships Editorial Team"
tag: "News Update"
targetMoneyLink: "A link to the main portal or eligibility tool, e.g. '/scholarships/[slug]'"
relatedScholarships:
  - "slug-1"
  - "slug-2"
takeaways:
  - "Takeaway bullet 1"
  - "Takeaway bullet 2"
  - "Takeaway bullet 3"
---

Response format:
Respond with ONLY raw markdown content containing the YAML frontmatter block followed by the markdown content. Do not wrap the markdown output in triple backticks (\`\`\`).`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],
        tools: [
            {
                googleSearch: {}
            }
        ]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response candidates returned from Gemini");
    }

    return data.candidates[0].content.parts[0].text.trim();
}

async function runPipeline() {
    console.log("🚀 Starting RSS Ingestion & Curation Pipeline...");
    
    const scholarships = getScholarshipLookup();
    console.log(`Loaded ${scholarships.length} scholarships for matching lookup.`);

    for (const feed of FEEDS) {
        console.log(`\nFetching feed: ${feed.name}...`);
        try {
            const feedData = await parser.parseURL(feed.url);
            // Get latest 2 items for test
            const items = feedData.items.slice(0, 2);
            console.log(`Found ${feedData.items.length} items. Processing latest ${items.length}...`);

            for (const item of items) {
                const slug = slugify(item.title).slice(0, 80);
                const outputPath = path.join(DRAFTS_DIR, `${slug}.md`);

                if (fs.existsSync(outputPath)) {
                    console.log(`- Skipping already processed item: "${item.title}"`);
                    continue;
                }

                console.log(`- Curating new item: "${item.title}"`);
                try {
                    const curatedMarkdown = await curateNewsWithGemini(item, scholarships);
                    fs.writeFileSync(outputPath, curatedMarkdown, 'utf8');
                    console.log(`  Saved curated draft: ${outputPath}`);
                } catch (curationError) {
                    console.error(`  ❌ Error curating item: ${curationError.message}`);
                }
            }
        } catch (feedError) {
            console.error(`❌ Error fetching feed ${feed.name}: ${feedError.message}`);
        }
    }
    console.log("\n✅ Pipeline execution complete.");
}

runPipeline();
