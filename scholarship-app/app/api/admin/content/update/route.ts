import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { execSync } from 'child_process';
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            id,
            verified_status,
            amount_annual,
            deadline,
            docs_needed,
            helpline,
            faq_json,
            selection,
            step_guide,
            renewal
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing scholarship ID.' }, { status: 400 });
        }

        const client = getClient();

        // Ensure changelog table exists
        await client.execute(`
            CREATE TABLE IF NOT EXISTS scholarship_changelog (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scholarship_id TEXT NOT NULL,
                scholarship_title TEXT NOT NULL,
                action_type TEXT NOT NULL,
                details TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Get existing entry to compute diff
        const existingRes = await client.execute({
            sql: 'SELECT * FROM scholarships WHERE id = ?',
            args: [id]
        });
        
        const existing = existingRes.rows[0];
        if (!existing) {
            return NextResponse.json({ error: 'Scholarship not found in database.' }, { status: 404 });
        }

        // Serialize arrays / structures safely
        const docsNeededStr = typeof docs_needed === 'string' ? docs_needed : JSON.stringify(docs_needed || []);
        const faqJsonStr = typeof faq_json === 'string' ? faq_json : JSON.stringify(faq_json || []);

        // Prepare UPDATE statement
        const result = await client.execute({
            sql: `
                UPDATE scholarships 
                SET 
                    verified_status = ?,
                    amount_annual = ?,
                    deadline = ?,
                    docs_needed = ?,
                    helpline = ?,
                    faq_json = ?,
                    selection = ?,
                    step_guide = ?,
                    renewal = ?
                WHERE id = ?
            `,
            args: [
                verified_status || 'Draft',
                amount_annual !== undefined ? Number(amount_annual) : 0,
                deadline || '',
                docsNeededStr,
                helpline || '',
                faqJsonStr,
                selection || '',
                step_guide || '',
                renewal || '',
                id
            ]
        });

        if (result.rowsAffected > 0) {
            // Compute diff changes list
            const changesList: string[] = [];
            
            if (String(existing.verified_status) !== String(verified_status)) {
                changesList.push(`Status changed to '${verified_status}' (was '${existing.verified_status}')`);
            }
            if (Number(existing.amount_annual) !== Number(amount_annual)) {
                changesList.push(`Annual amount changed to ₹${amount_annual} (was ₹${existing.amount_annual})`);
            }
            if (String(existing.deadline) !== String(deadline)) {
                changesList.push(`Deadline changed to '${deadline}' (was '${existing.deadline}')`);
            }
            if (String(existing.helpline) !== String(helpline)) {
                changesList.push(`Helpline updated`);
            }
            if (String(existing.docs_needed) !== docsNeededStr) {
                changesList.push(`Required documents updated`);
            }
            if (String(existing.faq_json) !== faqJsonStr) {
                changesList.push(`FAQs list updated`);
            }
            if (String(existing.selection) !== String(selection)) {
                changesList.push(`Selection criteria edited`);
            }
            if (String(existing.step_guide) !== String(step_guide)) {
                changesList.push(`Application steps edited`);
            }
            if (String(existing.renewal) !== String(renewal)) {
                changesList.push(`Renewal terms edited`);
            }

            // Decide action type
            let actionType = 'UPDATE';
            if (String(existing.verified_status).toLowerCase() !== 'verified' && String(verified_status).toLowerCase() === 'verified') {
                actionType = 'VERIFY';
            } else if (String(existing.verified_status).toLowerCase() === 'verified' && String(verified_status).toLowerCase() !== 'verified') {
                actionType = 'DRAFT';
            }

            // Log change to database if differences exist
            if (changesList.length > 0) {
                await client.execute({
                    sql: `
                        INSERT INTO scholarship_changelog (scholarship_id, scholarship_title, action_type, details)
                        VALUES (?, ?, ?, ?)
                    `,
                    args: [id, String(existing.title), actionType, changesList.join(', ')]
                });
            }
        }

        // Run background quality audits and wordpress export synchronizations locally only (skip on read-only serverless production)
        if (process.env.NODE_ENV !== 'production') {
            console.log('🔄 Saving changes complete. Synchronizing content quality audits & exports...');
            try {
                execSync('node scripts/content-quality-audit.js', { cwd: process.cwd() });
                execSync('node scripts/export-for-wp-bulk.js', { cwd: process.cwd() });
                console.log('✅ Synchronization complete.');
            } catch (e: any) {
                console.error('Error running synchronization scripts in admin API:', e.message);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error updating scholarship database entry:', error);
        return NextResponse.json({ error: 'Database update failed.', details: error.message }, { status: 500 });
    }
}
