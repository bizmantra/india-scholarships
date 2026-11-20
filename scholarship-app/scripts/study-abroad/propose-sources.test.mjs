// Offline tests for the proposal source gate (Spec D6 "next step"). No network, no database:
// every page is a fake HTML string and pageFor is a stub.
// Run: node --test scripts/study-abroad/propose-sources.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hostAllowed, registeredSource, proposalSourceVerdict, checkProposalSources } from '../lib/source-verify.mjs';

const ALLOWED = ['ice.gov', 'tum.de'];
const registry = {
    entries: [
        {
            id: 'usa-sevis-i901-f-m', fact_key: 'usa.visa.sevis_i901_fee_usd',
            url: 'https://www.ice.gov/sevis/i901',
            quote: 'I-901 SEVIS Fee F or M visa applicants (full payment) $350', value: '$350',
        },
        {
            // Registered but deliberately NOT on this test's allowlist, to prove the "exact URL" rule.
            id: 'de-visa-fee', fact_key: 'germany.visa.national_fee_eur',
            url: 'https://registry-only.example.de/visa-fee',
            quote: 'The national visa fee is 75 EUR', value: '75',
        },
    ],
};
const html = text => `<html><body><p>${text}</p></body></html>`;
const pageFor = async url => html(registry.entries.find(e => e.url === url)?.quote || '');
const run = (changes, options = {}) => checkProposalSources(changes, { allowed: ALLOWED, registry, pageFor, ...options });

// --- The plain host/URL check (no fetch) -------------------------------------------------------

// --- create mode (Spec D1): a new page row carries its own official_source and is gated too -----

test('a new page (create) with an allowlisted official_source is not refused', async () => {
    const r = await run([{
        create: true, table: 'sa_universities', key: 'new-uni',
        fields: { slug: 'new-uni', name: 'New Uni', official_source: 'https://www.tum.de/en/studies/fees' },
    }]);
    assert.deepEqual(r.refusals, []);
});

test('a new page (create) with a provider official_source is refused', async () => {
    const r = await run([{
        create: true, table: 'sa_universities', key: 'new-uni',
        fields: { slug: 'new-uni', name: 'New Uni', official_source: 'https://www.expatrio.com/blocked-account' },
    }]);
    assert.equal(r.refusals.length, 1);
    assert.equal(r.refusals[0].field, 'official_source');
});

test('a new page (create) whose change-level source is a provider is refused as a whole row', async () => {
    const r = await run([{
        create: true, table: 'sa_facts', key: 'new.fact', source: 'https://www.expatrio.com/blocked-account',
        fields: { official_source: 'https://www.ice.gov/sevis/i901', value: '$350' },
    }]);
    assert.equal(r.refusals.length, 1);
    assert.equal(r.refusals[0].field, null);
    assert.match(r.refusals[0].reason, /expatrio\.com/);
});

test('an allowlisted host passes, including a subdomain', async () => {
    const r = await run([{ table: 'sa_universities', key: 'tum', source: 'https://www.tum.de/en/studies/fees', fields: { summary: 'A summary.' } }]);
    assert.deepEqual(r.refusals, []);
    assert.deepEqual(r.warnings, []);
    assert.equal(hostAllowed('https://www.tum.de/en/studies/fees', ALLOWED), true);
    assert.equal(hostAllowed('https://tum.de/x', ALLOWED), true);
});

test('a URL registered in source-checks.json passes even when its host is not on the allowlist', async () => {
    assert.equal(registeredSource('https://registry-only.example.de/visa-fee', registry), true);
    assert.equal(registeredSource('https://registry-only.example.de/other-page', registry), false);
    assert.equal(registeredSource('https://www.expatrio.com/x', registry), false);

    const verdict = proposalSourceVerdict('https://registry-only.example.de/visa-fee', { allowed: ALLOWED, registry });
    assert.equal(verdict.accepted, true);
    assert.match(verdict.warning, /registered in source-checks\.json/);

    const r = await run([{ table: 'sa_guides', key: 'g', source: 'https://registry-only.example.de/visa-fee', fields: { summary: 'A summary.' } }]);
    assert.deepEqual(r.refusals, []); // accepted
    assert.equal(r.warnings.length, 1); // but flagged so the allowlist can be extended
});

test('an unallowlisted host is refused with the readable reason and counted', async () => {
    const r = await run([{ table: 'sa_guides', key: 'g', source: 'https://www.expatrio.com/blocked-account', fields: { summary: 'A summary.' } }]);
    assert.equal(r.refusals.length, 1);
    assert.equal(r.refusals[0].table, 'sa_guides');
    assert.equal(r.refusals[0].key, 'g');
    assert.equal(r.refusals[0].field, null); // the whole change is refused
    assert.equal(r.refusals[0].reason, 'source host not on the official allowlist and not in source-checks.json (https://www.expatrio.com/blocked-account)');
});

test('a lookalike host is refused even though the real domain is allowlisted', async () => {
    assert.equal(hostAllowed('https://www.ice.gov.evil.com/sevis/i901', ALLOWED), false);
    const r = await run([{ table: 'sa_guides', key: 'g', source: 'https://www.ice.gov.evil.com/sevis/i901', fields: { summary: 'A summary.' } }]);
    assert.equal(r.refusals.length, 1);
    assert.match(r.refusals[0].reason, /not on the official allowlist and not in source-checks\.json/);
});

