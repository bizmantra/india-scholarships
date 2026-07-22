const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');
const CLAUDE_DIR = path.join(__dirname, '..', '..', 'Claude');
const REPORT_PATH = path.join(__dirname, '..', 'data', 'fix-audit-diff.csv');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

console.log('🔧 Running Database Audit Fixes & Normalizations Script...');
console.log(`- Database: ${DB_PATH}`);
console.log(`- Dry Run: ${dryRun}`);
console.log(`- Report Output: ${REPORT_PATH}\n`);

if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database file not found!');
    process.exit(1);
}

const db = new Database(DB_PATH);
const diffRecords = [];

// Helper function to record changes
function recordDiff(id, slug, title, column, oldValue, newValue) {
    if (String(oldValue) !== String(newValue)) {
        diffRecords.push({
            id: id || '',
            slug: slug || '',
            title: title || '',
            column: column || '',
            old_value: oldValue === null ? 'NULL' : String(oldValue),
            new_value: newValue === null ? 'NULL' : String(newValue)
        });
    }
}

// Simple CSV parser
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const results = [];
    
    for (let line of lines) {
        if (!line.trim()) continue;
        const row = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            if (char === ',' && !inQuotes) {
                row.push(current.trim());
                current = '';
            } else if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else {
                current += char;
            }
        }
        row.push(current.trim());
        results.push(row);
    }
    return results;
}

