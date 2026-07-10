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
