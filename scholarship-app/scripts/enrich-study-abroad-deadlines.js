const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is not defined in .env.local");
    process.exit(1);
}

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

async function callGeminiResearch(title, provider, country) {
    const prompt = `Research the official application deadlines for the 2026/2027 academic intake for the study-abroad scholarship: "${title}" (Provider: ${provider}, Destination: ${country}).
Use Google search to verify the actual dates.
Generate a structured JSON response matching the following schema exactly:
{
  "deadline": string (The primary final application deadline in YYYY-MM-DD format. Input "NA" if there is no fixed deadline, if it is open year-round, or if it is continuous enrollment. If it has passed for 2026, input the 2027 deadline date),
  "deadline_description": string (A concise 1-2 sentence summary of deadline phases, e.g. "School nomination deadline is Oct 9, 2026; student application closes Nov 6, 2026." or "Applications open Sep 1, 2026 and close Jan 15, 2027.")
}`;

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
        ],
        systemInstruction: {
            parts: [
                {
                    text: "You are an expert scholarship researcher. You MUST output ONLY a valid JSON object matching the requested schema. Do NOT wrap your output in markdown code blocks like ```json ... ```, and do NOT write any introductory or explanatory text. Your response must start with { and end with }."
                }
            ]
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No candidate returned from Gemini");
    }

    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Could not find JSON object in model response: " + text);
    }
    return JSON.parse(jsonMatch[0].trim());
}

async function startEnrichment() {
    console.log("🔍 Fetching international scholarships with missing deadlines...\n");
    
    // Select all international scholarships where deadline is missing or not set
    const scholarships = db.prepare(`
        SELECT id, title, provider, country_of_study, deadline, deadline_description 
        FROM scholarships 
        WHERE LOWER(scholarship_scope) = 'international'
          AND (deadline IS NULL OR deadline = '' OR deadline_description IS NULL OR deadline_description = '')
    `).all();

    console.log(`Found ${scholarships.length} scholarships to enrich.\n`);

    const updateStmt = db.prepare(`
        UPDATE scholarships 
        SET deadline = ?, deadline_description = ? 
        WHERE id = ?
    `);

    for (let i = 0; i < scholarships.length; i++) {
        const s = scholarships[i];
        console.log(`[${i+1}/${scholarships.length}] Researching deadlines for: ${s.title}...`);
        
        try {
            const result = await callGeminiResearch(s.title, s.provider, s.country_of_study);
            
            // Format dates
            let finalDeadline = result.deadline === 'NA' ? null : result.deadline;
            if (finalDeadline && !/^\d{4}-\d{2}-\d{2}$/.test(finalDeadline)) {
                // If not clean YYYY-MM-DD, default to null and rely on description
                finalDeadline = null;
            }

            updateStmt.run(finalDeadline, result.deadline_description, s.id);
            console.log(`  ✅ Updated: Deadline = ${finalDeadline || 'NA'}, Description = "${result.deadline_description}"`);
            
            // Pause to avoid rate limits
            await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
            console.error(`  ❌ Failed to enrich ${s.title}: ${err.message}`);
        }
    }

    console.log("\n🎉 Deadline enrichment complete!");
}

startEnrichment();
