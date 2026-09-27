/**
 * Study Abroad tables (the /study-abroad section of the site), stored in the main database
 * next to the scholarships. Scholarships themselves are NOT duplicated here: Study Abroad pages
 * list and link to the international rows of the `scholarships` table.
 *
 *   sa_universities  one row per foreign university (article + key cost/admission fields)
 *   sa_programs      one row per university + degree + field (the comparison pages are built from these)
 *   sa_guides        articles: kind 'guide' (country guides), 'visa' (visa guides), 'loan' (loan / blocked-account comparisons)
 *   sa_facts         the money and visa numbers used across pages and calculators, each with its source
 *
 * Every money or visa number carries `official_source` + `checked_at`; rows without them are
 * flagged by check-data-formats.js. `status` is 'published' or 'draft' (drafts are not shown).
 *
 * Synced to Turso by push-to-turso.js (listed in SYNCED_TABLES).
 */
const SA_TABLES = ['sa_universities', 'sa_programs', 'sa_guides', 'sa_facts'];

const SA_DDL = [
    `CREATE TABLE IF NOT EXISTS sa_universities (
        slug TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        city TEXT,
        summary TEXT,
        seo_title TEXT,
        meta_description TEXT,
        who_for TEXT,
        tuition_per_year INTEGER,
        tuition_currency TEXT,
        living_cost_per_year INTEGER,
        living_currency TEXT,
        gre_required TEXT,
        stem_opt TEXT,
        coop_program TEXT,
        ranking TEXT,
        acceptance_rate TEXT,
        application_deadlines TEXT,
        infobox_json TEXT,
        body_md TEXT,
        faq_json TEXT,
        related_json TEXT,
        official_source TEXT,
        checked_at TEXT,
        status TEXT NOT NULL DEFAULT 'published',
        created_at TEXT,
        updated_at TEXT
    )`,
    'CREATE INDEX IF NOT EXISTS idx_sa_universities_country ON sa_universities(country, status)',
    `CREATE TABLE IF NOT EXISTS sa_programs (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL,
        university_slug TEXT NOT NULL,
        country TEXT NOT NULL,
        degree TEXT NOT NULL,
        field TEXT,
        title TEXT NOT NULL,
        tuition_per_year INTEGER,
        tuition_currency TEXT,
        living_cost_per_year INTEGER,
        living_currency TEXT,
        gpa_min TEXT,
        ielts_min REAL,
        gre TEXT,
        location TEXT,
        application_deadlines TEXT,
        official_source TEXT,
        checked_at TEXT,
        status TEXT NOT NULL DEFAULT 'published',
        created_at TEXT,
        updated_at TEXT
    )`,
    'CREATE INDEX IF NOT EXISTS idx_sa_programs_combo ON sa_programs(country, degree, field, status)',
    'CREATE INDEX IF NOT EXISTS idx_sa_programs_university ON sa_programs(university_slug)',
    `CREATE TABLE IF NOT EXISTS sa_guides (
        slug TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        country TEXT,
        title TEXT NOT NULL,
        summary TEXT,
        seo_title TEXT,
        meta_description TEXT,
        who_for TEXT,
        infobox_json TEXT,
        body_md TEXT,
        faq_json TEXT,
        related_json TEXT,
        data_json TEXT,
        official_source TEXT,
        checked_at TEXT,
        status TEXT NOT NULL DEFAULT 'published',
        created_at TEXT,
        updated_at TEXT
    )`,
    'CREATE INDEX IF NOT EXISTS idx_sa_guides_kind ON sa_guides(kind, country, status)',
    `CREATE TABLE IF NOT EXISTS sa_facts (
        key TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        country TEXT,
        value TEXT NOT NULL,
        unit TEXT,
        official_source TEXT,
        checked_at TEXT,
        recheck_after TEXT,
        notes TEXT,
        updated_at TEXT
    )`,
];

function ensureStudyAbroadTables(db) {
    for (const sql of SA_DDL) db.exec(sql);
}

module.exports = { SA_TABLES, SA_DDL, ensureStudyAbroadTables };
