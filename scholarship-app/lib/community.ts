import { getClient } from './db';

export async function runAggregation() {
    const client = getClient();

    // 1. Fetch all approved events
    const eventsRes = await client.execute("SELECT * FROM community_events WHERE moderation_status = 'approved'");
    const events = eventsRes.rows;

    // 2. Group events by scholarship_id
    const groups: Record<string, any[]> = {};
    for (const ev of events) {
        const schId = String(ev.scholarship_id);
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
        const issuesMap: Record<string, number> = {};

        for (const ev of evList) {
            if (!last_activity || String(ev.created_at) > last_activity) {
                last_activity = String(ev.created_at);
            }

            let meta: Record<string, any> = {};
            try {
                meta = JSON.parse(String(ev.metadata_json));
            } catch (e) {
                console.warn(`Failed to parse metadata JSON for event ID ${ev.id}`);
            }

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

    // 3. Clear existing aggregates on database
    await client.execute("DELETE FROM community_signals_aggregates");

    // 4. Insert new aggregates
    if (aggregates.length > 0) {
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

        // Batch execution
        const chunkSize = 20;
        for (let i = 0; i < statements.length; i += chunkSize) {
            const chunk = statements.slice(i, i + chunkSize);
            await client.batch(chunk);
        }
    }
}
