/**
 * Is this web page a usable source for this scholarship? Used by the source backfill.
 *
 * A page counts (`ok`) when it can be read, names the scholarship, and, if Jev is available, Jev agrees the page is
 * about it. The kind of site comes from our domain lists (source-tiers.js); for an unlisted domain Jev can spot a
 * listing or news site. Nothing here changes any scholarship fact.
 */
const { getPage } = require('./research');
const { isSpecificSource } = require('./research');
const { sourceTier } = require('./source-tiers');
const { nameOnPage, window, SITE_KINDS } = require('./evidence');
const jev = require('./jev');

async function inspectPage({ url, title }) {
    let tier = sourceTier(url);
    const out = { url, tier, specific: isSpecificSource(url), readable: false, nameShare: 0, about: null, ok: false, why: '' };
    if (tier === 'coaching' || tier === 'invalid') { out.why = tier === 'coaching' ? 'coaching site' : 'not a web address'; return out; }
    const page = await getPage(url);
    if (!page) { out.why = 'page could not be read (dead, blocked, or built by scripts)'; return out; }
    out.readable = true;
    const name = nameOnPage(title, page.plain);
    out.nameShare = name ? Math.round(name.share * 100) / 100 : 0;
    if (!name || name.share < 0.4) { out.why = "the scholarship's name is not on the page"; return out; }
    if (jev.enabled()) {
        const questions = { about: { type: 'noul', instructions: `Is this page about the scholarship named "${title}"?` } };
        if (tier === 'provider') questions.kind = { type: 'choice', instructions: 'What kind of website is this page on?', criteria: SITE_KINDS };
        const answers = await jev.decide(page.plain.slice(Math.max(0, name.index - 200)).slice(0, 900), questions);
        out.about = jev.yes(answers, 'about');
        const kind = answers?.kind;
        if (kind && tier === 'provider' && ['aggregator', 'news', 'platform'].includes(kind.choice) && (kind.probabilities?.[kind.choice] ?? kind.confidence ?? 0) >= 0.7) {
            out.tier = tier = kind.choice;
            out.tierFromJev = true;
        }
    }
    out.ok = out.about === null ? name.share >= 0.6 : out.about >= 0.5;
    if (!out.ok) out.why = out.about === null ? 'only part of the name is on the page' : `Jev: page is not about this scholarship (${out.about.toFixed(2)})`;
    return out;
}

module.exports = { inspectPage };
