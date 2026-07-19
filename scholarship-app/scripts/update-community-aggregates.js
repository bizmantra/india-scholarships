const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const LOCAL_DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function run() {
    console.log("🏁 Starting Community Signals hourly aggregation...");

    // 1. Set up connection
    let db;
    let localDb = null;
    if (TURSO_DATABASE_URL && TURSO_AUTH_TOKEN) {
        console.log(`🌐 Connecting to Turso Database for aggregation: ${TURSO_DATABASE_URL}`);
        db = createClient({
            url: TURSO_DATABASE_URL,
            authToken: TURSO_AUTH_TOKEN,
        });
    } else {
        console.log(`📦 Connecting to local SQLite Database: ${LOCAL_DB_PATH}`);
        localDb = new Database(LOCAL_DB_PATH);
        db = {
            execute: async (query, args) => {
                const sqlText = typeof query === 'string' ? query : query.sql;
                const params = typeof query === 'string' ? args : query.args;
                const stmt = localDb.prepare(sqlText);
                const rows = stmt.all(params || []);
                return { rows };
            },
            batch: async (statements) => {
                const results = [];
                for (const stmt of statements) {
                    const prepared = localDb.prepare(stmt.sql);
                    const rows = prepared.all(stmt.args || []);
                    results.push({ rows });
                }
                return results;
            },
            close: () => localDb.close()
        };
    }

    try {
        // Fetch all approved events
        console.log("📥 Fetching approved events...");
        const eventsRes = await db.execute("SELECT * FROM community_events WHERE moderation_status = 'approved'");
        const events = eventsRes.rows;
        console.log(`Found ${events.length} approved events.`);

        // Group events by scholarship_id
        const groups = {};
        for (const ev of events) {
            const schId = ev.scholarship_id;
            if (!groups[schId]) {
                groups[schId] = [];
            }
            groups[schId].push(ev);
        }

        const aggregates = [];
        for (const [schId, evList] of Object.entries(groups)) {
            let total_events = evList.length;
            let application_count = 0;
            let verification_count = 0;
            let selected_count = 0;
            let payment_count = 0;
            let total_payment_amount = 0;
            let last_activity = null;
            const issuesMap = {};

            for (const ev of evList) {
                // Determine latest activity
                if (!last_activity || ev.created_at > last_activity) {
                    last_activity = ev.created_at;
                }

                let meta = {};
                try {
                    meta = JSON.parse(ev.metadata_json);
                } catch (e) {
                    console.warn(`Failed to parse metadata JSON for event ID ${ev.id}`);
                }

                // Count by event type / stage
                if (ev.event_type === 'application_submitted') {
                    application_count++;
                } else if (ev.event_type === 'application_stage_changed') {
                    if (meta.stage === 'Selected') {
                        selected_count++;
                    } else if (['Institute Verification', 'District Verification', 'State Verification'].includes(meta.stage)) {
                        verification_count++;
                    }
                } else if (ev.event_type === 'payment_received') {
                    payment_count++;
                    const amt = Number(meta.amount) || 0;
                    total_payment_amount += amt;
                }

                // Process issues
                if (meta.issues && Array.isArray(meta.issues)) {
                    for (const issue of meta.issues) {
                        issuesMap[issue] = (issuesMap[issue] || 0) + 1;
                    }
                }
            }

            const average_payment = payment_count > 0 ? Math.round(total_payment_amount / payment_count) : 0;
            const common_issues_json = JSON.stringify(issuesMap);

            aggregates.push({
                scholarship_id: schId,
                total_events,
                application_count,
                verification_count,
                selected_count,
                payment_count,
                average_payment,
                last_activity,
                common_issues_json
            });
        }

        console.log(`Computed aggregates for ${aggregates.length} scholarships.`);

        // Clear existing aggregates
        console.log("🧹 Clearing old aggregates...");
        await db.execute("DELETE FROM community_signals_aggregates");

        // Insert new aggregates
        if (aggregates.length > 0) {
            console.log("📤 Inserting fresh aggregates...");
            const statements = aggregates.map(agg => ({
                sql: `INSERT INTO community_signals_aggregates 
                      (scholarship_id, total_events, application_count, verification_count, selected_count, payment_count, average_payment, last_activity, common_issues_json) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    agg.scholarship_id,
                    agg.total_events,
                    agg.application_count,
                    agg.verification_count,
                    agg.selected_count,
                    agg.payment_count,
                    agg.average_payment,
                    agg.last_activity,
                    agg.common_issues_json
                ]
            }));

            // Turso has batch support; local wrapper does too
            if (TURSO_DATABASE_URL && TURSO_AUTH_TOKEN) {
                // If it's Turso, let's insert in chunks to avoid request size limits
                const chunkSize = 20;
                for (let i = 0; i < statements.length; i += chunkSize) {
                    const chunk = statements.slice(i, i + chunkSize);
                    await db.batch(chunk);
                }
            } else {
                for (const stmt of statements) {
                    await db.execute(stmt.sql, stmt.args);
                }
            }
        }

        console.log("🎉 Aggregation completed successfully!");
    } catch (error) {
        console.error("❌ Aggregation failed:", error);
    } finally {
        if (localDb) {
            localDb.close();
        } else if (db && typeof db.close === 'function') {
            db.close();
        }
    }
}

// Run aggregation immediately if called directly
if (require.main === module) {
    run();
}

module.exports = { runAggregation: run };
