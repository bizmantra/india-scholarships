import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    '/*': ['./data/scholarships.db'],
    '/api/search': ['./data/scholarships.db'],
  },
  experimental: {
    staticGenerationMaxConcurrency: 8,
  },
  async redirects() {
    const mappings = [
      { from: 'legacy-foundation-for-excellence-scholarship', to: 'foundation-for-excellence-ffe-scholarship' },
      { from: 'legacy-nabanna-scholarship', to: 'nabanna-scholarship-west-bengal' },
      { from: 'pm-yasasvi-scholarship', to: 'pm-yashasvi-scholarship' },
      { from: 'legacy-ssp-post-matric-scholarship-state-scholarship-portal', to: 'ssp-pre-matric-post-matric-scholarship-karnataka' },
      { from: 'legacy-ssp-pre-matric-scholarship-state-scholarship-portal', to: 'ssp-pre-matric-post-matric-scholarship-karnataka' },
      { from: 'legacy-government-of-india-post-matric-scholarship-via-mahadbt', to: 'mahadbt-post-matric-scholarship-maharashtra' },
      { from: 'legacy-moovalur-ramamirtham-ammaiyar-higher-education-assurance-scheme', to: 'pudhumai-penn-scheme-tamil-nadu' },
      { from: 'legacy-pudhumai-penn-scheme', to: 'pudhumai-penn-scheme-tamil-nadu' },
      { from: 'legacy-sanchi-honnamma-scholarship', to: 'sanchi-honnamma-scholarship-karnataka' },
      { from: 'post-matric-scholarship-adi-dravidar-tribal-welfare-dept', to: 'pre-matric-scholarship-adi-dravidar-tribal-welfare-dept' },
      { from: 'narotam-sekhsaria-foundation-scholarship', to: 'narotam-sekhsaria-postgraduate-scholarship' },
      { from: 'sbi-platinum-jubilee-asha-scholarship-2025-26', to: 'sbi-platinum-jubilee-asha-scholarship' },
      { from: 'jagananna-vidya-deevena-fees-reimbursement', to: 'jagananna-vidya-deevena-ap' },
      { from: 'jagananna-vasathi-deevena', to: 'jagananna-vasathi-deevena-ap' },
      { from: 'andhra-pradesh-jagananna-vidya-deevena', to: 'jagananna-vidya-deevena-ap' },
      { from: 'faea-scholarship-for-undergraduate-studies', to: 'faea-scholarship' },
      { from: 'oasis-scholarship-west-bengal', to: 'oasis-post-matric-scholarship-for-sc-students-west-bengal' },
      { from: 'kanyashree-prakalpa-k2', to: 'kanyashree-prakalpa-scheme-west-bengal' },
      { from: 'swami-vivekananda-merit-cum-means-scholarship', to: 'swami-vivekananda-merit-cum-means-scholarship-svmcm' },
      { from: 'suvarna-jubilee-merit-scholarship-kerala', to: 'kerala-suvarna-jubilee-merit-scholarship' },
      { from: 'kerala-egrantz-30-postmatric-sc-st-oec', to: 'e-grantz-kerala-scstoecobc-support' },
      { from: 'reliance-foundation-undergraduate-scholarships', to: 'reliance-foundation-undergraduate-scholarship' },
      { from: 'pragati-scholarship-for-girls-aitcte', to: 'aicte-pragati-scholarship-for-girl-students' },
      { from: 'rajasthan-uttar-matric-scholarship-sc-st-obc', to: 'rajasthan-post-matric-scholarship-sc' },
      { from: 'ssp-postmatric-sc-st-obc-karnataka', to: 'ssp-pre-matric-post-matric-scholarship-karnataka' },
      { from: 'aikyashree-scholarship-west-bengal-minority', to: 'aikyashree-merit-cum-means-scholarship-for-minorities-west-bengal' },
    ];

    const stateMappings = [
      { from: 'legacy-post-matric-tuition-fee-examination-fee-freeship', to: 'maharashtra' },
      { from: 'mp-taas-post-matric-scholarship-scstobc', to: 'madhya-pradesh' },
      { from: 'rajasthan-post-matric-scholarship-scst', to: 'rajasthan' },
      { from: 'gujarat-post-matric-scholarship-for-scst', to: 'gujarat' },
      { from: 'west-bengal-post-matric-scholarship-for-scstobc', to: 'west-bengal' },
      { from: 'punjab-post-matric-scholarship-for-scbc-students', to: 'punjab' },
      { from: 'chhattisgarh-post-matric-scholarship-scstobc', to: 'chhattisgarh' },
      { from: 'up-post-matric-scholarship-dashmottar', to: 'uttar-pradesh' },
    ];

    const genericMappings = [
      { from: 'punjab-educational-endowment-fund-peef', to: 'scholarships' },
      { from: 'cm-education-promotion-scheme', to: 'scholarships' },
    ];

    const generatedRedirects: any[] = [];

    // 1. Specific scholarship redirects (preserving subpages)
    for (const m of mappings) {
      // English
      generatedRedirects.push({
        source: `/scholarships/${m.from}/:subpage*`,
        destination: `/scholarships/${m.to}/:subpage*`,
        permanent: true,
      });
      // Localized
      generatedRedirects.push({
        source: `/:locale(hi|bn|ta|te|or|kn)/scholarships/${m.from}/:subpage*`,
        destination: `/:locale/scholarships/${m.to}/:subpage*`,
        permanent: true,
      });
    }

    // 2. State redirects (discarding subpage to avoid thin content state hubs)
    for (const m of stateMappings) {
      // English
      generatedRedirects.push({
        source: `/scholarships/${m.from}/:subpage*`,
        destination: `/scholarships-in/${m.to}`,
        permanent: true,
      });
      // Localized
      generatedRedirects.push({
        source: `/:locale(hi|bn|ta|te|or|kn)/scholarships/${m.from}/:subpage*`,
        destination: `/:locale/scholarships-in/${m.to}`,
        permanent: true,
      });
    }

    // 3. Generic redirects
    for (const m of genericMappings) {
      // English
      generatedRedirects.push({
        source: `/scholarships/${m.from}/:subpage*`,
        destination: `/${m.to}`,
        permanent: true,
      });
      // Localized
      generatedRedirects.push({
        source: `/:locale(hi|bn|ta|te|or|kn)/scholarships/${m.from}/:subpage*`,
        destination: `/:locale/${m.to}`,
        permanent: true,
      });
    }

    return [
      ...generatedRedirects,

      // Programmatic Subpage Sunset 301 Redirects (Mapping directly to section hash anchors)
      {
        source: '/scholarships/:slug/:subpage(eligibility|income-limit|documents-required|last-date|selection-process|apply-online|renewal-process)',
        destination: '/scholarships/:slug#:subpage',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)/scholarships/:slug/:subpage(eligibility|income-limit|documents-required|last-date|selection-process|apply-online|renewal-process)',
        destination: '/:locale/scholarships/:slug#:subpage',
        permanent: true,
      },
      {
        source: '/scholarships-in/:state/:subpage(eligibility|income-limit|documents-required|last-date|selection-process|apply-online|renewal-process)',
        destination: '/scholarships-in/:state#:subpage',
        permanent: true,
      },



      // 1. Broken Search Route
      {
        source: '/search',
        destination: '/scholarships',
        permanent: true,
      },
      // Duplicate SSP Karnataka card redirect (IS-43)
      {
        source: '/scholarships/pre-matric-post-matric-scholarships-ssp',
        destination: '/scholarships/ssp-pre-matric-post-matric-scholarship-karnataka',
        permanent: true,
      },
      // Tools & Guides legacy redirects
      {
        source: '/tools/eligibility-checker',
        destination: '/eligibility-checker',
        permanent: true,
      },
      // Duplicate route cleanup (IS-105) — /tools/scholarship-eligibility-checker rendered the
      // exact same EligibilityClient component as /eligibility-checker, which is the URL every
      // internal link on the site actually points to. Page removed; redirect catches any stray
      // inbound/indexed links.
      {
        source: '/tools/scholarship-eligibility-checker',
        destination: '/eligibility-checker',
        permanent: true,
      },
      // Editorial consolidation, Phase 1 (IS-115 / CNT-52) — these 4 articles are confirmed
      // exact-duplicate coverage of an existing, richer Portal Guide (same portal, same topic,
      // verified against relatedPillarSlug + title). Redirecting to the Guide, which also has
      // student-login / status-check / documents-list sub-pages the article doesn't.
      // The other 24 articles in content/articles/ are genuinely unique and are NOT redirected
      // here — they have no destination yet until they're migrated onto the unified Editorial
      // template (IS-113). Redirecting them now would orphan real content.
      {
        source: '/articles/digital-gujarat-scholarship-portal-guide',
        destination: '/guides/digital-gujarat-mysy',
        permanent: true,
      },
      {
        source: '/articles/karnataka-ssp-postmatric-guide-2026',
        destination: '/guides/ssp-karnataka',
        permanent: true,
      },
      {
        source: '/articles/mp-taas-scholarship-portal-guide',
        destination: '/guides/mptaas-mmvy-mp',
        permanent: true,
      },
      {
        source: '/articles/how-to-apply-talliki-vandanam-eligibility-status',
        destination: '/guides/talliki-vandanam-ap',
        permanent: true,
      },
      // Editorial consolidation, Phase 1b (IS-115) — Pillars now render under /guides/[slug]
      // too (app/guides/[portal]/page.tsx delegates to the Pillar component when the slug
      // isn't a known portal). One rule covers all 25 Pillars since destination slug always
      // equals source slug.
      {
        source: '/pillars/:slug',
        destination: '/guides/:slug',
        permanent: true,
      },
      // Editorial consolidation, Phase 3 (IS-115) — the /pillars and /articles INDEX pages
      // are now collapsed into one /guides index (app/guides/page.tsx), which lists Pillars
      // (grouped by type), Portal Guides, and How-To Articles all in one place. The separate
      // app/pillars/page.tsx and app/articles/page.tsx files have been removed.
      {
        source: '/pillars',
        destination: '/guides',
        permanent: true,
      },
      {
        source: '/articles',
        destination: '/guides',
        permanent: true,
      },
      // Editorial consolidation, Phase 2 (IS-115) — the remaining 24 unique Articles now
      // render under /guides/[slug] too (same delegation pattern as Pillars). Must be listed
      // AFTER the 4 explicit article->guide overrides above, since those redirect to a
      // DIFFERENT slug than the article's own (e.g. digital-gujarat-scholarship-portal-guide
      // -> digital-gujarat-mysy) — Next.js redirects match in array order, first wins, so the
      // specific overrides have to be checked before this generic same-slug catch-all.
      {
        source: '/articles/:slug',
        destination: '/guides/:slug',
        permanent: true,
      },
      {
        source: '/guides/nsp/:subpage*',
        destination: '/guides/national-scholarship-portal-nsp/:subpage*',
        permanent: true,
      },
      // 2. Legacy State Route Pattern
      {
        source: '/state/:state',
        destination: '/scholarships-in/:state',
        permanent: true,
      },
      // 3. Legacy Provider Layout Routes
      {
        source: '/central-scholarships',
        destination: '/government-scholarships',
        permanent: true,
      },
      {
        source: '/state-specific-scholarships',
        destination: '/state-scholarships',
        permanent: true,
      },
      {
        source: '/ut-scholarships',
        destination: '/state-scholarships',
        permanent: true,
      },
      {
        source: '/central government-scholarships',
        destination: '/government-scholarships',
        permanent: true,
      },
      {
        source: '/state government - maharashtra-scholarships',
        destination: '/government-scholarships',
        permanent: true,
      },
      {
        source: '/private university-scholarships',
        destination: '/private-scholarships',
        permanent: true,
      },
      {
        source: '/private company - csr-scholarships',
        destination: '/private-scholarships',
        permanent: true,
      },
      {
        source: '/private company-scholarships',
        destination: '/private-scholarships',
        permanent: true,
      },
      {
        source: '/foundation-scholarships',
        destination: '/private-scholarships',
        permanent: true,
      },
      {
        source: '/central/state focus-scholarships',
        destination: '/government-scholarships',
        permanent: true,
      },
      {
        source: '/central/state%20focus-scholarships',
        destination: '/government-scholarships',
        permanent: true,
      },
      {
        source: '/central/ut focus-scholarships',
        destination: '/government-scholarships',
        permanent: true,
      },
      {
        source: '/central/ut%20focus-scholarships',
        destination: '/government-scholarships',
        permanent: true,
      },
      {
        source: '/state government-scholarships',
        destination: '/government-scholarships',
        permanent: true,
      },
      // GSC 404 Legacy Redirects
      {
        source: '/scholarships-level/diploma/polytechnic,-iti/itc',
        destination: '/scholarships-by-education',
        permanent: true,
      },
      {
        source: '/scholarships-level/undergraduate-(ug),-postgraduate-(pg),-diploma/polytechnic,-iti/itc,-phd',
        destination: '/scholarships-by-education',
        permanent: true,
      },
      {
        source: '/scholarships-level/post-matric-(class-11-12),-undergraduate-(ug),-postgraduate-(pg),-diploma/polytechnic',
        destination: '/scholarships-by-education',
        permanent: true,
      },
      {
        source: '/scholarships-level/school-(6-12),-diploma/polytechnic,-iti/itc',
        destination: '/scholarships-by-education',
        permanent: true,
      },
      {
        source: '/scholarships-level/undergraduate-(ug),-postgraduate-(pg),-diploma/polytechnic',
        destination: '/scholarships-by-education',
        permanent: true,
      },
      {
        source: '/scholarships-level/school-(1-5),-school-(6-12),-undergraduate-(ug),-postgraduate-(pg),-diploma/polytechnic,-iti/itc',
        destination: '/scholarships-by-education',
        permanent: true,
      },
      {
        source: '/scholarships-level/post-matric-(class-11-onwards-including-puc,-iti,-diploma,-general-degree,-professional/technical-courses,-ug,-pg).-not-applicable-for-correspondence/distance-learning-or-certificate/training-programs.',
        destination: '/scholarships-by-education',
        permanent: true,
      },
      {
        source: '/scholarships-level/post-matric-(class-11-onwards-including-puc,-iti,-diploma,-general-degree,-professional/technical-courses,-ug,-pg).-not-applicable-for-correspondence/distance-learning-or-certificate/training-programs',
        destination: '/scholarships-by-education',
        permanent: true,
      },
      {
        source: '/scholarships-level/post-matric-(classes-11/puc-onwards-including-diploma,-iti,-general-degree,-professional-courses,-ug,-pg)',
        destination: '/scholarships-by-education',
        permanent: true,
      },
      {
        source: '/scholarships-level/post-matric-professional/technical\\:ug-and-pg-professional/technical-courses-only.-admission-must-be-through-competitive-examination.',
        destination: '/scholarships-by-education',
        permanent: true,
      },
      {
        source: '/scholarships-level/post-matric-professional/technical\\:ug-and-pg-professional/technical-courses-only.-admission-must-be-through-competitive-examination',
        destination: '/scholarships-by-education',
        permanent: true,
      },
      {
        source: '/scholarships-level/class-1-to-class-8-\\(note\\:-only-up-to-class-8,-unlike-sc/st/obc-which-go-to-class-10\\)',
        destination: '/scholarships-by-education',
        permanent: true,
      },
      {
        source: '/scholarships-for/all-categories-\\(sc/st/obc/minority/general\\)---must-possess-valid-unique-disability-id-\\(udid\\)-card-issued-by-department-for-empowerment-of-persons-with-disabilities',
        destination: '/scholarships-by-category',
        permanent: true,
      },
      {
        source: '/scholarships-for/general-category---economically-weaker-section-\\(ews\\).-includes\\:-children-of-defense-personnel-\\(sc/st-parents-in-army/navy/airforce',
        destination: '/scholarships-by-category',
        permanent: true,
      },
      {
        source: '/scholarships-for/ews-/-merit',
        destination: '/scholarships-by-category',
        permanent: true,
      },
    ];
  }
};

export default nextConfig;
