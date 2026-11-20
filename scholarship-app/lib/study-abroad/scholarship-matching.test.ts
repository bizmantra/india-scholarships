import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    matchScholarshipToUniversities,
    isProgramCompatibleWithLevel,
    rankScholarshipsForUniversity,
    rankScholarshipsForProgram,
    type MatchableUniversity,
    type MatchableScholarship,
} from './scholarship-matching.ts';

const UNIVERSITIES: MatchableUniversity[] = [
    { slug: 'tum-technical-university-munich', name: 'Technical University of Munich (TUM)', country: 'germany' },
    { slug: 'university-of-hamburg', name: 'University of Hamburg', country: 'germany' },
    { slug: 'heidelberg-university', name: 'Heidelberg University (Ruprecht-Karls-Universität Heidelberg)', country: 'germany' },
    { slug: 'uc-berkeley', name: 'University of California, Berkeley (UCB)', country: 'usa' },
    { slug: 'nyu-new-york-university', name: 'New York University (NYU Tandon / Courant)', country: 'usa' },
    { slug: 'uk-oxford', name: 'University of Oxford', country: 'uk' as MatchableUniversity['country'] },
];

test('matches exact provider, phrase in title/provider, and explicit alias; never matches unlaunched country', () => {
    const tumSch: MatchableScholarship = {
        slug: 'tum-scholarships',
        title: 'Technical University of Munich Scholarships',
        provider: 'Technical University of Munich (TUM)',
        country_of_study: 'Germany',
    };
    assert.deepEqual(matchScholarshipToUniversities(tumSch, UNIVERSITIES).map(u => u.slug), ['tum-technical-university-munich']);

    const hamburgSch: MatchableScholarship = {
        slug: 'hamburg-sch',
        title: 'Hamburg University International Student Scholarships',
        provider: 'University of Hamburg',
        country_of_study: 'Germany',
    };
    assert.deepEqual(matchScholarshipToUniversities(hamburgSch, UNIVERSITIES).map(u => u.slug), ['university-of-hamburg']);

    const haasSch: MatchableScholarship = {
        slug: 'uc-berkeley-haas-mba-scholarships',
        title: 'UC Berkeley Haas MBA Scholarships',
        provider: 'Haas School of Business, UC Berkeley',
        country_of_study: 'United States',
    };
    assert.deepEqual(matchScholarshipToUniversities(haasSch, UNIVERSITIES).map(u => u.slug), ['uc-berkeley']);

    const oxfordSch: MatchableScholarship = {
        slug: 'rhodes-scholarship-india',
        title: 'Rhodes Scholarship',
        provider: 'University of Oxford',
        country_of_study: 'United Kingdom',
    };
    assert.deepEqual(matchScholarshipToUniversities(oxfordSch, UNIVERSITIES), []);
});

test('does not fuzzy-guess unrelated providers', () => {
    const daad: MatchableScholarship = {
        slug: 'daad-masters',
        title: 'DAAD Scholarships for Master\'s and PhD Studies in Germany',
        provider: 'German Academic Exchange Service (DAAD)',
        country_of_study: 'Germany',
    };
    assert.deepEqual(matchScholarshipToUniversities(daad, UNIVERSITIES), []);
});

test('checks program degree compatibility with scholarship level', () => {
    assert.equal(isProgramCompatibleWithLevel('ms', 'Undergraduate, Masters'), true);
    assert.equal(isProgramCompatibleWithLevel('ms', 'PhD'), false);
    assert.equal(isProgramCompatibleWithLevel('ms', 'MBA'), false);
    assert.equal(isProgramCompatibleWithLevel('mba', 'MBA'), true);
    assert.equal(isProgramCompatibleWithLevel('ms', null), true);
});

test('ranks university own scholarships first, then country scholarships', () => {
    const scholarships: MatchableScholarship[] = [
        { slug: 'daad', title: 'DAAD', provider: 'DAAD', country_of_study: 'Germany', level: 'Masters, PhD' },
        { slug: 'tum-phd', title: 'TUM PhD', provider: 'Technical University of Munich (TUM)', country_of_study: 'Germany', level: 'PhD' },
        { slug: 'tum-ms', title: 'TUM MS', provider: 'Technical University of Munich (TUM)', country_of_study: 'Germany', level: 'Masters' },
        { slug: 'hidden-dup', title: 'Hidden', provider: 'DAAD', country_of_study: 'Germany', level: 'Masters' },
    ];
    const uniRanked = rankScholarshipsForUniversity(UNIVERSITIES[0], scholarships, new Set(['hidden-dup']), 6);
    assert.deepEqual(uniRanked.map(s => s.slug), ['tum-phd', 'tum-ms', 'daad']);

    const progRanked = rankScholarshipsForProgram(
        { university_slug: 'tum-technical-university-munich', university_name: 'Technical University of Munich (TUM)', country: 'germany', degree: 'ms' },
        scholarships,
        new Set(['hidden-dup']),
        6,
    );
    assert.deepEqual(progRanked.map(s => s.slug), ['tum-ms', 'daad', 'tum-phd']);
});