db.transaction(() => {
    // ==========================================
    // 1. Status Hygiene Normalization
    // ==========================================
    console.log('⚙️ Normalizing status values...');
    const statusRows = db.prepare("SELECT id, slug, title, status FROM scholarships").all();
    for (const row of statusRows) {
        let statusVal = row.status || '';
        let targetStatus = statusVal;
        
        if (statusVal.toLowerCase() === 'active') {
            targetStatus = 'Active';
        } else if (statusVal === '') {
            targetStatus = 'Active';
        }
        
        if (targetStatus !== statusVal) {
            recordDiff(row.id, row.slug, row.title, 'status', statusVal, targetStatus);
            if (!dryRun) {
                db.prepare("UPDATE scholarships SET status = ? WHERE id = ?").run(targetStatus, row.id);
            }
        }
    }

    // ==========================================
    // 2. Verified Status Normalization
    // ==========================================
    console.log('⚙️ Normalizing verified_status values...');
    const verifiedRows = db.prepare("SELECT id, slug, title, verified_status FROM scholarships").all();
    for (const row of verifiedRows) {
        let vVal = row.verified_status || '';
        let targetV = vVal;
        
        const vLower = vVal.toLowerCase();
        if (vLower === 'yes' || vLower === 'true' || vLower === 'official' || vLower === 'verified') {
            targetV = 'Verified';
        } else if (vVal && vVal !== 'Verified') {
            targetV = 'Pending Verification';
        }
        
        if (targetV !== vVal) {
            recordDiff(row.id, row.slug, row.title, 'verified_status', vVal, targetV);
            if (!dryRun) {
                db.prepare("UPDATE scholarships SET verified_status = ? WHERE id = ?").run(targetV, row.id);
            }
        }
    }

    // ==========================================
    // 3. Amount Issues Resolutions (19 Targets)
    // ==========================================
    console.log('⚙️ Resolving amount gaps for verified target list...');
    
    // Map of verified researched amounts (based on official source parameters)
    const amountMap = {
        '25': {
            amount_annual: 20000,
            amount_min: 2500,
            amount_description: "Financial assistance towards tuition fee, maintenance allowance, and special allowances for PwD/UDID card holders under SSP Karnataka. Rates vary by educational level."
        },
        '30': {
            amount_annual: 3000,
            amount_min: 1500,
            amount_description: "Day scholars receive ₹1,500 per year; Hostellers receive ₹3,000 per year."
        },
        '32': {
            amount_annual: 10000,
            amount_min: 1000,
            amount_description: "Class 1-5 receives ₹1,000 per year. Class 6-10 receives up to ₹5,000 per year for day scholars, and up to ₹10,000 per year for hostellers."
        },
        '33': {
            amount_annual: 5000,
            amount_min: 1000,
            amount_description: "Financial assistance of ₹1,000 to ₹5,000 per year for students with disabilities studying in classes 1 to 10."
        },
        'central-sector-scholarship-kerala-applicants-via-dce': {
            amount_annual: 20000,
            amount_min: 12000,
            amount_description: "₹12,000 per annum for undergraduate studies (first three years) and ₹20,000 per annum for postgraduate studies."
        },
        'pragyan-bharati-scheme': { // Genuinely a fee-waiver & textbook grant
            amount_annual: 2000,
            amount_min: 0,
            amount_description: "Textbook grant of ₹2,000 per year, hostel mess subsidy of ₹1,000 per month, and complete admission fee waiver at colleges in Assam."
        },
        'irdp-scholarship': {
            amount_annual: 1200,
            amount_min: 300,
            amount_description: "Financial assistance ranges from ₹300 to ₹1,200 per year depending on the gender and course level of the student."
        },
        'goa-dayanand-social-security-scheme-students': {
            amount_annual: 24000,
            amount_min: 24000,
            amount_description: "Monthly financial support of ₹2,000 (total ₹24,000 per annum) disbursed directly via DBT."
        },
        'meghalaya-merit-scholarship': {
            amount_annual: 3600,
            amount_min: 1200,
            amount_description: "Scholarship stipend ranges from ₹100 to ₹300 per month (total ₹1,200 to ₹3,600 per year) depending on the stage of education."
        },
        'tripura-state-merit-scholarship': {
            amount_annual: 6000,
            amount_min: 1200,
            amount_description: "Financial assistance ranges from ₹100 to ₹500 per month (total ₹1,200 to ₹6,000 per year) based on merit ranking and course stage."
        },
        'sikkim-state-merit-scholarship': {
            amount_annual: 5000,
            amount_min: 3000,
            amount_description: "Merit scholarship assistance of ₹3,000 to ₹5,000 per year for students pursuing higher education."
        },
        'arunachal-pradesh-state-merit-scholarship': {
            amount_annual: 6000,
            amount_min: 3000,
            amount_description: "Merit stipend of up to ₹6,000 per year depending on the course stream and category of study."
        },
        'ladakh-ut-merit-scholarship': {
            amount_annual: 10000,
            amount_min: 5000,
            amount_description: "Financial grant of up to ₹10,000 per year depending on course level and category."
        },
        'andaman-nicobar-administration-merit-scholarship': {
            amount_annual: 12000,
            amount_min: 5000,
            amount_description: "Merit scholarship assistance ranging from ₹5,000 to ₹12,000 per year for resident students of Andaman and Nicobar Islands."
        },
        'infosys-foundation-fellowship-select-programs': {
            amount_annual: 420000,
            amount_min: 300000,
            amount_description: "Stipend of ₹25,000 to ₹35,000 per month (total ₹3.0 Lakh to ₹4.2 Lakh per year) for selected PhD scholars and researchers."
        },
        'siemens-scholarship-program': {
            amount_annual: 120000,
            amount_min: 20000,
            amount_description: "Reimbursement of tuition fees (up to ₹1 Lakh per year) plus an additional allowance of ₹20,000 per year for books, stationery, and hostel/living expenses."
        },
        'godrej-scholarship-csr-initiatives': {
            amount_annual: 50000,
            amount_min: 10000,
            amount_description: "Financial assistance of ₹10,000 to ₹50,000 per year targeting students from underprivileged families."
        },
        'bosch-csr-scholarship': {
            amount_annual: 40000,
            amount_min: 10000,
            amount_description: "Financial aid ranging from ₹10,000 to ₹40,000 per year for ITI, diploma, and undergraduate engineering students."
        },
        'acumen-india-fellowship': { // Genuinely fully-funded (no direct cash stipend)
            amount_annual: 0,
            amount_min: 0,
            amount_description: "Fully funded fellowship covering all seminar fees, lodging, meals, and programmatic travel. No direct cash stipends are paid to fellows."
        }
    };

    for (const [key, val] of Object.entries(amountMap)) {
        const row = db.prepare("SELECT id, slug, title, amount_annual, amount_min, amount_description FROM scholarships WHERE id = ? OR slug = ?").get(key, key);
        if (row) {
            if (row.amount_annual !== val.amount_annual) {
                recordDiff(row.id, row.slug, row.title, 'amount_annual', row.amount_annual, val.amount_annual);
                if (!dryRun) {
                    db.prepare("UPDATE scholarships SET amount_annual = ? WHERE id = ?").run(val.amount_annual, row.id);
                }
            }
            if (row.amount_min !== val.amount_min) {
                recordDiff(row.id, row.slug, row.title, 'amount_min', row.amount_min, val.amount_min);
                if (!dryRun) {
                    db.prepare("UPDATE scholarships SET amount_min = ? WHERE id = ?").run(val.amount_min, row.id);
                }
            }
            if (row.amount_description !== val.amount_description) {
                recordDiff(row.id, row.slug, row.title, 'amount_description', row.amount_description, val.amount_description);
                if (!dryRun) {
                    db.prepare("UPDATE scholarships SET amount_description = ? WHERE id = ?").run(val.amount_description, row.id);
                }
            }
        }
    }

    // ==========================================
    // 4. Trust Signals Enrichment
    // ==========================================
    console.log('⚙️ Enriching official source URLs and helplines...');
    const trustCsvPath = path.join(CLAUDE_DIR, 'trust_signal_issues.csv');
    if (fs.existsSync(trustCsvPath)) {
        const rows = parseCSV(trustCsvPath);
        const headers = rows[0];
        const idIdx = headers.indexOf('id');
        const sourceIdx = headers.indexOf('official_source');
        const helplineIdx = headers.indexOf('helpline');

        for (let i = 1; i < rows.length; i++) {
            const rowData = rows[i];
            const targetId = rowData[idIdx];
            const csvSource = rowData[sourceIdx];
            const csvHelpline = rowData[helplineIdx];

            const dbRow = db.prepare("SELECT id, slug, title, official_source, helpline FROM scholarships WHERE id = ? OR slug = ?").get(targetId, targetId);
            if (dbRow) {
                // Safely update official source if blank/null
                if (csvSource && csvSource !== '' && (!dbRow.official_source || dbRow.official_source === '')) {
                    recordDiff(dbRow.id, dbRow.slug, dbRow.title, 'official_source', dbRow.official_source, csvSource);
                    if (!dryRun) {
                        db.prepare("UPDATE scholarships SET official_source = ? WHERE id = ?").run(csvSource, dbRow.id);
                    }
                }
                // Safely update helpline if blank/null
                if (csvHelpline && csvHelpline !== '' && csvHelpline !== 'Not Specified' && (!dbRow.helpline || dbRow.helpline === '' || dbRow.helpline === 'Not Specified')) {
                    recordDiff(dbRow.id, dbRow.slug, dbRow.title, 'helpline', dbRow.helpline, csvHelpline);
                    if (!dryRun) {
                        db.prepare("UPDATE scholarships SET helpline = ? WHERE id = ?").run(csvHelpline, dbRow.id);
                    }
                }
            }
        }
    }

    // ==========================================
    // 5. Deadline Issues Resolutions
    // ==========================================
    console.log('⚙️ Normalizing deadlines...');
    const deadlineCsvPath = path.join(CLAUDE_DIR, 'deadline_issues.csv');
    if (fs.existsSync(deadlineCsvPath)) {
        const rows = parseCSV(deadlineCsvPath);
        const headers = rows[0];
        const idIdx = headers.indexOf('id');
        const issueIdx = headers.indexOf('issue_type');
        const valueIdx = headers.indexOf('deadline_value');

        for (let i = 1; i < rows.length; i++) {
            const rowData = rows[i];
            const targetId = rowData[idIdx];
            const issueType = rowData[issueIdx];
            const dlVal = rowData[valueIdx];

            const dbRow = db.prepare("SELECT id, slug, title, deadline, always_open, deadline_description FROM scholarships WHERE id = ? OR slug = ?").get(targetId, targetId);
            if (dbRow) {
                if (issueType === 'VAGUE_TEXT_NOT_A_DATE' || issueType === 'MISSING_DEADLINE') {
                    // Check if it should be marked always_open (genuinely rolling)
                    const lowerVal = String(dlVal || '').toLowerCase();
                    const isRollingVal = ['always open', 'throughout the year', 'continuous', 'rolling'].some(kw => lowerVal.includes(kw)) ||
                                         (lowerVal.includes('open now') && !lowerVal.includes('deadline'));
                    
                    // Safeguard: Check if original description contains a month name, round, window, or cycle reference
                    const descText = (dbRow.deadline_description || '').toLowerCase();
                    const monthRegex = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|rounds?|windows?|cycles?|semesters?|academic\s*years?|academic\s*sessions?|academic\s*terms?|registrations?|admissions?|intakes?)\b/i;
                    const hasSeasonalWindow = monthRegex.test(descText) || monthRegex.test(lowerVal);
                    
                    const isGenuinelyRolling = isRollingVal && !hasSeasonalWindow;

                    if (isGenuinelyRolling) {
                        if (dbRow.always_open !== 1) {
                            recordDiff(dbRow.id, dbRow.slug, dbRow.title, 'always_open', dbRow.always_open, 1);
                            if (!dryRun) {
                                db.prepare("UPDATE scholarships SET always_open = 1 WHERE id = ?").run(dbRow.id);
                            }
                        }
                        const newDesc = "This is a rolling scholarship. Applications are accepted on a continuous/year-round basis.";
                        if (dbRow.deadline_description !== newDesc) {
                            recordDiff(dbRow.id, dbRow.slug, dbRow.title, 'deadline_description', dbRow.deadline_description, newDesc);
                            if (!dryRun) {
                                db.prepare("UPDATE scholarships SET deadline_description = ? WHERE id = ?").run(newDesc, dbRow.id);
                            }
                        }
                    } else {
                        // Not rolling (has a seasonal window or is just unresearched)
                        if (dbRow.always_open !== 0) {
                            recordDiff(dbRow.id, dbRow.slug, dbRow.title, 'always_open', dbRow.always_open, 0);
                            if (!dryRun) {
                                db.prepare("UPDATE scholarships SET always_open = 0 WHERE id = ?").run(dbRow.id);
                            }
                        }
                        // Do NOT overwrite deadline_description!
                    }

                    // Set deadline to canonical TBD value (empty string)
                    if (dbRow.deadline !== '') {
                        recordDiff(dbRow.id, dbRow.slug, dbRow.title, 'deadline', dbRow.deadline, '');
                        if (!dryRun) {
                            db.prepare("UPDATE scholarships SET deadline = '' WHERE id = ?").run(dbRow.id);
                        }
                    }
                } else if (issueType === 'EXPIRED_DEADLINE') {
                    // Left as-is to rely on dynamic closed/expected banner, unless high-traffic. 
                    // Verify date format compliance or clear any vague texts.
                }
            }
        }
    }
})();

// Write diff report to CSV
let csvContent = 'id,slug,title,column,old_value,new_value\n';
for (const r of diffRecords) {
    const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;
    csvContent += `${escapeCsv(r.id)},${escapeCsv(r.slug)},${escapeCsv(r.title)},${escapeCsv(r.column)},${escapeCsv(r.old_value)},${escapeCsv(r.new_value)}\n`;
}
fs.writeFileSync(REPORT_PATH, csvContent, 'utf-8');

console.log(`\n🎉 Completed. Total field changes logged: ${diffRecords.length}`);
console.log(`Saved changes diff report to: ${REPORT_PATH}`);

db.close();
