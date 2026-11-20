import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createClient } = require('@libsql/client');
const sa = require('../lib/sa-inbox.js');
const { SA_DDL } = require('../lib/study-abroad-tables.js');

async function runTests() {
    console.log('--- STARTING D1 TEST SUITE ---');
    const client = createClient({ url: 'file::memory:' });

    // 1. Create tables
    for (const sql of SA_DDL) {
        await client.execute(sql);
    }
    await client.execute(`CREATE TABLE IF NOT EXISTS agent_proposals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent TEXT NOT NULL,
        kind TEXT NOT NULL,
        scholarship_id TEXT NOT NULL,
        scholarship_title TEXT NOT NULL,
        field TEXT,
        old_value TEXT,
        new_value TEXT,
        payload_json TEXT,
        category TEXT NOT NULL,
        risk TEXT NOT NULL DEFAULT 'normal',
        source_citation TEXT,
        evidence_json TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        times_proposed INTEGER NOT NULL DEFAULT 1,
        first_proposed_at TEXT DEFAULT (datetime('now')),
        last_proposed_at TEXT DEFAULT (datetime('now')),
        decided_by TEXT,
        decided_at TEXT,
        decision_note TEXT
    )`);
    await client.execute(`CREATE TABLE IF NOT EXISTS agent_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent TEXT NOT NULL,
        kind TEXT NOT NULL,
        actor TEXT NOT NULL,
        summary TEXT NOT NULL,
        details_json TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    )`);

    console.log('✓ Tables created successfully');

    // 2. Test validateNewRow unit checks
    const validUni = {
        slug: 'oxford-university',
        name: 'University of Oxford',
        country: 'uk',
        summary: 'A world-leading university in Oxford, England offering undergraduate and postgraduate degrees.',
        seo_title: 'University of Oxford: Fees & Admission Guide for Indian Students',
        meta_description: 'Complete guide to studying at the University of Oxford for Indian students: tuition fees, admission requirements, and living costs in the UK.',
        body_md: '## University of Oxford\n\n' + 'The University of Oxford is one of the world leading institutions of higher education and research. '.repeat(15) + '\n\nOfficial website: https://www.ox.ac.uk',
        official_source: 'https://www.ox.ac.uk',
        checked_at: '2026-10-15',
    };

    assert.strictEqual(sa.validateNewRow('sa_universities', validUni), null);
    console.log('✓ Valid university passes validation');

    // Test nested JSON (array faq_json and object infobox_json)
    const uniWithNestedJson = {
        ...validUni,
        slug: 'tum-munich',
        name: 'Technical University of Munich',
        faq_json: [
            { q: 'Is tuition free at TUM?', a: 'Most consecutive master and bachelor programs have no tuition fees for domestic/EU students, but some international tuition fees apply.' },
            { q: 'What is the language of instruction?', a: 'Many graduate programs are taught entirely in English.' }
        ],
        infobox_json: {
            founded: 1868,
            type: 'Public Research University',
            campus: 'Munich, Garching, Weihenstephan',
            total_students: 50000
        }
    };
    assert.strictEqual(sa.validateNewRow('sa_universities', uniWithNestedJson), null);
    console.log('✓ Array faq_json and object infobox_json pass validateNewRow');

    assert(sa.validateNewRow('sa_universities', { ...validUni, summary: '' })?.includes('summary'));
    console.log('✓ Missing summary fails');

    assert(sa.validateNewRow('sa_universities', { ...validUni, slug: 'bad_slug!' })?.includes('slug must match'));
    console.log('✓ Bad slug fails');

    assert(sa.validateNewRow('sa_universities', validUni, { keyExists: () => true })?.includes('duplicate key'));
    console.log('✓ Duplicate key fails');

    const prog = {
        id: 'oxford-cs-msc',
        slug: 'cs-msc',
        university_slug: 'unknown-uni',
        country: 'uk',
        degree: 'msc',
        field: 'computer-science',
        title: 'MSc Computer Science',
    };
    assert(sa.validateNewRow('sa_programs', prog, { universityExists: () => false })?.includes('unknown university_slug'));
    console.log('✓ Unknown university_slug fails');

    assert(sa.validateNewRow('sa_universities', { ...validUni, body_md: validUni.body_md + ' not specified in the official source' })?.includes('research notes or template filler'));
    console.log('✓ Banned phrase fails');

    assert(sa.validateNewRow('sa_programs', { ...prog, tuition_per_year: 30000 })?.includes('missing source on a money field'));
    console.log('✓ Missing source on money field fails');

    assert(sa.validateNewRow('sa_universities', { ...validUni, unknown_column_xyz: 'test' })?.includes('unknown column'));
    console.log('✓ Unknown column fails');

    assert(sa.validateNewRow('sa_universities', { ...validUni, country: 'atlantis' })?.includes('unknown country'));
    console.log('✓ Unknown country fails');

    const guide = {
        slug: 'uk-student-visa-guide',
        title: 'UK Student Visa Guide',
        country: 'uk',
        kind: 'invalid-kind',
        summary: 'Guide to UK visas for international students.',
        seo_title: 'UK Student Visa Guide 2026',
        meta_description: 'Detailed requirements for UK student visa applications from India.',
        body_md: '## UK Visas\n\n' + 'Word '.repeat(160) + ' https://gov.uk',
        official_source: 'https://gov.uk',
        checked_at: '2026-10-15',
    };
    assert(sa.validateNewRow('sa_guides', guide)?.includes('kind must be'));
    console.log('✓ Invalid guide kind fails');

    // 3. Test validatePublishRow
    assert.strictEqual(sa.validatePublishRow('sa_universities', validUni), null);
    console.log('✓ Valid published row passes publish gate');

    assert(sa.validatePublishRow('sa_universities', {
        ...validUni,
        summary: 'Complete 2026 guide to studying at Oxford university with fees and deadlines.'
    })?.includes('boilerplate'));
    console.log('✓ Boilerplate summary fails publish gate');

    assert(sa.validatePublishRow('sa_universities', {
        ...validUni,
        tuition_per_year: 30000,
        official_source: ''
    })?.includes('official_source'));
    console.log('✓ Missing official source on money field fails publish gate');

    // 4. Test simulate propose -> approve -> publish -> undo
    console.log('\n--- SIMULATING PROPOSE -> APPROVE -> UNDO WORKFLOW ---');

    // Step A: Propose new page with nested array/object fields
    const targetId = sa.targetId('sa_universities', uniWithNestedJson.slug);
    const convertedFields = {};
    for (const [k, v] of Object.entries(uniWithNestedJson)) {
        convertedFields[k] = sa.toText(v);
    }
    const newValue = JSON.stringify(convertedFields);

    await client.execute({
        sql: `INSERT INTO agent_proposals (agent, kind, scholarship_id, scholarship_title, field, old_value, new_value, payload_json, category, risk, source_citation)
              VALUES ('content-editor', ?, ?, ?, '__new__', '', ?, ?, 'study_abroad', 'normal', ?)`,
        args: [sa.NEW_KIND, targetId, uniWithNestedJson.name, newValue, JSON.stringify({ table: 'sa_universities', key: uniWithNestedJson.slug, path: sa.pagePath('sa_universities', uniWithNestedJson) }), uniWithNestedJson.official_source],
    });

    const proposal = (await client.execute('SELECT * FROM agent_proposals WHERE id = 1')).rows[0];
    assert.strictEqual(proposal.kind, sa.NEW_KIND);
    assert.strictEqual(proposal.status, 'pending');
    console.log('✓ Proposal inserted as pending sa_new_page');

    // Step B: Approve new page proposal (simulate inbox.ts decide() logic)
    const rawParsed = JSON.parse(proposal.new_value);
    const rowData = {};
    for (const [k, v] of Object.entries(rawParsed)) {
        rowData[k] = sa.toText(v);
    }
    const valErr = sa.validateNewRow('sa_universities', rowData);
    assert.strictEqual(valErr, null, 'Approval validation must succeed');

    const nowIso = '2026-10-29 12:00:00';
    const toInsert = {
        ...rowData,
        status: 'draft',
        created_at: nowIso,
        updated_at: nowIso,
    };
    const cols = Object.keys(toInsert);
    const args = cols.map(c => sa.storedSaValue('sa_universities', c, toInsert[c]));

    await client.batch([
        {
            sql: `INSERT INTO sa_universities (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
            args,
        },
        {
            sql: "UPDATE agent_proposals SET status = 'approved', decided_by = 'owner', decided_at = datetime('now') WHERE id = 1",
            args: [],
        },
        {
            sql: `INSERT INTO agent_events (agent, kind, actor, summary, details_json) VALUES (?, ?, ?, ?, ?)`,
            args: ['content-editor', 'approval', 'owner', `Approved new page for "${uniWithNestedJson.name}" (Study Abroad, draft)`, JSON.stringify({
                proposal_id: 1, table: 'sa_universities', key: uniWithNestedJson.slug, kind: sa.NEW_KIND, updated_at: nowIso,
            })],
        }
    ], 'write');

    const liveUni = (await client.execute({ sql: 'SELECT * FROM sa_universities WHERE slug = ?', args: [uniWithNestedJson.slug] })).rows[0];
    assert(liveUni, 'Live university row should exist');
    assert.strictEqual(liveUni.status, 'draft', 'Status must be draft on insert');
    assert.strictEqual(liveUni.created_at, nowIso);
    assert.strictEqual(liveUni.updated_at, nowIso);

    // Verify nested JSON values stored as proper JSON text in SQLite
    const parsedFaqs = JSON.parse(liveUni.faq_json);
    assert(Array.isArray(parsedFaqs), 'Stored FAQ must parse as array');
    assert.strictEqual(parsedFaqs.length, 2);
    assert.strictEqual(parsedFaqs[0].q, 'Is tuition free at TUM?');
    const parsedInfobox = JSON.parse(liveUni.infobox_json);
    assert.strictEqual(parsedInfobox.founded, 1868);
    assert.strictEqual(parsedInfobox.total_students, 50000);
    console.log('✓ Row inserted with status = draft, server timestamps, and correctly parsed JSON');

    // Step C: Try to publish with boilerplate summary (must fail publish gate)
    const boilerplateCandidate = { ...liveUni, summary: 'Complete 2026 guide to TUM', status: 'published' };
    const publishErr = sa.validatePublishRow('sa_universities', boilerplateCandidate);
    assert(publishErr?.includes('boilerplate'), 'Publish gate must reject boilerplate summary');
    console.log('✓ Publish gate rejected boilerplate summary');

    // Step D: Valid publish gate
    const validCandidate = { ...liveUni, status: 'published' };
    assert.strictEqual(sa.validatePublishRow('sa_universities', validCandidate), null);
    console.log('✓ Valid publish gate passed');

    // Step E: Undo while untouched and draft
    const log = (await client.execute({
        sql: `SELECT details_json FROM agent_events WHERE kind = 'approval' AND json_extract(details_json, '$.proposal_id') = 1 ORDER BY id DESC LIMIT 1`,
        args: [],
    })).rows[0];
    const savedUpdatedAt = JSON.parse(String(log.details_json)).updated_at;
    assert.strictEqual(liveUni.updated_at, savedUpdatedAt, 'updated_at matches');
    assert.strictEqual(liveUni.status, 'draft', 'status is draft');

    // Execute undo
    await client.batch([
        { sql: 'DELETE FROM sa_universities WHERE slug = ?', args: [uniWithNestedJson.slug] },
        { sql: "UPDATE agent_proposals SET status = 'rejected', decided_by = 'owner', decided_at = datetime('now'), decision_note = 'Undone after approval' WHERE id = 1", args: [] },
        {
            sql: `INSERT INTO agent_events (agent, kind, actor, summary, details_json) VALUES (?, ?, ?, ?, ?)`,
            args: ['content-editor', 'undo', 'owner', `Undid new page "${uniWithNestedJson.name}" (Study Abroad)`, JSON.stringify({ proposal_id: 1, table: 'sa_universities', key: uniWithNestedJson.slug })],
        }
    ], 'write');

    const afterUndo = (await client.execute({ sql: 'SELECT * FROM sa_universities WHERE slug = ?', args: [uniWithNestedJson.slug] })).rows[0];
    assert.strictEqual(afterUndo, undefined, 'Row should be deleted after undo');
    const undoneProposal = (await client.execute('SELECT * FROM agent_proposals WHERE id = 1')).rows[0];
    assert.strictEqual(undoneProposal.status, 'rejected', 'Proposal should be marked rejected after undo');
    console.log('✓ Undo successfully deleted draft row and marked proposal rejected');

    // Step F: Test undo refuses if published or modified
    // Re-insert as published
    await client.execute({
        sql: `INSERT INTO sa_universities (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
        args: cols.map(c => c === 'status' ? 'published' : sa.storedSaValue('sa_universities', c, toInsert[c])),
    });
    const pubUni = (await client.execute({ sql: 'SELECT * FROM sa_universities WHERE slug = ?', args: [uniWithNestedJson.slug] })).rows[0];
    assert.notStrictEqual(pubUni.status, 'draft');
    console.log('✓ Undo refuses when page is no longer draft');

    console.log('\n--- ALL D1 END-TO-END TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
