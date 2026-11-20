import test from 'node:test';
import assert from 'node:assert/strict';
import { isProductionDatabase, saApprovalBlock, saRisk } from './hermes-sa.ts';

const PREFIX = 'hermes-';
const proposal = (over: Record<string, unknown> = {}) => ({
    agent: 'hermes-india-ops', kind: 'sa_field_change', field: 'summary', risk: 'normal', agentPrefix: PREFIX, ...over,
}) as Parameters<typeof saApprovalBlock>[0];

// --- risk ----------------------------------------------------------------------------------------------

test('a plain Study Abroad field change with a quote is normal risk', () => {
    assert.equal(saRisk({ kind: 'sa_field_change', field: 'summary', quote: 'A sentence from the page.', confidence: 'high', quoteCheck: 'found' }), 'normal');
});

test('a new page is always high risk', () => {
    assert.equal(saRisk({ kind: 'sa_new_page', quote: 'A sentence.', confidence: 'high', quoteCheck: 'found' }), 'high');
});

test('publishing (field "status") is high risk', () => {
    assert.equal(saRisk({ kind: 'sa_field_change', field: 'status', quote: 'A sentence.', quoteCheck: 'found' }), 'high');
});

test('no quote, low confidence, or a quote the server could not find make it high risk', () => {
    assert.equal(saRisk({ kind: 'sa_field_change', field: 'official_source', quote: null, quoteCheck: 'unchecked' }), 'high');
    assert.equal(saRisk({ kind: 'sa_field_change', field: 'summary', quote: '   ', confidence: 'high' }), 'high');
    assert.equal(saRisk({ kind: 'sa_field_change', field: 'summary', quote: 'x', confidence: 'low' }), 'high');
    assert.equal(saRisk({ kind: 'sa_field_change', field: 'summary', quote: 'x', confidence: 'high', quoteCheck: 'not_found' }), 'high');
});

// --- what may be approved from Hermes -----------------------------------------------------------------

test('a normal-risk Study Abroad field change by Hermes may be approved from Hermes', () => {
    assert.equal(saApprovalBlock(proposal()), null);
});

test('a new page must be approved in the Command Center', () => {
    assert.match(String(saApprovalBlock(proposal({ kind: 'sa_new_page', field: '__new__' }))), /New pages can only be approved in the Command Center/);
});

test('a status change must be approved in the Command Center', () => {
    assert.match(String(saApprovalBlock(proposal({ field: 'status' }))), /Publishing can only be approved/);
});

test('a high-risk Study Abroad change must be approved in the Command Center', () => {
    assert.match(String(saApprovalBlock(proposal({ risk: 'high' }))), /High-risk change/);
});

test('another agent\'s Study Abroad proposal cannot be approved from Hermes', () => {
    assert.match(String(saApprovalBlock(proposal({ agent: 'content-editor' }))), /Only proposals made by Hermes/);
});

test('a Scholarship publish is not covered here: the bridge still refuses it elsewhere', () => {
    // saApprovalBlock only answers for Study Abroad kinds; the scholarship rules are unchanged in hermes-bridge.ts
    assert.equal(saApprovalBlock(proposal({ kind: 'sa_field_change', field: 'summary', risk: 'normal' })), null);
});

// --- which database the bridge is talking to ----------------------------------------------------------

test('a local copy is never the production database', () => {
    assert.equal(isProductionDatabase({ useLocal: true, dbUrl: 'libsql://india-scholarships-prod.turso.io' }), false);
    assert.equal(isProductionDatabase({ dbUrl: null }), false);
});

test('the staging URL, or a URL named as staging, is not production', () => {
    const staging = 'libsql://india-scholarships-staging-abc.aws-ap-south-1.turso.io';
    assert.equal(isProductionDatabase({ dbUrl: staging, stagingUrl: staging }), false);
    assert.equal(isProductionDatabase({ dbUrl: staging }), false);
});

test('any other remote database is treated as production', () => {
    assert.equal(isProductionDatabase({ dbUrl: 'libsql://india-scholarships-wonderchild111.aws-ap-south-1.turso.io' }), true);
    // A preview whose TURSO_DATABASE_URL was left on production must not be treated as staging
    assert.equal(isProductionDatabase({ dbUrl: 'libsql://india-scholarships-wonderchild111.aws-ap-south-1.turso.io', stagingUrl: 'libsql://india-scholarships-staging-abc.turso.io' }), true);
});
