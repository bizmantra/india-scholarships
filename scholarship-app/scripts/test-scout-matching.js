/**
 * Checks the scout's duplicate matching (scripts/lib/scholarship-match.js) against cases seen in real runs.
 *
 * Usage: node scripts/test-scout-matching.js   (exits 1 if any case fails)
 */
const assert = require('assert');
const { matchKey, findDuplicate } = require('./lib/scholarship-match');

const listed = [
    { title: 'Mukhyamantri Kanya Utthan Yojana (Graduation)', slug: 'mukhyamantri-kanya-utthan-yojana-graduation', state: 'Bihar' },
    { title: 'Post-Matric Scholarship for Persons with Disabilities - UDID (Karnataka)', slug: 'post-matric-pwd-udid-karnataka', state: 'Karnataka' },
    { title: 'Kotak Kanya Scholarship 2026-27', slug: 'kotak-kanya-scholarship-2026-27', state: 'All India' },
    { title: 'Post Matric Scholarship for SC Students', slug: 'up-post-matric-sc', state: 'Uttar Pradesh' },
    { title: 'Merit Scholarship for Rural Girls', slug: 'merit-rural-girls', state: '' },
];

const cases = [
    // [description, candidate, options, expected listed title or null]
    ['Hindi/English: Chief Minister = Mukhyamantri',
        { title: 'Chief Minister Kanya Utthan Yojana (Graduation)', state: 'Bihar' }, {}, listed[0].title],
    ['CM + Girl + Scheme = Mukhyamantri Kanya Yojana',
        { title: 'CM Girl Utthan Scheme - Graduation 2026', state: 'Bihar' }, {}, listed[0].title],
    ['Different level (10+2 vs Graduation) is not a duplicate',
        { title: 'Mukhyamantri Kanya Utthan Yojana 10+2 pass incentive', state: 'Bihar' }, {}, null],
    ['All-India scheme is not a duplicate of a Karnataka scheme',
        { title: 'Post-matric Scholarship for Students with Disabilities', state: 'All India' }, {}, null],
    ['Before research (state unknown), a state-specific match is left for research to decide',
        { title: 'Post-matric Scholarship for Students with Disabilities' }, { strictState: true }, null],
    ['Same state, same scheme is a duplicate',
        { title: 'Postmatric Scholarship for PwD - UDID', state: 'Karnataka' }, {}, listed[1].title],
    ['Years are ignored',
        { title: 'Kotak Kanya Scholarship 2025', state: 'All India' }, {}, listed[2].title],
    ['Two different states are not duplicates',
        { title: 'Post-Matric Scholarship for SC Students (Bihar)', state: 'Bihar' }, {}, null],
    ['Listing with no state matches any state',
        { title: 'Merit Scholarship for Rural Girls', state: 'Odisha' }, {}, listed[4].title],
    ['Same slug is always a duplicate',
        { title: 'Something else', slug: 'kotak-kanya-scholarship-2026-27', state: 'Bihar' }, {}, listed[2].title],
];

// Within one run: leads for the same scheme under different names collapse into one
const sameRun = [
    ['10+2 incentive vs 10+2 with English name in brackets',
        'Mukhyamantri Kanya Utthan Yojana 10+2 pass incentive',
        'Mukhyamantri Kanya Utthan Yojana for 10+2 (Chief Minister Kanya Utthan Scheme for 10+2)', true],
    ['12th = Intermediate = 10+2', 'Mukhyamantri Balika Protsahan Yojana (12th)', 'CM Girl Incentive Scheme - Intermediate', true],
    ['Pre-matric vs Post-matric', 'Pre-Matric Scholarship for Minorities', 'Post-Matric Scholarship for Minorities', false],
];


let failed = 0;
const check = (name, fn) => {
    try {
        fn();
        console.log(`✅ ${name}`);
    } catch (error) {
        failed++;
        console.log(`❌ ${name}\n   ${error.message}`);
    }
};

for (const [name, candidate, options, expected] of cases) {
    check(name, () => assert.strictEqual(findDuplicate(candidate, listed, options)?.title ?? null, expected));
}
for (const [name, a, b, expected] of sameRun) {
    check(`Same run: ${name}`, () => assert.strictEqual(!!findDuplicate({ title: b }, [{ title: a }]), expected,
        `keys: "${matchKey(a)}" / "${matchKey(b)}"`));
}

// Before research, a lead naming a state is not folded into an earlier lead with no state
check('Same run: state-named lead is kept apart from a no-state lead', () => assert.strictEqual(
    findDuplicate({ title: 'Bihar Post-Matric Scholarship for Persons with Disabilities' },
        [{ title: 'Post-matric Scholarship for Students with Disabilities' }], { strictState: true }), undefined));

console.log(failed ? `\n${failed} case(s) failed` : '\nAll cases passed');
process.exit(failed ? 1 : 0);
