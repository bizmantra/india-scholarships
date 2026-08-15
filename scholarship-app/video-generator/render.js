const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Help screen
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Scholarship Video Generator Render CLI
Usage:
  node render.js [options]

Options:
  --slug <slug>      Slug of the scholarship to render (default: टाटा कैपिटल पंख / LIC)
  --out <path>       Output path for the rendered MP4 file (default: out/<slug>.mp4)
  --help, -h         Show this help message
`);
  process.exit(0);
}

// Locate DB
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
if (!fs.existsSync(dbPath)) {
  console.error(`Error: Database not found at ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath);

// Parse arguments
let slug = '';
const slugIdx = process.argv.indexOf('--slug');
if (slugIdx !== -1 && process.argv[slugIdx + 1]) {
  slug = process.argv[slugIdx + 1];
}

let lang = 'en';
const langIdx = process.argv.indexOf('--lang');
if (langIdx !== -1 && process.argv[langIdx + 1]) {
  lang = process.argv[langIdx + 1];
}

// Get scholarship details
let row;
if (slug) {
  row = db.prepare('SELECT * FROM scholarships WHERE slug = ?').get(slug);
  if (!row) {
    console.error(`Error: Scholarship with slug "${slug}" not found in database.`);
    process.exit(1);
  }
} else {
  // Get a default high-value scholarship (e.g., Tata Capital Pankh or LIC)
  row = db.prepare('SELECT * FROM scholarships WHERE slug LIKE ? OR is_popular = 1 LIMIT 1').get('%pankh%') || 
        db.prepare('SELECT * FROM scholarships LIMIT 1').get();
  if (!row) {
    console.error('Error: No scholarships found in database.');
    process.exit(1);
  }
  slug = row.slug;
}

console.log(`Selected Scholarship: "${row.title}" (slug: ${row.slug}) [Lang: ${lang}]`);

// Format income limit
let formattedIncome = 'No Limit';
if (row.income_limit) {
  const limit = Number(row.income_limit);
  if (limit >= 100000) {
    formattedIncome = `${(limit / 100000).toFixed(1).replace('.0', '')} Lakhs`;
  } else {
    formattedIncome = limit.toLocaleString('en-IN');
  }
}

// Format marks
const formattedMarks = row.min_marks && row.min_marks > 0 ? `${row.min_marks}%` : 'Passing Marks';

// Format deadline
let formattedDeadline = 'Check Portal';
if (row.deadline) {
  // If format is YYYY-MM-DD, convert to readable format
  const dateParts = row.deadline.split('-');
  if (dateParts.length === 3) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = dateParts[0];
    const month = months[parseInt(dateParts[1], 10) - 1];
    const day = parseInt(dateParts[2], 10);
    formattedDeadline = `${day} ${month} ${year}`;
  } else {
    formattedDeadline = row.deadline;
  }
}

// Format documents
let docs = [];
if (row.docs_needed) {
  docs = row.docs_needed
    .split(/[\n,;]|\*/)
    .map(s => s.replace(/^\*|\*$/g, '').trim())
    .filter(Boolean);
}
if (docs.length === 0) {
  docs = ['Aadhaar Card', 'Previous Marksheet', 'Income Certificate', 'Bank Passbook'];
}

// Clean Apply URL domain to show on screen
let applyUrlClean = 'Official Portal';
if (row.apply_url) {
  try {
    const urlObj = new URL(row.apply_url);
    applyUrlClean = urlObj.hostname.replace('www.', '');
  } catch (e) {
    applyUrlClean = row.apply_url.replace('https://', '').replace('http://', '').split('/')[0];
  }
}

