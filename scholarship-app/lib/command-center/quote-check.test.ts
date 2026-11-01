import test from 'node:test';
import assert from 'node:assert/strict';
import { checkQuote, fetchableUrl, pageText, quoteInText } from './quote-check.ts';

const page = `<html><body><script>var x = "Last date 99";</script>
<h1>AICTE Saksham</h1><p>Student Application Open till : <b>31-10-2026</b></p>
<p>${'Other scheme details and long filler text. '.repeat(20)}</p></body></html>`;

const fake = (body: string, ok = true, type = 'text/html') => (async () =>
    ({ ok, headers: { get: () => type }, text: async () => body }) as any) as unknown as typeof fetch;

test('quote on the page is found, ignoring spacing and punctuation', () => {
    assert.equal(quoteInText('Student Application Open till: 31-10-2026', pageText(page)), true);
});

test('quote with ellipsis needs every piece on the page', () => {
    assert.equal(quoteInText('AICTE Saksham ... Open till : 31-10-2026', pageText(page)), true);
    assert.equal(quoteInText('AICTE Saksham ... closes 31-12-2026', pageText(page)), false);
});

test('script contents do not count as page text', () => {
    assert.equal(quoteInText('Last date 99', pageText(page)), false);
});

test('private and non-web addresses are not fetched', () => {
    assert.equal(fetchableUrl('https://scholarships.gov.in/x'), true);
    for (const u of ['http://localhost:3000', 'http://127.0.0.1/a', 'file:///etc/passwd', 'http://[::1]/', 'not a url']) {
        assert.equal(fetchableUrl(u), false, u);
    }
});

test('checkQuote verdicts', async () => {
    assert.equal(await checkQuote('https://x.gov.in/a', 'Open till : 31-10-2026', fake(page)), 'found');
    assert.equal(await checkQuote('https://x.gov.in/a', 'Open till : 31-12-2026', fake(page)), 'not_found');
    assert.equal(await checkQuote('https://x.gov.in/a', 'Open till : 31-12-2026', fake('<div id=root></div>')), 'unchecked');
    assert.equal(await checkQuote('https://x.gov.in/a', 'Open till : 31-10-2026', fake(page, false)), 'unchecked');
    assert.equal(await checkQuote('https://x.gov.in/a', 'Open till : 31-10-2026', fake('%PDF', true, 'application/pdf')), 'unchecked');
    assert.equal(await checkQuote('http://localhost/a', 'anything long enough', fake(page)), 'unchecked');
});
