const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const typeArgIndex = args.indexOf('--type');
const type = typeArgIndex !== -1 ? args[typeArgIndex + 1] : 'daily';

const dataDir = path.join(__dirname, '..', 'data');

if (type === 'weekly') {
    const summaryPath = path.join(dataDir, 'weekly-enrichment-summary.json');
    const outputPath = path.join(dataDir, 'weekly-email-body.html');
    
    let summary = { swept: 0, skipped: 0, auto_updated: 0, pending_review: 0, check_failed: 0 };
    if (fs.existsSync(summaryPath)) {
        summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); color: #fff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h2 { margin: 0; font-size: 24px; }
            .stat-container { display: flex; justify-content: space-between; margin: 20px 0; }
            .stat-card { flex: 1; margin: 0 5px; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #f0f0f0; }
            .stat-val { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
            .stat-label { font-size: 12px; color: #666; }
            .stat-swept { background-color: #f3f4f6; }
            .stat-updated { background-color: #ecfdf5; color: #047857; }
            .stat-review { background-color: #fffbeb; color: #b45309; }
            .stat-failed { background-color: #fef2f2; color: #b91c1c; }
            .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Weekly Enrichment Report</h2>
                <p style="margin: 5px 0 0 0; font-size: 14px;">India Scholarships Freshness Pipeline</p>
            </div>
            
            <p>Hello Admin,</p>
            <p>The weekly catalog enrichment sweep has completed. Here are the search analytics and automated updates summary:</p>
            
            <div class="stat-container">
                <div class="stat-card stat-swept">
                    <div class="stat-val">${summary.swept}</div>
                    <div class="stat-label">Swept</div>
                </div>
                <div class="stat-card stat-swept">
                    <div class="stat-val">${summary.skipped}</div>
                    <div class="stat-label">Skipped</div>
                </div>
                <div class="stat-card stat-updated">
                    <div class="stat-val">${summary.auto_updated}</div>
                    <div class="stat-label">Auto-Updated</div>
                </div>
                <div class="stat-card stat-review">
                    <div class="stat-val">${summary.pending_review}</div>
                    <div class="stat-label">Pending Review</div>
                </div>
                <div class="stat-card stat-failed">
                    <div class="stat-val">${summary.check_failed}</div>
                    <div class="stat-label">Check Failed</div>
                </div>
            </div>

            <p><strong>Next Steps:</strong> Log into the admin dashboard or run <code>node scripts/apply-reviewed-changes.js</code> to process the pending amount tier changes.</p>
            
            <div class="footer">
                This is an automated report sent from the GitHub Action scheduler.
            </div>
        </div>
    </body>
    </html>
    `;
    
    fs.writeFileSync(outputPath, html);
    console.log(`✅ Weekly email template written to ${outputPath}`);

} else {
    // Daily report
    const summaryPath = path.join(dataDir, 'daily-check-summary.json');
    const outputPath = path.join(dataDir, 'daily-email-body.html');
    
    let summary = { checked: 0, pending_review: 0, check_failed: 0, changes: [], failed: [] };
    if (fs.existsSync(summaryPath)) {
        summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    }

    let changesRows = '';
    if (summary.changes && summary.changes.length > 0) {
        summary.changes.forEach(c => {
            let changeDetails = '';
            c.changes.forEach(ch => {
                changeDetails += `<div><strong>${ch.field}</strong>: <span style="text-decoration: line-through; color: #999;">${ch.old || 'None'}</span> &rarr; <span style="color: #047857; font-weight: bold;">${ch.new}</span></div>`;
            });
            changesRows += `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>${c.title}</strong><br/>
                    <small style="color: #666;">${c.slug}</small>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${changeDetails}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
                    <a href="${c.source}" target="_blank" style="color: #4f46e5; text-decoration: none; font-size: 13px;">View Source &rarr;</a>
                </td>
            </tr>`;
        });
    } else {
        changesRows = '<tr><td colspan="3" style="padding: 20px; text-align: center; color: #666;">No pending deadline changes found today.</td></tr>';
    }

    let failedList = '';
    if (summary.failed && summary.failed.length > 0) {
        summary.failed.forEach(f => {
            failedList += `
            <li style="margin-bottom: 10px; border-bottom: 1px dashed #fcd34d; padding-bottom: 5px;">
                <strong>${f.title}</strong> (<small>${f.slug}</small>)<br/>
                <span style="color: #dc2626; font-size: 13px;">Error: ${f.error}</span>
            </li>`;
        });
    } else {
        failedList = '<li style="color: #666;">No check failures recorded today.</li>';
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h2 { margin: 0; font-size: 24px; }
            .stat-container { display: flex; justify-content: space-between; margin: 20px 0; }
            .stat-card { flex: 1; margin: 0 5px; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #f0f0f0; }
            .stat-val { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
            .stat-label { font-size: 12px; color: #666; }
            .stat-checked { background-color: #f3f4f6; }
            .stat-review { background-color: #fffbeb; color: #b45309; }
            .stat-failed { background-color: #fef2f2; color: #b91c1c; }
            .section-title { font-size: 16px; font-weight: bold; margin: 25px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #f0f0f0; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f8fafc; padding: 10px; text-align: left; font-size: 13px; color: #475569; border-bottom: 2px solid #e2e8f0; }
            .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Daily Deadline Verification Report</h2>
                <p style="margin: 5px 0 0 0; font-size: 14px;">India Scholarships Freshness Pipeline</p>
            </div>
            
            <p>Hello Admin,</p>
            <p>The daily scholarship deadline verification check has completed. Here is today's summary:</p>
            
            <div class="stat-container">
                <div class="stat-card stat-checked">
                    <div class="stat-val">${summary.checked}</div>
                    <div class="stat-label">Checked Today</div>
                </div>
                <div class="stat-card stat-review">
                    <div class="stat-val">${summary.pending_review}</div>
                    <div class="stat-label">Pending Review</div>
                </div>
                <div class="stat-card stat-failed">
                    <div class="stat-val">${summary.check_failed}</div>
                    <div class="stat-label">Check Failed</div>
                </div>
            </div>

            <div class="section-title">📝 Proposed Deadline Changes (${summary.pending_review})</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40%;">Scholarship</th>
                        <th style="width: 40%;">Changes</th>
                        <th style="width: 20%; text-align: center;">Source</th>
                    </tr>
                </thead>
                <tbody>
                    ${changesRows}
                </tbody>
            </table>

            <div class="section-title" style="color: #b91c1c;">⚠️ Check Failures (${summary.check_failed})</div>
            <ul style="padding-left: 20px; margin-top: 10px;">
                ${failedList}
            </ul>
            
            <div class="footer">
                This is an automated report sent from the GitHub Action scheduler.
            </div>
        </div>
    </body>
    </html>
    `;
    
    fs.writeFileSync(outputPath, html);
    console.log(`✅ Daily email template written to ${outputPath}`);
}
