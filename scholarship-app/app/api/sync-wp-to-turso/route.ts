import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-sync-secret');
    const secret = process.env.SYNC_SECRET || 'wp-to-turso-sync-secret-2026';
    
    if (authHeader !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { post_ids } = body;

    if (!post_ids || !Array.isArray(post_ids) || post_ids.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty post_ids array' }, { status: 400 });
    }

    // Call WordPress custom batch REST API endpoint to retrieve post details
    const WP_HOST = 'https://mediumpurple-sparrow-753119.hostingersite.com';
    const wpRes = await fetch(`${WP_HOST}/wp-json/custom-sync/v1/batch?ids=${post_ids.join(',')}`, {
      cache: 'no-store',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64')
      }
    });

    if (!wpRes.ok) {
      const errorText = await wpRes.text();
      return NextResponse.json({ error: `Failed to fetch from WordPress: ${errorText}` }, { status: wpRes.status });
    }

    const posts = await wpRes.json();
    if (!Array.isArray(posts)) {
      return NextResponse.json({ error: 'WordPress API returned invalid payload' }, { status: 500 });
    }

    const client = getClient();
    const currentYear = new Date().getFullYear();

    // Prepare SQLite insert or replace statement parameters
    for (const post of posts) {
      const fields = post.acf || {};
      
      // Parse arrays back into JSON strings for database compatibility
      const formatArrayField = (val: any) => {
        if (!val) return '[]';
        if (Array.isArray(val)) return JSON.stringify(val);
        try {
          return JSON.stringify([val]);
        } catch {
          return '[]';
        }
      };

      const formatStringOrJSON = (val: any) => {
        if (!val) return '[]';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
      };

      const mapLevels = (lvl: any) => {
        if (!lvl) return '[]';
        if (Array.isArray(lvl)) return JSON.stringify(lvl);
        return JSON.stringify([String(lvl)]);
      };

      const scholarshipData = {
        id: post.id.toString(),
        title: post.title?.rendered || post.title || '',
        slug: post.slug,
        provider: fields.provider || '',
        provider_type: fields.provider_type || 'Private',
        state: fields.state || 'All India',
        level: mapLevels(fields.level),
        caste: formatArrayField(fields.caste),
        gender: fields.gender || 'All',
        course_stream: formatArrayField(fields.course_stream),
        app_type: fields.app_type || '',
        amount_annual: fields.amount_annual ? Number(fields.amount_annual) : 0,
        amount_min: fields.amount_min ? Number(fields.amount_min) : 0,
        amount_description: fields.amount_description || '',
        benefits: fields.benefits || '',
        income_limit: fields.income_limit ? Number(fields.income_limit) : 0,
        min_marks: fields.min_marks ? Number(fields.min_marks) : 0,
        age_limit: fields.age_limit || 'NA',
        residency_requirement: fields.state || '',
        docs_needed: formatArrayField(fields.docs_needed),
        application_mode: fields.application_mode || 'Online',
        apply_url: fields.apply_url || '',
        deadline: fields.deadline || '',
        deadline_description: fields.deadline_description || '',
        time_min: 15,
        step_guide: fields.step_guide || '',
        selection: fields.selection || '',
        total_awards: fields.total_awards ? Number(fields.total_awards) : 0,
        renewal: fields.renewal || '',
        competitiveness: fields.competitiveness || 'Medium',
        verified_status: fields.verified_status || 'Verified',
        last_verified: post.modified || new Date().toISOString(),
        official_source: fields.official_source || fields.apply_url || '',
        helpline: fields.helpline || '',
        intro_seo: fields.intro_seo || '',
        faq_json: formatStringOrJSON(fields.faq_json),
        notes_actions: fields.notes_actions || '',
        keywords: fields.keywords || '',
        scholarship_type: fields.scholarship_type || 'Private',
        status: post.status === 'publish' ? 'Active' : 'Closed',
        verification_year: fields.verification_year ? Number(fields.verification_year) : currentYear,
        show_on_homepage: fields.show_on_homepage ? 1 : 0,
        is_featured: fields.is_featured ? 1 : 0,
        is_popular: fields.is_popular ? 1 : 0,
        priority_score: fields.priority_score ? Number(fields.priority_score) : 50,
        special_conditions: fields.special_conditions || '',
        tags: formatArrayField(fields.tags),
        thumbnail_url: fields.thumbnail_url || '',
        created_at: post.date || new Date().toISOString(),
        scholarship_scope: fields.scholarship_scope || 'Domestic',
        country_of_study: fields.country_of_study || '',
        always_open: fields.always_open ? 1 : 0,
        last_checked_at: new Date().toISOString()
      };

      await client.execute({
        sql: `INSERT OR REPLACE INTO scholarships (
          id, title, slug, provider, provider_type, state, level, caste, gender, course_stream, app_type,
          amount_annual, amount_min, amount_description, benefits, income_limit, min_marks, age_limit,
          residency_requirement, docs_needed, application_mode, apply_url, deadline, deadline_description,
          time_min, step_guide, selection, total_awards, renewal, competitiveness, verified_status,
          last_verified, official_source, helpline, intro_seo, faq_json, notes_actions, keywords,
          scholarship_type, status, verification_year, show_on_homepage, is_featured, is_popular,
          priority_score, special_conditions, tags, thumbnail_url, created_at, scholarship_scope,
          country_of_study, always_open, last_checked_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?
        )`,
        args: [
          scholarshipData.id, scholarshipData.title, scholarshipData.slug, scholarshipData.provider,
          scholarshipData.provider_type, scholarshipData.state, scholarshipData.level, scholarshipData.caste,
          scholarshipData.gender, scholarshipData.course_stream, scholarshipData.app_type,
          scholarshipData.amount_annual, scholarshipData.amount_min, scholarshipData.amount_description,
          scholarshipData.benefits, scholarshipData.income_limit, scholarshipData.min_marks, scholarshipData.age_limit,
          scholarshipData.residency_requirement, scholarshipData.docs_needed, scholarshipData.application_mode,
          scholarshipData.apply_url, scholarshipData.deadline, scholarshipData.deadline_description,
          scholarshipData.time_min, scholarshipData.step_guide, scholarshipData.selection,
          scholarshipData.total_awards, scholarshipData.renewal, scholarshipData.competitiveness,
          scholarshipData.verified_status, scholarshipData.last_verified, scholarshipData.official_source,
          scholarshipData.helpline, scholarshipData.intro_seo, scholarshipData.faq_json,
          scholarshipData.notes_actions, scholarshipData.keywords, scholarshipData.scholarship_type,
          scholarshipData.status, scholarshipData.verification_year, scholarshipData.show_on_homepage,
          scholarshipData.is_featured, scholarshipData.is_popular, scholarshipData.priority_score,
          scholarshipData.special_conditions, scholarshipData.tags, scholarshipData.thumbnail_url,
          scholarshipData.created_at, scholarshipData.scholarship_scope, scholarshipData.country_of_study,
          scholarshipData.always_open, scholarshipData.last_checked_at
        ]
      });
    }

    return NextResponse.json({ success: true, count: posts.length });
  } catch (error: any) {
    console.error('Webhook sync failed:', error);
    return NextResponse.json({ error: `Webhook sync failed: ${error.message}` }, { status: 500 });
  }
}
