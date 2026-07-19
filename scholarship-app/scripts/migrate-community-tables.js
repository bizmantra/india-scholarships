const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const LOCAL_DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function run() {
    console.log("🏁 Running Community Signals table migration...");

    // 1. Migrate Local SQLite database
    console.log(`📦 Connecting to local database at: ${LOCAL_DB_PATH}`);
    let localDb;
    try {
        localDb = new Database(LOCAL_DB_PATH);
        
        console.log("🏗️ Creating tables in local SQLite database...");
        
        localDb.exec(`
            CREATE TABLE IF NOT EXISTS community_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scholarship_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                metadata_json TEXT NOT NULL,
                session_hash TEXT NOT NULL,
                moderation_status TEXT DEFAULT 'pending',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        `);

        localDb.exec(`
            CREATE TABLE IF NOT EXISTS community_signals_aggregates (
                scholarship_id TEXT PRIMARY KEY,
                total_events INTEGER DEFAULT 0,
                application_count INTEGER DEFAULT 0,
                verification_count INTEGER DEFAULT 0,
                selected_count INTEGER DEFAULT 0,
                payment_count INTEGER DEFAULT 0,
                average_payment INTEGER DEFAULT 0,
                last_activity TEXT,
                common_issues_json TEXT
            );
        `);

        localDb.exec(`
            CREATE TABLE IF NOT EXISTS community_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_name TEXT NOT NULL,
                scholarship_id TEXT NOT NULL,
                session_hash TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create indexes
        localDb.exec("CREATE INDEX IF NOT EXISTS idx_community_events_scholarship_id ON community_events(scholarship_id);");
        localDb.exec("CREATE INDEX IF NOT EXISTS idx_community_events_moderation_status ON community_events(moderation_status);");
        localDb.exec("CREATE INDEX IF NOT EXISTS idx_community_analytics_event_name ON community_analytics(event_name);");

        console.log("✅ Local migration completed successfully.");
    } catch (err) {
        console.error("❌ Local migration failed:", err);
    } finally {
        if (localDb) localDb.close();
    }

    // 2. Migrate Turso Database
    if (TURSO_DATABASE_URL && TURSO_AUTH_TOKEN) {
        console.log(`🌐 Connecting to Turso Database at: ${TURSO_DATABASE_URL}`);
        const turso = createClient({
            url: TURSO_DATABASE_URL,
            authToken: TURSO_AUTH_TOKEN,
        });

        try {
            console.log("🏗️ Creating tables on Turso Database...");

            await turso.execute(`
                CREATE TABLE IF NOT EXISTS community_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    scholarship_id TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    metadata_json TEXT NOT NULL,
                    session_hash TEXT NOT NULL,
                    moderation_status TEXT DEFAULT 'pending',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await turso.execute(`
                CREATE TABLE IF NOT EXISTS community_signals_aggregates (
                    scholarship_id TEXT PRIMARY KEY,
                    total_events INTEGER DEFAULT 0,
                    application_count INTEGER DEFAULT 0,
                    verification_count INTEGER DEFAULT 0,
                    selected_count INTEGER DEFAULT 0,
                    payment_count INTEGER DEFAULT 0,
                    average_payment INTEGER DEFAULT 0,
                    last_activity TEXT,
                    common_issues_json TEXT
                );
            `);

            await turso.execute(`
                CREATE TABLE IF NOT EXISTS community_analytics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_name TEXT NOT NULL,
                    scholarship_id TEXT NOT NULL,
                    session_hash TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Create indexes on Turso
            await turso.execute("CREATE INDEX IF NOT EXISTS idx_community_events_scholarship_id ON community_events(scholarship_id);");
            await turso.execute("CREATE INDEX IF NOT EXISTS idx_community_events_moderation_status ON community_events(moderation_status);");
            await turso.execute("CREATE INDEX IF NOT EXISTS idx_community_analytics_event_name ON community_analytics(event_name);");

            console.log("✅ Turso migration completed successfully.");
        } catch (err) {
            console.error("❌ Turso migration failed:", err);
        } finally {
            turso.close();
        }
    } else {
        console.log("⚠️ Turso environment variables missing or incomplete, skipping cloud migration.");
    }
}

run();
