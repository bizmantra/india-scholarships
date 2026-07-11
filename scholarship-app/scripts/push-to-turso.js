const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
    console.error("❌ TURSO_DATABASE_URL or TURSO_AUTH_TOKEN not found in .env.local");
    process.exit(1);
}

const LOCAL_DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');
const localDb = new Database(LOCAL_DB_PATH);

const turso = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
});

async function run() {
    console.log("🏁 Starting migration from local SQLite to Turso...");
    
    try {
        // --- 1. Drop existing tables on Turso ---
        console.log("🗑️  Dropping old tables on Turso...");
        await turso.execute("DROP TABLE IF EXISTS scholarship_translations;");
        await turso.execute("DROP TABLE IF EXISTS scholarship_changelog;");
        await turso.execute("DROP TABLE IF EXISTS sqlite_sequence;");
        await turso.execute("DROP TABLE IF EXISTS scholarships;");

        // --- 2. Recreate schemas on Turso ---
        console.log("🏗️  Creating tables and indexes on Turso...");
        
        await turso.execute(`
            CREATE TABLE scholarships (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                provider TEXT,
                provider_type TEXT,
                state TEXT,
                level TEXT,
                caste TEXT,
                gender TEXT,
                course_stream TEXT,
                app_type TEXT,
                amount_annual INTEGER,
                amount_min INTEGER,
                amount_description TEXT,
                benefits TEXT,
                income_limit INTEGER,
                min_marks INTEGER,
                age_limit TEXT,
                residency_requirement TEXT,
                docs_needed TEXT,
                application_mode TEXT,
                apply_url TEXT,
                deadline TEXT,
                deadline_description TEXT,
                time_min INTEGER,
                step_guide TEXT,
                selection TEXT,
                total_awards INTEGER,
                renewal TEXT,
                competitiveness TEXT,
                verified_status TEXT,
                last_verified TEXT,
                official_source TEXT,
                helpline TEXT,
                intro_seo TEXT,
                faq_json TEXT,
                notes_actions TEXT,
                keywords TEXT,
                scholarship_type TEXT DEFAULT 'Government',
                status TEXT DEFAULT 'Active',
                verification_year INTEGER DEFAULT NULL,
                show_on_homepage INTEGER DEFAULT 0,
                is_featured INTEGER DEFAULT 0,
                is_popular INTEGER DEFAULT 0,
                priority_score INTEGER DEFAULT 50,
                special_conditions TEXT DEFAULT NULL,
                tags TEXT DEFAULT NULL,
                thumbnail_url TEXT DEFAULT NULL,
                created_at TEXT DEFAULT NULL,
                scholarship_scope TEXT DEFAULT 'domestic',
                country_of_study TEXT DEFAULT NULL,
                always_open INTEGER DEFAULT 0
            );
        `);

        // Create indexes
        await turso.execute("CREATE INDEX idx_state ON scholarships(state);");
        await turso.execute("CREATE INDEX idx_level ON scholarships(level);");
        await turso.execute("CREATE INDEX idx_caste ON scholarships(caste);");
        await turso.execute("CREATE INDEX idx_gender ON scholarships(gender);");
        await turso.execute("CREATE INDEX idx_provider_type ON scholarships(provider_type);");
        await turso.execute("CREATE INDEX idx_app_type ON scholarships(app_type);");
        await turso.execute("CREATE INDEX idx_slug ON scholarships(slug);");

        await turso.execute(`
            CREATE TABLE scholarship_changelog (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scholarship_id TEXT NOT NULL,
                scholarship_title TEXT NOT NULL,
                action_type TEXT NOT NULL,
                details TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await turso.execute(`
            CREATE TABLE scholarship_translations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scholarship_id TEXT NOT NULL,
                locale TEXT NOT NULL,
                title TEXT,
                amount_description TEXT,
                benefits TEXT,
                selection TEXT,
                renewal TEXT,
                step_guide TEXT,
                faq_json TEXT,
                intro_seo TEXT,
                FOREIGN KEY (scholarship_id) REFERENCES scholarships(id),
                UNIQUE(scholarship_id, locale)
            );
        `);
        await turso.execute("CREATE INDEX idx_trans_lookup ON scholarship_translations(scholarship_id, locale);");

        // --- 3. Read data from local SQLite and insert into Turso ---
        
        // A. Scholarships
        console.log("📦 Reading local scholarships...");
        const scholarships = localDb.prepare("SELECT * FROM scholarships").all();
        console.log(`Found ${scholarships.length} scholarships.`);

        if (scholarships.length > 0) {
            console.log("📤 Uploading scholarships to Turso...");
            // Let's insert in chunks to avoid query size limits
            const chunkSize = 25;
            for (let i = 0; i < scholarships.length; i += chunkSize) {
                const chunk = scholarships.slice(i, i + chunkSize);
                const statements = chunk.map(s => {
                    const keys = Object.keys(s);
                    const columns = keys.join(', ');
                    const placeholders = keys.map(() => '?').join(', ');
                    const values = keys.map(k => s[k]);
                    return {
                        sql: `INSERT INTO scholarships (${columns}) VALUES (${placeholders})`,
                        args: values
                    };
                });
                await turso.batch(statements);
                console.log(`  Uploaded ${i + chunk.length} / ${scholarships.length} scholarships...`);
            }
        }

        // B. Scholarship Translations
        console.log("📦 Reading local translations...");
        const translations = localDb.prepare("SELECT * FROM scholarship_translations").all();
        console.log(`Found ${translations.length} translations.`);

        if (translations.length > 0) {
            console.log("📤 Uploading translations to Turso...");
            const chunkSize = 50;
            for (let i = 0; i < translations.length; i += chunkSize) {
                const chunk = translations.slice(i, i + chunkSize);
                const statements = chunk.map(t => {
                    // Omit 'id' so AutoIncrement takes care of it, or keep it. Let's keep it to preserve exact IDs.
                    const keys = Object.keys(t);
                    const columns = keys.join(', ');
                    const placeholders = keys.map(() => '?').join(', ');
                    const values = keys.map(k => t[k]);
                    return {
                        sql: `INSERT INTO scholarship_translations (${columns}) VALUES (${placeholders})`,
                        args: values
                    };
                });
                await turso.batch(statements);
                console.log(`  Uploaded ${i + chunk.length} / ${translations.length} translations...`);
            }
        }

        // C. Scholarship Changelog
        console.log("📦 Reading local changelogs...");
        const changelogs = localDb.prepare("SELECT * FROM scholarship_changelog").all();
        console.log(`Found ${changelogs.length} changelogs.`);

        if (changelogs.length > 0) {
            console.log("📤 Uploading changelogs to Turso...");
            const chunkSize = 50;
            for (let i = 0; i < changelogs.length; i += chunkSize) {
                const chunk = changelogs.slice(i, i + chunkSize);
                const statements = chunk.map(c => {
                    const keys = Object.keys(c);
                    const columns = keys.join(', ');
                    const placeholders = keys.map(() => '?').join(', ');
                    const values = keys.map(k => c[k]);
                    return {
                        sql: `INSERT INTO scholarship_changelog (${columns}) VALUES (${placeholders})`,
                        args: values
                    };
                });
                await turso.batch(statements);
                console.log(`  Uploaded ${i + chunk.length} / ${changelogs.length} changelogs...`);
            }
        }

        console.log("🎉 Migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        localDb.close();
        // Close turso client connection
        turso.close();
    }
}

run();
