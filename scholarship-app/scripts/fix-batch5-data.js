const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

const batch5Slugs = [
    'sbi-platinum-jubilee-asha-scholarship',
    'faea-scholarship-for-undergraduate-studies',
    'narotam-sekhsaria-postgraduate-scholarship',
    'glow-and-lovely-careers-scholarship-for-women',
    'tata-trusts-medical-and-healthcare-scholarship'
];

// 1. Fix FAQ JSON for all Batch 5
const faqData = {
    'sbi-platinum-jubilee-asha-scholarship': [
        { q: "Who can apply?", a: "Students in Class 6 to 12 with 75% marks and <₹3L income." },
        { q: "What is the amount?", a: "₹15,000 for one year." },
        { q: "Is it for all states?", a: "Yes, All India." }
    ],
    'faea-scholarship-for-undergraduate-studies': [
        { q: "Who is eligible?", a: "Class 12 pass students from BPL/SC/ST categories." },
        { q: "Which courses are covered?", a: "Any undergraduate course in Arts/Commerce/Science/Medical/Engineering." },
        { q: "Does it cover full fees?", a: "Yes, it covers tuition, hostel, and allowance." }
    ],
    'narotam-sekhsaria-postgraduate-scholarship': [
        { q: "Is this a loan or grant?", a: "Interest-free loan scholarship." },
        { q: "Which streams are covered?", a: "Engineering, Medicine, Life Sciences, Social Sciences, Architecture." },
        { q: "Is there an interview?", a: "Yes, shortlisted candidates must attend a final interview." }
    ],
    'glow-and-lovely-careers-scholarship-for-women': [
        { q: "Is it only for women?", a: "Yes, exclusively for women aged 15-30." },
        { q: "What is the income limit?", a: "Family income must be less than ₹6 Lakh per year." },
        { q: "Can I apply for PG?", a: "Yes, UG and PG courses are both covered." }
    ],
    'tata-trusts-medical-and-healthcare-scholarship': [
        { q: "Which medical courses?", a: "MBBS, BDS, Nursing, Pharmacy, and other health degrees." },
        { q: "Is there a merit criteria?", a: "Yes, minimum 60% in previous qualifying exam." },
        { q: "Can I apply if I am in first year?", a: "Yes, students in any year can apply." }
    ]
};

const updateFaq = db.prepare('UPDATE scholarships SET faq_json = ? WHERE slug = ?');
const updateTypeTags = db.prepare("UPDATE scholarships SET scholarship_type = ?, tags = ? WHERE slug = ?");

db.transaction(() => {
    for (const slug of batch5Slugs) {
        // Update FAQs
        if (faqData[slug]) {
            updateFaq.run(JSON.stringify(faqData[slug]), slug);
        }

        // Re-classify Type & Tags
        let type = 'Private';
        if (slug.includes('sbi') || slug.includes('glow')) {
            type = 'Corporate';
        }

        const tags = JSON.stringify(['Foundation', 'Direct Portal', 'Verified']);
        updateTypeTags.run(type, tags, slug);
    }
})();

console.log("Batch 5 Data Reparation Complete.");
console.log("- FAQs converted to JSON arrays.");
console.log("- Re-classified 'Foundation' as Corporate/Private.");
console.log("- Added 'Foundation' tag for tracking.");

db.close();
