import { NextResponse } from 'next/server';
import { scholarshipsSitemapLastModified, studyAbroadSitemapLastModified } from '@/lib/sitemap-lastmod';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.indiascholarships.in';
  
  // Only the children that have a real change date get a lastmod; the others (core, states, taxonomies) are built from code
  const [scholarshipsMod, studyAbroadMod] = await Promise.all([scholarshipsSitemapLastModified(), studyAbroadSitemapLastModified()]);
  const lastmod = (d?: Date) => (d ? `\n      <lastmod>${d.toISOString()}</lastmod>` : '');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <sitemap>
      <loc>${baseUrl}/sitemap/core.xml</loc>
   </sitemap>
   <sitemap>
      <loc>${baseUrl}/sitemap/scholarships.xml</loc>${lastmod(scholarshipsMod)}
   </sitemap>
   <sitemap>
      <loc>${baseUrl}/sitemap/states.xml</loc>
   </sitemap>
   <sitemap>
      <loc>${baseUrl}/sitemap/taxonomies.xml</loc>
   </sitemap>
   <sitemap>
      <loc>${baseUrl}/sitemap/study-abroad.xml</loc>${lastmod(studyAbroadMod)}
   </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
