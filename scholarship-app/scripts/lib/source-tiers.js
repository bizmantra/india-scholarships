/**
 * What kind of site a source page is on, and so what it can prove (see docs/SCHOLARSHIP_SOURCES.md).
 *
 *   official    government or academic site (.gov.in, .nic.in, .edu, .ac.in): proves anything
 *   provider    any other site not listed below, ASSUMED to be the provider's own: proves anything
 *               (a weak guess: unknown listing sites land here until added to the lists below)
 *   platform    application platforms that host scholarships for providers (Buddy4Study, Vidyasaarathi):
 *               prove the scholarship exists, its apply link and usually its deadline
 *   aggregator  explainer / listing sites: prove it exists and point to the official page, never a number on their own
 *   news        press coverage: a lead only
 *   coaching    coaching institutes and ed-tech: never a source
 */
const COACHING = [
    'allen.ac.in', 'allen.in', 'fiitjee.com', 'aakash.ac.in', 'srichaitanya.net', 'pw.live', 'madeeasy.in', 'byjus.com',
    'unacademy.com', 'vedantu.com', 'alsias.net',
];
const PLATFORMS = ['buddy4study.com', 'vidyasaarathi.co.in'];
const AGGREGATORS = ['collegedunia.com', 'shiksha.com', 'careers360.com', 'jagranjosh.com', 'scholarshipsinindia.com', 'internshala.com', 'leverageedu.com'];
const NEWS = ['indiatoday.in', 'timesofindia.indiatimes.com', 'hindustantimes.com', 'ndtv.com', 'news18.com', 'wikipedia.org', 'youtube.com'];

const onList = (host, list) => list.some(d => host === d || host.endsWith('.' + d));

function hostOf(url) {
    try { return new URL(String(url).trim()).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
}

function sourceTier(url) {
    const host = hostOf(url);
    if (!host) return 'invalid';
    if (onList(host, COACHING)) return 'coaching';
    if (onList(host, PLATFORMS)) return 'platform';
    if (onList(host, AGGREGATORS)) return 'aggregator';
    if (onList(host, NEWS)) return 'news';
    if (/(^|\.)(gov\.in|nic\.in|edu|ac\.in|edu\.in)$/.test(host)) return 'official';
    return 'provider';
}

// Tiers that can point to a scholarship but cannot be the final word on a fact
const isSecondaryTier = tier => ['platform', 'aggregator', 'news'].includes(tier);
// Best first: used to prefer the more trustworthy of two answers
const TIER_RANK = { official: 0, provider: 1, platform: 2, aggregator: 3, news: 4, coaching: 5, invalid: 6 };

module.exports = { sourceTier, isSecondaryTier, hostOf, TIER_RANK, COACHING, PLATFORMS, AGGREGATORS, NEWS };
