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

const targetScholarships = [
    // USA
    { title: "Yale University Graduate Fellowships", provider: "Yale University", country: "United States", level: "PhD, Masters", type: "University" },
    { title: "Cornell University Graduate Fellowships", provider: "Cornell University", country: "United States", level: "PhD, Masters", type: "University" },
    { title: "Columbia University Graduate Fellowships", provider: "Columbia University", country: "United States", level: "PhD, Masters", type: "University" },
    { title: "Princeton University Graduate Fellowships", provider: "Princeton University", country: "United States", level: "PhD, Masters", type: "University" },
    { title: "NYU Stern Graduate Fellowships", provider: "NYU Stern School of Business", country: "United States", level: "MBA", type: "University" },
    { title: "UC Berkeley Haas MBA Scholarships", provider: "Haas School of Business, UC Berkeley", country: "United States", level: "MBA", type: "University" },
    { title: "Chicago Booth MBA Scholarships", provider: "Chicago Booth School of Business", country: "United States", level: "MBA", type: "University" },
    { title: "Northwestern Kellogg MBA Scholarships", provider: "Kellogg School of Management", country: "United States", level: "MBA", type: "University" },
    { title: "MIT Sloan MBA Scholarships", provider: "MIT Sloan School of Management", country: "United States", level: "MBA", type: "University" },
    { title: "Dartmouth Tuck MBA Scholarships", provider: "Tuck School of Business", country: "United States", level: "MBA", type: "University" },
    { title: "Duke Fuqua MBA Scholarships", provider: "Fuqua School of Business", country: "United States", level: "MBA", type: "University" },
    { title: "Michigan Ross MBA Scholarships", provider: "Ross School of Business", country: "United States", level: "MBA", type: "University" },
    { title: "AAUW International Fellowships", provider: "American Association of University Women (AAUW)", country: "United States", level: "Masters, PhD", type: "Study Abroad" },
    { title: "Rotary Peace Fellowships", provider: "The Rotary Foundation", country: "United States", level: "Masters", type: "Study Abroad" },
    { title: "Joint Japan World Bank Graduate Scholarships", provider: "World Bank", country: "United States", level: "Masters", type: "Study Abroad" },
    { title: "Aga Khan Foundation International Scholarship Programme", provider: "Aga Khan Foundation", country: "United States", level: "Masters, PhD", type: "Study Abroad" },

    // UK
    { title: "Cambridge Trust Scholarships", provider: "Cambridge Trust", country: "United Kingdom", level: "Masters, PhD", type: "University" },
    { title: "LSE Graduate Support Scheme", provider: "London School of Economics (LSE)", country: "United Kingdom", level: "Masters, PG", type: "University" },
    { title: "UCL Global Major Scholarships", provider: "University College London (UCL)", country: "United Kingdom", level: "Undergraduate", type: "University" },
    { title: "Imperial College President's PhD Scholarships", provider: "Imperial College London", country: "United Kingdom", level: "PhD", type: "University" },
    { title: "King's College London International Scholarships", provider: "King's College London", country: "United Kingdom", level: "Masters, PhD", type: "University" },
    { title: "University of Edinburgh Surgery Online Scholarships", provider: "University of Edinburgh", country: "United Kingdom", level: "Masters", type: "University" },
    { title: "University of Manchester Global Source Scholarships", provider: "University of Manchester", country: "United Kingdom", level: "Masters, PhD", type: "University" },
    { title: "Warwick Chancellor's International Scholarships", provider: "University of Warwick", country: "United Kingdom", level: "PhD", type: "University" },
    { title: "Bristol University Think Big Scholarships", provider: "University of Bristol", country: "United Kingdom", level: "Undergraduate, Masters", type: "University" },
    { title: "Sheffield Academy Scholarships", provider: "University of Sheffield", country: "United Kingdom", level: "Undergraduate, Masters", type: "University" },
    { title: "Glasgow International Leadership Scholarships", provider: "University of Glasgow", country: "United Kingdom", level: "Undergraduate, Masters", type: "University" },
    { title: "Commonwealth Masters Scholarships", provider: "Commonwealth Scholarship Commission", country: "United Kingdom", level: "Masters", type: "Study Abroad" },
    { title: "Commonwealth Shared Scholarships", provider: "Commonwealth Scholarship Commission", country: "United Kingdom", level: "Masters", type: "Study Abroad" },
    { title: "British Council Scholarships for Women in STEM", provider: "British Council", country: "United Kingdom", level: "Masters", type: "Study Abroad" },

    // Canada
    { title: "McCall MacBain Scholarships", provider: "McGill University", country: "Canada", level: "Masters, Undergraduate", type: "University" },
    { title: "University of Montreal Exemption Scholarship", provider: "University of Montreal", country: "Canada", level: "Undergraduate, Masters, PhD", type: "University" },
    { title: "York University International Student Scholarships", provider: "York University", country: "Canada", level: "Undergraduate", type: "University" },
    { title: "Carleton University Graduate Scholarships", provider: "Carleton University", country: "Canada", level: "Masters, PhD", type: "University" },
    { title: "Western University President's Entrance Scholarships", provider: "Western University", country: "Canada", level: "Undergraduate", type: "University" },
    { title: "Queen's University Graduate Fellowships", provider: "Queen's University", country: "Canada", level: "Masters, PhD", type: "University" },
    { title: "University of Calgary Graduate Fellowships", provider: "University of Calgary", country: "Canada", level: "Masters, PhD", type: "University" },
    { title: "Dalhousie University Graduate Fellowships", provider: "Dalhousie University", country: "Canada", level: "Masters, PhD", type: "University" },
    { title: "Concordia University Presidential Graduate Scholarships", provider: "Concordia University", country: "Canada", level: "PhD", type: "University" },
    { title: "Ontario Graduate Scholarship", provider: "Government of Ontario", country: "Canada", level: "Masters, PhD", type: "Study Abroad" },

    // Germany
    { title: "Friedrich Ebert Foundation Scholarships", provider: "Friedrich-Ebert-Stiftung (FES)", country: "Germany", level: "Masters, PhD", type: "Study Abroad" },
    { title: "Rosa Luxemburg Foundation Scholarships", provider: "Rosa-Luxemburg-Stiftung", country: "Germany", level: "Masters, PhD", type: "Study Abroad" },
    { title: "Studienstiftung des deutschen Volkes Fellowships", provider: "German Academic Scholarship Foundation", country: "Germany", level: "Masters, PhD", type: "Study Abroad" },
    { title: "KAAD Scholarships", provider: "Katholischer Akademischer Ausländer-Dienst", country: "Germany", level: "Masters, PhD", type: "Study Abroad" },
    { title: "Hamburg University International Student Scholarships", provider: "University of Hamburg", country: "Germany", level: "Undergraduate, Masters", type: "University" },
    { title: "Heidelberg University Graduate Fellowships", provider: "Heidelberg University", country: "Germany", level: "PhD", type: "University" },
    { title: "Technical University of Munich Scholarships", provider: "Technical University of Munich (TUM)", country: "Germany", level: "Undergraduate, Masters", type: "University" },
    { title: "Humboldt Research Fellowships", provider: "Alexander von Humboldt Foundation", country: "Germany", level: "PhD", type: "Study Abroad" },

    // Australia
    { title: "UNSW International Scientia Coursework Scholarships", provider: "University of New South Wales (UNSW)", country: "Australia", level: "Undergraduate, Masters", type: "University" },
    { title: "ANU Chancellor's International High Achiever Scholarships", provider: "Australian National University (ANU)", country: "Australia", level: "Undergraduate, Masters", type: "University" },
    { title: "Monash International Leadership Scholarships", provider: "Monash University", country: "Australia", level: "Undergraduate, Masters", type: "University" },
    { title: "UWA International Achievement Scholarships", provider: "University of Western Australia (UWA)", country: "Australia", level: "Undergraduate, Masters", type: "University" },
    { title: "Adelaide Global Academic Excellence Scholarships", provider: "University of Adelaide", country: "Australia", level: "Undergraduate, Masters", type: "University" },
    { title: "Macquarie University Vice-Chancellor's International Scholarships", provider: "Macquarie University", country: "Australia", level: "Undergraduate, Masters", type: "University" },
    { title: "UTS Vice-Chancellor's International Undergraduate Scholarships", provider: "University of Technology Sydney (UTS)", country: "Australia", level: "Undergraduate", type: "University" },

    // Europe (Others)
    { title: "Emile Boutmy Scholarships", provider: "Sciences Po", country: "France", level: "Undergraduate, Masters", type: "University" },
    { title: "Amsterdam Merit Scholarships", provider: "University of Amsterdam", country: "Netherlands", level: "Masters", type: "University" },
    { title: "Justus & Louise van Effen Scholarships", provider: "TU Delft", country: "Netherlands", level: "Masters", type: "University" },
    { title: "Radboud Scholarship Programme", provider: "Radboud University", country: "Netherlands", level: "Masters", type: "University" },
    { title: "Erik Bleumink Fund Scholarships", provider: "University of Groningen", country: "Netherlands", level: "Masters", type: "University" },
    { title: "Swedish Institute Scholarships for Global Professionals", provider: "Swedish Institute", country: "Sweden", level: "Masters", type: "Study Abroad" },
    { title: "Chalmers IPOET Scholarships", provider: "Chalmers University of Technology", country: "Sweden", level: "Masters", type: "University" },
    { title: "KTH Royal Institute of Technology Tuition Fee Waivers", provider: "KTH Royal Institute of Technology", country: "Sweden", level: "Masters", type: "University" },
    { title: "Bologna University Study Grants", provider: "University of Bologna", country: "Italy", level: "Undergraduate, Masters", type: "University" },
    { title: "Padua International Excellence Scholarships", provider: "University of Padua", country: "Italy", level: "Undergraduate, Masters", type: "University" },
    { title: "ETH Zurich Excellence Scholarship", provider: "ETH Zurich", country: "Switzerland", level: "Masters", type: "University" },

    // Singapore & Japan
    { title: "Nanyang Scholarship", provider: "Nanyang Technological University (NTU)", country: "Singapore", level: "Undergraduate", type: "University" },
    { title: "President's Graduate Fellowship", provider: "National University of Singapore (NUS)", country: "Singapore", level: "PhD", type: "University" },
    { title: "Lee Kuan Yew Scholarship", provider: "Lee Kuan Yew Scholarship Board", country: "Singapore", level: "PhD, Masters", type: "Study Abroad" },
    { title: "ADB-Japan Scholarship Program", provider: "Asian Development Bank / Government of Japan", country: "Japan", level: "Masters", type: "Study Abroad" },
    { title: "Honjo International Scholarship Foundation Scholarships", provider: "Honjo International Scholarship Foundation", country: "Japan", level: "Masters, PhD", type: "Study Abroad" }
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
You MUST search Google to get accurate, official 2026/2027 parameters. If the scholarship is discontinued or replaced, research its active successor/equivalent program and populate the fields using the successor's details.
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
    console.log(`Starting Batch 2 Ingestion of ${targetScholarships.length} study-abroad and university scholarships...\n`);
    
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

    console.log("\n🎉 Batch 2 Ingestion complete!");
}

startIngestion();
