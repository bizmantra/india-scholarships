// Offline tests for the "existing banned phrase" rule in scripts/lib/sa-inbox.js.
// A phrase the page already carries must not block an unrelated edit; a phrase the change introduces is
// still refused (and create-mode rows have no previous value, so they stay strict).
// Run: node --test scripts/study-abroad/banned-phrase.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sa = require('../lib/sa-inbox');

// A body_md that satisfies the article rules (>= 150 words and at least one link).
const filler = 'This sentence exists only so the article reaches the length the validator requires. '.repeat(12);
const article = (heading, extra = '') => `${heading}\n\n${filler}\n\nSee [the official page](https://www.ice.gov/sevis/i901).${extra}`;
const LEGACY = '## Executive Summary: Visa interview';
const CLEAN = '## Visa interview steps';
const check = (value, previous) => sa.validateSaValue('sa_guides', 'body_md', value, previous === undefined ? {} : { previous });

test('a legacy "Executive Summary" heading is carried forward (heading kept, nothing else touched)', () => {
    assert.equal(check(article(LEGACY), article(LEGACY)), null);
});

test('a page with the legacy heading can still be edited elsewhere', () => {
    assert.equal(check(article(LEGACY, '\n\nOne more sentence.'), article(LEGACY)), null);
});

test('removing the legacy heading is allowed', () => {
    assert.equal(check(article(CLEAN), article(LEGACY)), null);
});

test('introducing the phrase on a page that does not have it is refused', () => {
    assert.match(check(article(LEGACY), article(CLEAN)), /research notes or template filler/);
    assert.match(check(article(LEGACY), ''), /research notes or template filler/);
});

test('a create-mode row (no previous value) is still refused', () => {
    assert.match(check(article(LEGACY)), /research notes or template filler/);
});

test('carrying the legacy heading does not open the door to another banned phrase', () => {
    assert.match(check(article(LEGACY, '\n\nCheck the current fee before you apply.'), article(LEGACY)),
        /research notes or template filler/);
});

test('an ordinary edit without any banned phrase is unaffected', () => {
    assert.equal(check(article(CLEAN), article(CLEAN)), null);
});

test('the boilerplate summary rule works the same way', () => {
    const boiler = 'Complete 2026 guide to studying in Germany';
    assert.match(sa.validateSaValue('sa_guides', 'summary', boiler, {}), /research notes or template filler/);
    assert.equal(sa.validateSaValue('sa_guides', 'summary', boiler, { previous: boiler }), null);
    assert.equal(sa.validateSaValue('sa_guides', 'summary', 'German public universities charge semester fees, not tuition.', { previous: boiler }), null);
});
