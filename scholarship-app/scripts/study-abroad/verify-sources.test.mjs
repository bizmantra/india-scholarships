// Offline tests for the source checker. No network: pages are fake HTML strings.
// Run: node --test scripts/study-abroad/verify-sources.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { htmlToText, normalizeText, hostAllowed, validateEntry, checkEntry, fetchPage } from '../lib/source-verify.mjs';
import { run } from './verify-sources.mjs';

const ALLOWED = ['ice.gov', 'travel.state.gov'];
const entry = {
    id: 'x', fact_key: 'k', url: 'https://www.ice.gov/sevis/i901',
    quote: 'I-901 SEVIS Fee F or M visa applicants (full payment) $350', value: '$350',
};
const page = html => `<html><head><script>var a="$999";</script></head><body><table><tr><td>${html}</td></tr></table></body></html>`;

test('htmlToText drops scripts, styles and tags and decodes entities', () => {
    const t = htmlToText('<script>var x=1</script><p>Fee&nbsp;&amp; more &#36;350</p><style>p{}</style>');
    assert.equal(normalizeText(t), 'fee & more $350');
});

test('normalizeText folds spaces, quote marks and case', () => {
    assert.equal(normalizeText('  Don’t   SHOUT now '), "don't shout now");
});

test('hostAllowed accepts the domain and subdomains, rejects lookalikes', () => {
    assert.equal(hostAllowed('https://www.ice.gov/x', ALLOWED), true);
    assert.equal(hostAllowed('https://ice.gov/x', ALLOWED), true);
    assert.equal(hostAllowed('https://ice.gov.evil.com/x', ALLOWED), false);
    assert.equal(hostAllowed('https://notice.gov/x', ALLOWED), false);
    assert.equal(hostAllowed('not a url', ALLOWED), false);
});

test('validateEntry flags missing fields and a value that is not in the quote', () => {
    assert.deepEqual(validateEntry(entry), []);
    assert.ok(validateEntry({ ...entry, url: 'http://ice.gov/x' }).length > 0);
    assert.ok(validateEntry({ ...entry, quote: '' }).length > 0);
    assert.ok(validateEntry({ ...entry, value: '$999' }).some(p => p.includes('inside the quote')));
});

test('checkEntry passes when the quote and value are on the page', () => {
    assert.equal(checkEntry(entry, page('I-901 SEVIS Fee F or M visa applicants (full payment) $350'), ALLOWED).status, 'pass');
});

test('checkEntry passes across extra whitespace and markup between words', () => {
    const html = '<td>I-901 SEVIS Fee</td><td>F or M visa applicants</td><td>(full payment)</td><td>$350</td>';
    assert.equal(checkEntry(entry, page(html), ALLOWED).status, 'pass');
});

test('checkEntry fails when the amount changed on the page', () => {
    const r = checkEntry(entry, page('I-901 SEVIS Fee F or M visa applicants (full payment) $385'), ALLOWED);
    assert.equal(r.status, 'fail');
    assert.match(r.reason, /quote not found/);
});

test('checkEntry ignores numbers in scripts (the page text is what counts)', () => {
    const r = checkEntry({ ...entry, quote: 'the fee is $999', value: '$999' }, page('the fee is $999'), ALLOWED);
    assert.equal(r.status, 'pass');
});

test('checkEntry fails for a host not on the allowlist, even if the text matches', () => {
    const r = checkEntry({ ...entry, url: 'https://provider.example.com/fees' }, page(entry.quote), ALLOWED);
    assert.equal(r.status, 'fail');
    assert.match(r.reason, /allowlist/);
});

test('checkEntry reports unverifiable (not pass) when the page could not be fetched', () => {
    assert.equal(checkEntry(entry, null, ALLOWED).status, 'unverifiable');
});

test('fetchPage returns null on a non-200 response or a network error', async () => {
    const forbidden = async () => new Response('no', { status: 403 });
    const broken = async () => { throw new Error('offline'); };
    assert.equal(await fetchPage('https://www.ice.gov/x', { fetchImpl: forbidden }), null);
    assert.equal(await fetchPage('https://www.ice.gov/x', { fetchImpl: broken }), null);
});

test('run() on the committed registry: pass with a matching page, fail when the fee changed', async () => {
    const logs = [];
    const good = await run({ fetchImpl: async () => new Response(page(entry.quote), { status: 200 }), log: m => logs.push(m) });
    assert.equal(good.code, 0);
    const changed = await run({ fetchImpl: async () => new Response(page('$385'), { status: 200 }), log: () => {} });
    assert.equal(changed.code, 1);
});

test('run() exit code 0 when unverifiable, 1 under --strict', async () => {
    const down = async () => new Response('', { status: 503 });
    assert.equal((await run({ fetchImpl: down, log: () => {} })).code, 0);
    assert.equal((await run({ fetchImpl: down, strictMode: true, log: () => {} })).code, 1);
});

// Proposal pre-flight (checkProposals). Pure: pageFor is a fake.
import { checkProposals } from '../lib/source-verify.mjs';

const registry = { entries: [{ ...entry, fact_key: 'usa.visa.sevis_i901_fee_usd' }] };
const livePage = async () => page(entry.quote);

test('checkProposals passes a value that matches the registry and a live quote', async () => {
    const r = await checkProposals([{ table: 'sa_facts', key: 'usa.visa.sevis_i901_fee_usd', fields: { value: '$350', official_source: 'https://www.ice.gov/sevis/i901' } }],
        { registry, allowed: ALLOWED, pageFor: livePage });
    assert.deepEqual(r.failures, []);
});

test('checkProposals refuses a fact with no registry entry', async () => {
    const r = await checkProposals([{ table: 'sa_facts', key: 'germany.visa.national_fee_eur', fields: { value: '75' } }],
        { registry, allowed: ALLOWED, pageFor: livePage });
    assert.equal(r.failures.length, 1);
    assert.match(r.failures[0].reason, /no entry/);
});

test('checkProposals refuses a value that differs from the registry', async () => {
    const r = await checkProposals([{ table: 'sa_facts', key: 'usa.visa.sevis_i901_fee_usd', fields: { value: '$385' } }],
        { registry, allowed: ALLOWED, pageFor: livePage });
    assert.match(r.failures[0].reason, /does not match/);
});

test('checkProposals refuses a registry value whose quote has left the live page', async () => {
    const r = await checkProposals([{ table: 'sa_facts', key: 'usa.visa.sevis_i901_fee_usd', fields: { value: '$350' } }],
        { registry, allowed: ALLOWED, pageFor: async () => page('$385') });
    assert.match(r.failures[0].reason, /fail: quote not found/);
});

test('checkProposals refuses an unverifiable page for a fact value', async () => {
    const r = await checkProposals([{ table: 'sa_facts', key: 'usa.visa.sevis_i901_fee_usd', fields: { value: '$350' } }],
        { registry, allowed: ALLOWED, pageFor: async () => null });
    assert.match(r.failures[0].reason, /unverifiable/);
});

test('checkProposals fails a fact whose source is a provider, and only warns for a university source', async () => {
    const r = await checkProposals([
        { table: 'sa_facts', key: 'germany.blocked_account.expatrio_setup_eur', fields: { official_source: 'https://www.expatrio.com/blocked-account' } },
        { table: 'sa_universities', key: 'tum', fields: { tuition_per_year: '6000', official_source: 'https://www.tum.de/fees' } },
    ], { registry, allowed: ALLOWED, pageFor: livePage });
    assert.equal(r.failures.length, 1);
    assert.equal(r.warnings.length, 1);
    assert.equal(r.warnings[0].key, 'tum');
});