// Setup Output and Public Directories
const outDir = path.join(__dirname, 'out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Helper to preprocess text for better pronunciation (especially spelling out acronyms)
function preprocessTextForTTS(text) {
  if (!text) return '';
  // Spell out uppercase acronyms (e.g. LIC -> L I C, NSP -> N S P)
  let processed = text.replace(/\b[A-Z]{2,}\b/g, (match) => {
    return match.split('').join(' ');
  });

  // Override specific words for macOS local speech engine Rishi/Lekha
  processed = processed.replace(/\bBTech\b/gi, 'B Tech');
  processed = processed.replace(/\bB\.Tech\b/gi, 'B Tech');
  processed = processed.replace(/\bMTech\b/gi, 'M Tech');
  processed = processed.replace(/\bM\.Tech\b/gi, 'M Tech');
  processed = processed.replace(/\bMBBS\b/gi, 'M B B S');
  processed = processed.replace(/\bITI\b/gi, 'I T I');
  processed = processed.replace(/\bBSc\b/gi, 'B S C');
  processed = processed.replace(/\bMSc\b/gi, 'M S C');
  processed = processed.replace(/\bBCom\b/gi, 'B Com');
  processed = processed.replace(/\bMCom\b/gi, 'M Com');
  processed = processed.replace(/\bAadhaar\b/gi, 'Adhar');
  processed = processed.replace(/\bIndia Scholarships\b/gi, 'India Scholarships');
  
  return processed;
}

// Helper to summarize benefits description for display on video cards (keeps it under 2 lines)
function cleanDescriptionForVideo(text) {
  if (!text) return '';
  
  // Trim payment channels and NEFT/DBT bank transfer boilerplate
  let cleaned = text.split(/funds are transferred|directly to bank|neft|dbt/i)[0].trim();
  
  // Intelligently handle long BITSAT / LIC multi-course tables
  if (cleaned.toLowerCase().includes('varies by course')) {
    return "Varies by course: Medical ₹40,000/yr, Engineering ₹30,000/yr, Graduation/Diploma ₹20,000/yr.";
  }
  
  // Split by first period to extract the primary reward summary sentence
  const sentenceEnd = cleaned.indexOf('.');
  if (sentenceEnd !== -1) {
    cleaned = cleaned.substring(0, sentenceEnd).trim();
  }
  
  // Hard cap to fit visually on card
  if (cleaned.length > 120) {
    cleaned = cleaned.substring(0, 117) + '...';
  }
  
  return cleaned + (cleaned.endsWith('.') ? '' : '.');
}

// Generate Voiceover Script
let speechText = '';
let voice = 'Rishi';

if (lang === 'hi') {
  voice = 'Lekha';
  const trans = db.prepare('SELECT * FROM scholarship_translations WHERE scholarship_id = ? AND locale = "hi"').get(row.id);
  const titleHi = trans ? trans.title : row.title;
  const amountHi = row.amount_annual ? `₹${row.amount_annual.toLocaleString('en-IN')}` : 'सहायता राशि';
  const incomeHi = row.income_limit ? `₹${formattedIncome}` : 'कोई सीमा नहीं';
  
  speechText = `नया स्कॉलरशिप अलर्ट। ${titleHi} के तहत आपको मिलेंगे ${amountHi} सालाना। पात्रता के लिए, आपकी पारिवारिक आय ${incomeHi} से कम और पिछली परीक्षा में कम से कम ${formattedMarks} होने चाहिए। जरूरी दस्तावेज जैसे ${docs.slice(0, 3).join(', ')} तैयार रखें। आवेदन करने की अंतिम तिथि ${formattedDeadline} है। डायरेक्ट ऑफिशियल लिंक और पूरी जानकारी के लिए अभी इंडिया स्कॉलरशिप्स डॉट इन पर जाएं।`;
} else {
  voice = 'Rishi';
  const amountEn = row.amount_annual ? `₹${row.amount_annual.toLocaleString('en-IN')}` : 'financial aid';
  speechText = `New scholarship alert. You can get up to ${amountEn} per year with the ${row.title} by ${row.provider || 'the sponsor'}. To qualify, your family income must be under ${formattedIncome} and you need at least ${formattedMarks} marks. Keep your required documents ready, including ${docs.slice(0, 3).join(', and ')}. Apply online via India Scholarships dot in before the deadline of ${formattedDeadline}. We provide direct official links and complete step by step guidance.`;
}

// Apply preprocessing for better TTS pronunciation
const processedSpeechText = preprocessTextForTTS(speechText);

console.log(`\nGenerated Voiceover Text (${voice}):\n"${speechText}"\n`);
console.log(`Processed for TTS Pronunciation:\n"${processedSpeechText}"\n`);

const scriptPath = path.join(publicDir, 'voiceover.txt');
const audioPath = path.join(publicDir, 'voiceover.m4a');

fs.writeFileSync(scriptPath, processedSpeechText, 'utf8');

// Generate voiceover using macOS 'say' command
console.log(`Generating TTS audio voiceover using macOS '${voice}' voice...`);
try {
  execSync(`say -v ${voice} -f "${scriptPath}" -o "${audioPath}"`);
  console.log(`🎉 Voiceover successfully generated: ${audioPath}\n`);
} catch (err) {
  console.error(`⚠️ Voiceover generation failed: ${err.message}`);
  console.log('Proceeding to render video without updating voiceover...\n');
}

// Build composition props
const formattedRenewal = cleanDescriptionForVideo(row.renewal || 'Satisfactory academic performance is required.');

// Safely parse demographic fields
let formattedCaste = 'All Categories';
if (row.caste) {
  try {
    const parsed = JSON.parse(row.caste);
    formattedCaste = Array.isArray(parsed) ? parsed.join(', ') : parsed;
  } catch (e) {
    formattedCaste = row.caste;
  }
}

let formattedCourse = 'All Courses';
if (row.course_stream) {
  try {
    const parsed = JSON.parse(row.course_stream);
    formattedCourse = Array.isArray(parsed) ? parsed.join(', ') : parsed;
  } catch (e) {
    formattedCourse = row.course_stream;
  }
}
if (formattedCourse.length > 65) {
  formattedCourse = formattedCourse.substring(0, 62) + '...';
}

const props = {
  title: row.title,
  provider: row.provider || 'Govt of India / Corporate Sponsor',
  amount_annual: row.amount_annual || 'Variable',
  amount_description: cleanDescriptionForVideo(row.amount_description || row.benefits || 'Financial assistance for studies.'),
  income_limit: formattedIncome,
  min_marks: formattedMarks,
  deadline: formattedDeadline,
  docs_needed: docs.slice(0, 4), // Top 4 docs
  apply_url: applyUrlClean,
  caste: formattedCaste,
  gender: row.gender || 'All Genders',
  course_stream: formattedCourse,
  renewal: formattedRenewal
};

// Determine output path
let outPath = '';
const outIdx = process.argv.indexOf('--out');
if (outIdx !== -1 && process.argv[outIdx + 1]) {
  outPath = process.argv[outIdx + 1];
} else {
  outPath = path.join(outDir, `${slug}.mp4`);
}

console.log(`Props to render:\n`, JSON.stringify(props, null, 2));

// Save props to temp JSON file to prevent command line quoting escape issues
const propsPath = path.join(publicDir, 'props.json');
fs.writeFileSync(propsPath, JSON.stringify(props, null, 2), 'utf8');

// Run Remotion CLI command
const entryPoint = path.join(__dirname, 'src', 'index.ts');
const cmd = `npx remotion render "${entryPoint}" ScholarshipShort "${outPath}" --props="${propsPath}"`;

console.log(`Executing Remotion Render Command:\n${cmd}\n`);

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log(`\n🎉 Success! Video successfully rendered to: ${outPath}`);
} catch (error) {
  console.error('\n❌ Rendering failed. Make sure FFmpeg is installed and Remotion dependencies are resolved.');
  process.exit(1);
}