test('the proposals file default source is checked when a change has none', async () => {
    const ok = await run([{ table: 'sa_guides', key: 'g', fields: { summary: 'A summary.' } }], { defaultSource: 'https://www.tum.de/guide' });
    assert.deepEqual(ok.refusals, []);
    const bad = await run([{ table: 'sa_guides', key: 'g', fields: { summary: 'A summary.' } }], { defaultSource: 'https://www.expatrio.com/blocked-account' });
    assert.equal(bad.refusals.length, 1);
    assert.equal(bad.refusals[0].field, null);
    // change.source overrides the default
    const override = await run([{ table: 'sa_guides', key: 'g', source: 'https://www.tum.de/guide', fields: { summary: 'A summary.' } }],
        { defaultSource: 'https://www.expatrio.com/blocked-account' });
    assert.deepEqual(override.refusals, []);
});

test('an unallowlisted fields.official_source is refused for that field only', async () => {
    const r = await run([{ table: 'sa_universities', key: 'tum', fields: { summary: 'A summary.', official_source: 'https://www.expatrio.com/blocked-account' } }]);
    assert.equal(r.refusals.length, 1);
    assert.equal(r.refusals[0].field, 'official_source');
    assert.equal(r.refusals[0].reason, 'source host not on the official allowlist and not in source-checks.json (https://www.expatrio.com/blocked-account)');
});

test('a non-URL official_source is left to sa-inbox validation (no duplicate refusal here)', async () => {
    const r = await run([{ table: 'sa_universities', key: 'tum', fields: { official_source: 'not a url' } }]);
    assert.deepEqual(r.refusals, []);
});

test('no source at all on a wording-only change is not refused', async () => {
    const r = await run([{ table: 'sa_universities', key: 'tum', fields: { summary: 'A summary.' } }]);
    assert.deepEqual(r.refusals, []);
    assert.deepEqual(r.warnings, []);
});

test('the plain host check never fetches a page', async () => {
    let fetches = 0;
    const noFetch = async () => { fetches += 1; return html(''); };
    await checkProposalSources([
        { table: 'sa_universities', key: 'tum', source: 'https://www.tum.de/fees', fields: { tuition_per_year: '5000' } },
        { table: 'sa_guides', key: 'g', source: 'https://www.ice.gov/x', fields: { summary: 'A summary.' } },
    ], { allowed: ALLOWED, registry, pageFor: noFetch });
    assert.equal(fetches, 0);
});

// --- sa_facts "value" changes use the existing checkProposals rules ---------------------------

test('a sa_facts value change with no registry entry is refused', async () => {
    const r = await run([{ table: 'sa_facts', key: 'germany.blocked_account.annual_eur', fields: { value: '12000' } }]);
    assert.equal(r.refusals.length, 1);
    assert.equal(r.refusals[0].field, 'value');
    assert.match(r.refusals[0].reason, /no entry in data\/study-abroad\/source-checks\.json/);
});

test('a sa_facts value that matches the registry and the live page passes', async () => {
    const r = await run([{ table: 'sa_facts', key: 'usa.visa.sevis_i901_fee_usd', fields: { value: '$350', official_source: 'https://www.ice.gov/sevis/i901' } }]);
    assert.deepEqual(r.refusals, []);
});

test('a sa_facts value that differs from the registry is refused', async () => {
    const r = await run([{ table: 'sa_facts', key: 'usa.visa.sevis_i901_fee_usd', fields: { value: '$385' } }]);
    assert.equal(r.refusals.length, 1);
    assert.match(r.refusals[0].reason, /does not match the registry value/);
});

test('a sa_facts value whose quote has left the live page is refused', async () => {
    const r = await run([{ table: 'sa_facts', key: 'usa.visa.sevis_i901_fee_usd', fields: { value: '$350' } }],
        { pageFor: async () => html('The fee is now $385') });
    assert.equal(r.refusals.length, 1);
    assert.match(r.refusals[0].reason, /fail: quote not found/);
});

test('an unfetchable page for a sa_facts value fails (it is not softened to a warning)', async () => {
    const r = await run([{ table: 'sa_facts', key: 'usa.visa.sevis_i901_fee_usd', fields: { value: '$350' } }],
        { pageFor: async () => null });
    assert.equal(r.refusals.length, 1);
    assert.match(r.refusals[0].reason, /unverifiable/);
});

test('a refused citation on a sa_facts row is refused before any page is fetched', async () => {
    let fetches = 0;
    const r = await run([{ table: 'sa_facts', key: 'usa.visa.sevis_i901_fee_usd', source: 'https://www.expatrio.com/x', fields: { value: '$350' } }],
        { pageFor: async () => { fetches += 1; return html(''); } });
    assert.equal(r.refusals.length, 1);
    assert.equal(r.refusals[0].field, null);
    assert.equal(fetches, 0);
});

// --- Guard: the committed files behave as documented ------------------------------------------

const readData = name => JSON.parse(readFileSync(new URL(`../../data/study-abroad/${name}`, import.meta.url), 'utf8'));

test('the committed allowlist and registry accept the ICE I-901 source and refuse a provider', () => {
    const allowed = readData('official-domains.json').domains;
    const committedRegistry = readData('source-checks.json');

    assert.equal(proposalSourceVerdict('https://www.ice.gov/sevis/i901', { allowed, registry: committedRegistry }).accepted, true);
    assert.equal(proposalSourceVerdict('https://www.expatrio.com/blocked-account', { allowed, registry: committedRegistry }).accepted, false);
    assert.equal(proposalSourceVerdict('https://www.ice.gov.evil.com/sevis/i901', { allowed, registry: committedRegistry }).accepted, false);
    // The registry entry URL is accepted by the exact-URL rule too.
    for (const entry of committedRegistry.entries) {
        assert.equal(registeredSource(entry.url, committedRegistry), true, entry.url);
        assert.equal(proposalSourceVerdict(entry.url, { allowed, registry: committedRegistry }).accepted, true, entry.url);
    }
});
