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
    ];

    const stateMappings = [
      { from: 'legacy-post-matric-tuition-fee-examination-fee-freeship', to: 'maharashtra' },
      { from: 'mp-taas-post-matric-scholarship-scstobc', to: 'madhya-pradesh' },
      { from: 'rajasthan-post-matric-scholarship-scst', to: 'rajasthan' },
      { from: 'gujarat-post-matric-scholarship-for-scst', to: 'gujarat' },
      { from: 'west-bengal-post-matric-scholarship-for-scstobc', to: 'west-bengal' },
      { from: 'punjab-post-matric-scholarship-for-scbc-students', to: 'punjab' },
      { from: 'aikyashree-scholarship-west-bengal-minority', to: 'west-bengal' },
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
