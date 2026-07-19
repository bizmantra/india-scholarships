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
  async redirects() {
    return [
      // Redirects for legacy and renamed scholarships (including subpages and locales)
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/legacy-foundation-for-excellence-scholarship/:subpage*',
        destination: '/:locale?/scholarships/foundation-for-excellence-ffe-scholarship/:subpage*',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/legacy-ssp-post-matric-scholarship-state-scholarship-portal/:subpage*',
        destination: '/:locale?/scholarships/ssp-pre-matric-post-matric-scholarship-karnataka/:subpage*',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/legacy-ssp-pre-matric-scholarship-state-scholarship-portal/:subpage*',
        destination: '/:locale?/scholarships/ssp-pre-matric-post-matric-scholarship-karnataka/:subpage*',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/legacy-government-of-india-post-matric-scholarship-via-mahadbt/:subpage*',
        destination: '/:locale?/scholarships/mahadbt-post-matric-scholarship-maharashtra/:subpage*',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/legacy-moovalur-ramamirtham-ammaiyar-higher-education-assurance-scheme/:subpage*',
        destination: '/:locale?/scholarships/pudhumai-penn-scheme-tamil-nadu/:subpage*',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/legacy-pudhumai-penn-scheme/:subpage*',
        destination: '/:locale?/scholarships/pudhumai-penn-scheme-tamil-nadu/:subpage*',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/legacy-sanchi-honnamma-scholarship/:subpage*',
        destination: '/:locale?/scholarships/sanchi-honnamma-scholarship-karnataka/:subpage*',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/legacy-post-matric-tuition-fee-examination-fee-freeship/:subpage*',
        destination: '/:locale?/scholarships-in/maharashtra',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/mp-taas-post-matric-scholarship-scstobc/:subpage*',
        destination: '/:locale?/scholarships-in/madhya-pradesh',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/rajasthan-post-matric-scholarship-scst/:subpage*',
        destination: '/:locale?/scholarships-in/rajasthan',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/gujarat-post-matric-scholarship-for-scst/:subpage*',
        destination: '/:locale?/scholarships-in/gujarat',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/west-bengal-post-matric-scholarship-for-scstobc/:subpage*',
        destination: '/:locale?/scholarships-in/west-bengal',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/punjab-post-matric-scholarship-for-scbc-students/:subpage*',
        destination: '/:locale?/scholarships-in/punjab',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/punjab-educational-endowment-fund-peef/:subpage*',
        destination: '/:locale?/scholarships',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/cm-education-promotion-scheme/:subpage*',
        destination: '/:locale?/scholarships',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/post-matric-scholarship-adi-dravidar-tribal-welfare-dept/:subpage*',
        destination: '/:locale?/scholarships/pre-matric-scholarship-adi-dravidar-tribal-welfare-dept/:subpage*',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/narotam-sekhsaria-foundation-scholarship/:subpage*',
        destination: '/:locale?/scholarships/narotam-sekhsaria-postgraduate-scholarship/:subpage*',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/sbi-platinum-jubilee-asha-scholarship-2025-26/:subpage*',
        destination: '/:locale?/scholarships/sbi-platinum-jubilee-asha-scholarship/:subpage*',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/jagananna-vidya-deevena-fees-reimbursement/:subpage*',
        destination: '/:locale?/scholarships/jagananna-vidya-deevena-ap/:subpage*',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/jagananna-vasathi-deevena/:subpage*',
        destination: '/:locale?/scholarships/jagananna-vasathi-deevena-ap/:subpage*',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/andhra-pradesh-jagananna-vidya-deevena/:subpage*',
        destination: '/:locale?/scholarships/jagananna-vidya-deevena-ap/:subpage*',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/aikyashree-scholarship-west-bengal-minority/:subpage*',
        destination: '/:locale?/scholarships-in/west-bengal',
        permanent: true,
      },
      {
        source: '/:locale(hi|bn|ta|te|or|kn)?/scholarships/faea-scholarship-for-undergraduate-studies/:subpage*',
        destination: '/:locale?/scholarships/faea-scholarship/:subpage*',
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
        source: '/central/ut focus-scholarships',
        destination: '/government-scholarships',
        permanent: true,
      },
      {
        source: '/state government-scholarships',
        destination: '/government-scholarships',
        permanent: true,
      },
    ];
  }
};

export default nextConfig;
