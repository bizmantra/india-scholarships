import { NextResponse } from 'next/server';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.indiascholarships.in';
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <sitemap>
      <loc>${baseUrl}/sitemap/core.xml</loc>
   </sitemap>
   <sitemap>
      <loc>${baseUrl}/sitemap/scholarships.xml</loc>
   </sitemap>
   <sitemap>
      <loc>${baseUrl}/sitemap/states.xml</loc>
   </sitemap>
   <sitemap>
      <loc>${baseUrl}/sitemap/taxonomies.xml</loc>
   </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
