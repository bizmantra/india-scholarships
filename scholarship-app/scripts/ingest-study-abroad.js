const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is not defined in .env.local");
    process.exit(1);
}

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

// Target list of high-value study-abroad/university scholarships
const targetScholarships = [
    // Canada
    { title: "Vanier Canada Graduate Scholarships", provider: "Government of Canada", country: "Canada", level: "PhD", type: "Study Abroad" },
    { title: "Canada Graduate Scholarships – Master’s Program", provider: "Government of Canada", country: "Canada", level: "Masters", type: "Study Abroad" },
    { title: "Lester B. Pearson International Scholarship Program", provider: "University of Toronto", country: "Canada", level: "Undergraduate", type: "University" },
    { title: "UBC International Major Entrance Scholarship", provider: "University of British Columbia", country: "Canada", level: "Undergraduate", type: "University" },
    { title: "Pierre Elliott Trudeau Foundation Doctoral Scholarship", provider: "Pierre Elliott Trudeau Foundation", country: "Canada", level: "PhD", type: "Study Abroad" },
    
    // Germany
    { title: "DAAD Research Grants for Doctoral Candidates", provider: "German Academic Exchange Service (DAAD)", country: "Germany", level: "PhD", type: "Study Abroad" },
    { title: "International Max Planck Research School (IMPRS) PhD Fellowship", provider: "Max Planck Society", country: "Germany", level: "PhD", type: "Study Abroad" },
    { title: "Heinrich Böll Foundation Scholarships", provider: "Heinrich Böll Foundation", country: "Germany", level: "Masters, PhD", type: "Study Abroad" },
    { title: "Konrad-Adenauer-Stiftung Scholarships", provider: "Konrad-Adenauer-Stiftung", country: "Germany", level: "Masters, PhD", type: "Study Abroad" },
    { title: "ESMT Berlin MBA Scholarships", provider: "ESMT Berlin", country: "Germany", level: "MBA", type: "University" },

    // UK
    { title: "Chevening Scholarships", provider: "Foreign, Commonwealth & Development Office (FCDO)", country: "United Kingdom", level: "Masters, MBA", type: "Study Abroad" },
    { title: "Commonwealth PhD Scholarships", provider: "Commonwealth Scholarship Commission", country: "United Kingdom", level: "PhD", type: "Study Abroad" },
    { title: "Gates Cambridge Scholarship", provider: "Bill & Melinda Gates Foundation", country: "United Kingdom", level: "Masters, PhD", type: "Study Abroad" },
    { title: "Clarendon Fund Scholarships", provider: "University of Oxford", country: "United Kingdom", level: "Masters, PhD", type: "University" },
    { title: "Rhodes Scholarship", provider: "Rhodes Trust", country: "United Kingdom", level: "Masters, PhD", type: "Study Abroad" },
    { title: "Oxford Pershing Square Graduate Scholarships", provider: "Saïd Business School, University of Oxford", country: "United Kingdom", level: "MBA, Masters", type: "University" },
    { title: "London Business School MBA Scholarships", provider: "London Business School", country: "United Kingdom", level: "MBA", type: "University" },

    // USA
    { title: "Fulbright-Nehru Doctoral Research Fellowships", provider: "United States-India Educational Foundation (USIEF)", country: "United States", level: "PhD", type: "Study Abroad" },
    { title: "Fulbright-Nehru Master's Fellowships", provider: "United States-India Educational Foundation (USIEF)", country: "United States", level: "Masters, MBA", type: "Study Abroad" },
    { title: "Knight-Hennessy Scholars Program", provider: "Stanford University", country: "United States", level: "Masters, PhD, MBA", type: "University" },
    { title: "Harvard Business School Need-Based Fellowships", provider: "Harvard Business School", country: "United States", level: "MBA", type: "University" },
    { title: "Wharton MBA Fellowships", provider: "Wharton School of the University of Pennsylvania", country: "United States", level: "MBA", type: "University" },
    { title: "Stanford GSB Need-Based Fellowships", provider: "Stanford Graduate School of Business", country: "United States", level: "MBA", type: "University" },
    { title: "Hubert H. Humphrey Fellowship Program", provider: "US Department of State", country: "United States", level: "Postgraduate", type: "Study Abroad" },

    // Europe
    { title: "Erasmus Mundus Joint Masters Scholarships", provider: "European Union", country: "European Union (Multiple Countries)", level: "Masters", type: "Study Abroad" },
    { title: "Marie Skłodowska-Curie Actions (MSCA) Doctoral Networks", provider: "European Commission", country: "European Union (Multiple Countries)", level: "PhD", type: "Study Abroad" },
    { title: "Eiffel Excellence Scholarship Program", provider: "French Ministry for Europe and Foreign Affairs", country: "France", level: "Masters, PhD", type: "Study Abroad" },
    { title: "Holland Scholarship", provider: "Dutch Ministry of Education, Culture and Science", country: "Netherlands", level: "Undergraduate, Masters", type: "Study Abroad" },

    // Australia
    { title: "Australian Government Research Training Program (RTP) Scholarships", provider: "Australian Government", country: "Australia", level: "Masters, PhD", type: "Study Abroad" },
    { title: "Australia Awards Scholarships", provider: "Australian Government", country: "Australia", level: "Masters, MBA", type: "Study Abroad" },
    { title: "Destination Australia Scholarship", provider: "Australian Government", country: "Australia", level: "Undergraduate, Masters, PhD", type: "Study Abroad" },
    { title: "University of Melbourne Graduate Research Scholarship", provider: "University of Melbourne", country: "Australia", level: "Masters, PhD", type: "University" },
    { title: "University of Sydney International Research Scholarship", provider: "University of Sydney", country: "Australia", level: "Masters, PhD", type: "University" },

    // Japan & Singapore
    { title: "MEXT (Monbukagakusho) Scholarship for Research Students", provider: "Ministry of Education, Culture, Sports, Science and Technology (MEXT)", country: "Japan", level: "Masters, PhD", type: "Study Abroad" },
    { title: "Singapore International Graduate Award (SINGA)", provider: "A*STAR (Agency for Science, Technology and Research)", country: "Singapore", level: "PhD", type: "Study Abroad" }
];

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function callGeminiResearch(item) {
    const prompt = `Research the official details for the study-abroad scholarship: "${item.title}" provided by ${item.provider} for study in ${item.country}.
You MUST search Google to get accurate, official 2026/2027 parameters. If the scholarship is discontinued or replaced, research its active successor/equivalent program (e.g. CGRS D for Vanier) and populate the fields using the successor's details.
Generate a structured JSON response matching the following schema exactly. Provide only raw JSON:
{
  "amount_annual_inr": integer (Approximate annual amount in INR. Convert foreign currency if needed. E.g. $50,000 USD is ~4,000,000 INR. If fully funded/varies, input estimated value or tuition + living cost value),
  "amount_min_inr": integer (Min annual amount in INR. 0 if same),
  "amount_description": string (Description of coverage - tuition fee waivers, monthly stipend, travel allowance, health insurance, etc. Quote actual currency and conversion),
  "min_marks": integer (Minimum percentage marks or equivalent GPA target if specified, e.g. 75. 0 if none/unknown),
  "eligibility_markdown": string (Clear eligibility criteria in Markdown list format: age limit, nationality, target degree levels, work experience if any),
  "selection": string (Clear description of selection process - merit, interview, research proposal quality, etc),
  "renewal": string (Conditions for renewal in subsequent years, e.g. academic progress),
  "docs_needed_json": array of strings (List of exact documents needed like transcripts, LORs, SOP, research proposal, English proficiency cert),
  "apply_url": string (Official direct link to application portal),
  "official_source": string (Official informational homepage link),
  "step_guide": string (Markdown list/numbered guide on how to register, submit documents, and apply online),
  "faq_json": array of objects [ {"question": string, "answer": string} ] (Exactly 3-4 structured FAQ questions resolving student/parent worries about this program)
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
    
    // Extract JSON block from response text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Could not find JSON object in model response: " + text);
    }
    return JSON.parse(jsonMatch[0].trim());
}

async function startIngestion() {
    console.log(`Starting ingestion of ${targetScholarships.length} study-abroad and university scholarships...\n`);
    
    const checkStmt = db.prepare('SELECT id FROM scholarships WHERE slug = ?');
    
    const insertStmt = db.prepare(`
        INSERT INTO scholarships (
            id, title, slug, provider, provider_type, state, level, caste, gender, course_stream,
            amount_annual, amount_min, amount_description, benefits, min_marks, docs_needed,
            apply_url, official_source, step_guide, selection, renewal, helpline, faq_json,
            verified_status, last_verified, scholarship_type, status, verification_year,
            show_on_homepage, is_featured, is_popular, priority_score, country_of_study, 
            scholarship_scope, always_open, intro_seo, created_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?
        )
    `);

    for (let i = 0; i < targetScholarships.length; i++) {
        const item = targetScholarships[i];
        const slug = slugify(item.title);
        
        // Skip if already in DB
        const existing = checkStmt.get(slug);
        if (existing) {
            console.log(`[${i+1}/${targetScholarships.length}] Skipping existing: ${item.title}`);
            continue;
        }

        console.log(`[${i+1}/${targetScholarships.length}] Researching and Ingesting: ${item.title}...`);
        
        try {
            const research = await callGeminiResearch(item);
            
            const uuid = crypto.randomUUID();
            const now = new Date().toISOString();
            
            // Format course streams list
            const courseStreams = JSON.stringify([item.level]);
            const docsNeeded = JSON.stringify(research.docs_needed_json);
            const faqs = JSON.stringify(research.faq_json);

            insertStmt.run(
                uuid,
                item.title,
                slug,
                item.provider,
                item.type, // provider_type
                "All India", // state
                item.level,
                JSON.stringify(["General", "OBC", "SC", "ST"]), // caste
                "All", // gender
                courseStreams,
                research.amount_annual_inr,
                research.amount_min_inr,
                research.amount_description,
                research.eligibility_markdown, // benefits / eligibility requirements
                research.min_marks,
                docsNeeded,
                research.apply_url,
                research.official_source,
                research.step_guide,
                research.selection,
                research.renewal,
                "Check portal for email/phone support", // helpline
                faqs,
                "Verified", // verified_status
                now.split('T')[0], // last_verified
                "Study Abroad", // scholarship_type
                "active", // status
                2026, // verification_year
                0, // show_on_homepage
                1, // is_featured
                1, // is_popular
                90, // priority_score
                item.country, // country_of_study
                "International", // scholarship_scope
                0, // always_open
                `Comprehensive guide for ${item.title}. Get eligibility details, stipend amounts, and registration instructions here.`, // intro_seo
                now // created_at
            );

            console.log(`✅ Successfully added: ${item.title}`);
            
            // Wait 1 second to avoid rate limits
            await new Promise(r => setTimeout(r, 1000));

        } catch (err) {
            console.error(`❌ Failed to ingest ${item.title}: ${err.message}`);
        }
    }

    console.log("\n🎉 Ingestion complete!");
}

startIngestion();
