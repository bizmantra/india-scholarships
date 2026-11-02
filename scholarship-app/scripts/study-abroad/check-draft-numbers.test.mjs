import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, extractFigures, inNotes, checkChanges } from './check-draft-numbers.mjs';

test('normalize removes commas in numbers and spaces after a currency sign', () => {
    assert.equal(normalize('£ 34,550 and 1,200,000'), '£34550 and 1200000');
});

test('extractFigures finds money, percent, decimals, durations and dates', () => {
    const f = extractFigures('Fee **£34,550**, grade 60%, IELTS 6.5, 12 months, apply by 31st January.');
    assert.deepEqual(f.sort(), ['12 month', '31 january', '6.5', '60%', '£34550'].sort());
});

test('a decimal inside money or a percent is not counted twice', () => {
    assert.deepEqual(extractFigures('£1.5 and 5.5%'), ['£1.5', '5.5%']);
});

test('inNotes matches either date order and singular or plural units', () => {
    assert.equal(inNotes('31 january', normalize('Deadline: January 31, 2027')), true);
    assert.equal(inNotes('12 month', normalize('Duration 12 months full-time')), true);
    assert.equal(inNotes('£36000', normalize('Fees £36,000')), true);
    assert.equal(inNotes('£36000', normalize('Fees £35,000')), false);
});

test('checkChanges lists only figures missing from the notes', () => {
    const changes = [{ key: 'x', fields: { summary: 'Costs £30,000.', body_md: 'IELTS 6.5 and £99,999.', faq_json: [] } }];
    const [r] = checkChanges(changes, 'Tuition £30,000. IELTS 6.5.');
    assert.deepEqual(r.missing, ['£99999']);
    assert.equal(r.total, 3);
});
