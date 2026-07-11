const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found in .env.local");
    process.exit(1);
}

const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(DB_PATH);

const locales = [
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'or', name: 'Odia' },
    { code: 'kn', name: 'Kannada' }
];

// Helper to delay execution (respect RPM limits of Free Tier)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateText(scholarship, localeObj) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const sourceData = {
        title: scholarship.title,
        amount_description: scholarship.amount_description || '',
        benefits: scholarship.benefits || '',
        selection: scholarship.selection || '',
        renewal: scholarship.renewal || '',
        step_guide: scholarship.step_guide || '',
        faq_json: tryParseJSON(scholarship.faq_json, []),
        intro_seo: scholarship.intro_seo || ''
    };

    const prompt = `You are an expert translator. Translate the following scholarship details from English into ${localeObj.name} (locale code: ${localeObj.code}).
Provide a translation that sounds natural and professional for students in India.
Make sure to translate all text fields accurately, but keep numbers, names, URLs, and technical codes (like Aadhaar, NPCI, DBT, SSP, NSP) unchanged.

Translate the "faq_json" array structure (translate both questions and answers).

Source content:
${JSON.stringify(sourceData, null, 2)}

Return a JSON object exactly matching this schema:
{
  "title": "translated title",
  "amount_description": "translated amount description",
  "benefits": "translated benefits",
  "selection": "translated selection process",
  "renewal": "translated renewal policy",
  "step_guide": "translated step by step guide",
  "faq_json": [
     {"question": "translated question", "answer": "translated answer"}
  ],
  "intro_seo": "translated seo introduction"
}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Gemini API error (Status ${res.status}): ${errBody}`);
        }

        const data = await res.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textResponse) {
            throw new Error("Empty response from Gemini API");
        }
        
        return JSON.parse(textResponse);
    } catch (error) {
        console.error(`❌ Translation API Error for ${scholarship.title} to ${localeObj.name}:`, error.message);
        return null;
    }
}

function tryParseJSON(value, fallback) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
        return fallback;
    }
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

async function run() {
    // Parse arguments
    const args = process.argv.slice(2);
    let limit = null;
    if (args.includes('--limit')) {
        const idx = args.indexOf('--limit');
        limit = parseInt(args[idx + 1], 10);
    }
    const fast = args.includes('--fast');
    const delayMs = fast ? 50 : 4500;

    console.log('🏁 Starting Database Multilingual Translation Script...');
    if (fast) {
        console.log('⚡ Running in FAST mode (Paid Tier / High Rate Limits)');
    } else {
        console.log('🐌 Running in THROTTLED mode (Free Tier / 15 RPM)');
    }

    const scholarships = db.prepare("SELECT * FROM scholarships WHERE status = 'Active'").all();
    console.log(`Found ${scholarships.length} active scholarships in the main database.`);

    const checkStmt = db.prepare("SELECT id FROM scholarship_translations WHERE scholarship_id = ? AND locale = ?");
    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO scholarship_translations (
            scholarship_id, locale, title, amount_description, benefits, selection, renewal, step_guide, faq_json, intro_seo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let translatedCount = 0;
    
    for (const s of scholarships) {
        if (limit !== null && translatedCount >= limit) {
            console.log(`🛑 Limit of ${limit} reached. Exiting script.`);
            break;
        }

        for (const loc of locales) {
            // Check if translation already exists
            const existing = checkStmt.get(s.id, loc.code);
            if (existing) {
                continue;
            }

            console.log(`✍️  Translating "${s.title}" (${s.id}) into ${loc.name} (${loc.code})...`);
            
            // Wait based on rate mode
            await delay(delayMs);

            const result = await translateText(s, loc);
            if (result) {
                try {
                    insertStmt.run(
                        s.id,
                        loc.code,
                        result.title,
                        result.amount_description,
                        result.benefits,
                        result.selection,
                        result.renewal,
                        result.step_guide,
                        JSON.stringify(result.faq_json || []),
                        result.intro_seo
                    );
                    console.log(`✅ Saved ${loc.name} translation.`);
                    translatedCount++;
                } catch (dbErr) {
                    console.error(`❌ Failed to save ${loc.name} translation to DB:`, dbErr.message);
                }
            }
        }
    }

    db.close();
    console.log(`🎉 Translation job complete! Localized ${translatedCount} items.`);
}

run();
