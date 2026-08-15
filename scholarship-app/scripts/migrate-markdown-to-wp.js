// scripts/migrate-markdown-to-wp.js
// Script to parse and migrate Markdown articles, news, and pillars to WordPress Custom Post Types.
// Run: node scripts/migrate-markdown-to-wp.js

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const WP_URL = 'https://mediumpurple-sparrow-753119.hostingersite.com';
const USERNAME = process.env.WORDPRESS_USERNAME;
const APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

if (!USERNAME || !APP_PASSWORD) {
  console.error('❌ Error: WORDPRESS_USERNAME and WORDPRESS_APP_PASSWORD must be defined in your .env.local file.');
  process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString('base64');

// Store map of pillar slugs to WordPress post IDs
const pillarMap = {};

// Helper to parse GFM tables to HTML
function markdownTableToHtml(tableMarkdown) {
  const lines = tableMarkdown.trim().split('\n');
  if (lines.length < 2) return '';
  
  const headers = lines[0].split('|').map(s => s.trim()).filter(Boolean);
  const rows = lines.slice(2).map(line => {
    return line.split('|').map(s => s.trim()).filter(Boolean);
  });

  let html = '<table class="wp-block-table"><thead><tr>';
  headers.forEach(h => {
    html += `<th>${h}</th>`;
  });
  html += '</tr></thead><tbody>';
  
  rows.forEach(row => {
    html += '<tr>';
    row.forEach(cell => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

// Convert standard markdown to clean HTML
function markdownToHtml(markdown) {
  let html = '';
  const lines = markdown.split('\n');
  let inList = false;
  let inTable = false;
  let tableBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Handle Tables
    if (line.trim().startsWith('|')) {
      inTable = true;
      tableBuffer.push(line);
      continue;
    } else if (inTable && !line.trim().startsWith('|')) {
      html += markdownTableToHtml(tableBuffer.join('\n'));
      tableBuffer = [];
      inTable = false;
    }

    // Handle blank lines
    if (line.trim() === '') {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      continue;
    }

    // Handle Headings
    if (line.startsWith('## ')) {
      html += `<h2>${line.substring(3).trim()}</h2>\n`;
      continue;
    } else if (line.startsWith('### ')) {
      html += `<h3>${line.substring(4).trim()}</h3>\n`;
      continue;
    }

    // Handle Blockquotes / Callouts
    if (line.startsWith('> ')) {
      let content = line.substring(2).trim();
      let alertClass = 'wp-block-quote';
      if (content.includes('💡')) {
        alertClass = 'alert-info-box';
      } else if (content.includes('⚠️')) {
        alertClass = 'alert-warning-box';
      }
      html += `<blockquote class="${alertClass}"><p>${content}</p></blockquote>\n`;
      continue;
    }

    // Handle Bullet Lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (!inList) {
        html += '<ul>\n';
        inList = true;
      }
      let content = line.trim().substring(2).trim();
      html += `<li>${content}</li>\n`;
      continue;
    }

    // Standard Paragraphs
    let parsedLine = line.trim();
    // Parse Bold **text**
    parsedLine = parsedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Parse Links [text](url)
    parsedLine = parsedLine.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    html += `<p>${parsedLine}</p>\n`;
  }

  if (inList) {
    html += '</ul>\n';
  }

  return html;
}

// Simple frontmatter parser
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parts = content.split('---');
  
  if (parts.length < 3) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterRaw = parts[1];
  const body = parts.slice(2).join('---').trim();
  
  const frontmatter = {};
  const lines = frontmatterRaw.split('\n');
  let currentKey = null;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      if (currentKey && Array.isArray(frontmatter[currentKey])) {
        frontmatter[currentKey].push(trimmed.substring(2).replace(/"/g, '').trim());
      }
    } else if (trimmed.includes(':')) {
      const idx = trimmed.indexOf(':');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      
      if (val === '') {
        frontmatter[key] = [];
        currentKey = key;
      } else {
        frontmatter[key] = val;
        currentKey = null;
      }
    }
  });

  return { frontmatter, body };
}

// Format the final HTML content with takeaways and checklist
function formatPostContent(frontmatter, bodyHtml) {
  let finalHtml = '';

  // Add Key Takeaways block if exists
  if (frontmatter.takeaways && frontmatter.takeaways.length > 0) {
    finalHtml += `
<div class="key-takeaways-box" style="background:#f4f6fc; border-left:4px solid #1a73e8; padding:15px; margin-bottom:25px; border-radius:4px;">
  <h4 style="margin-top:0; color:#1a73e8; font-weight:bold;">📌 Key Takeaways</h4>
  <ul style="margin-bottom:0;">
    ${frontmatter.takeaways.map(t => `<li>${t}</li>`).join('')}
  </ul>
</div>\n`;
  }

  finalHtml += bodyHtml;

  // Add Checklist block if exists
  if (frontmatter.checklist && frontmatter.checklist.length > 0) {
    finalHtml += `
<div class="documents-checklist-box" style="background:#f9f9f9; border:1px solid #e0e0e0; padding:15px; margin-top:30px; border-radius:4px;">
  <h4 style="margin-top:0; color:#333; font-weight:bold;">📋 Required Documents Checklist</h4>
  <ul style="margin-bottom:0; list-style-type:none; padding-left:0;">
    ${frontmatter.checklist.map(c => `<li><input type="checkbox" disabled style="margin-right:8px;" /> ${c}</li>`).join('')}
  </ul>
</div>\n`;
  }

  return finalHtml;
}

// Check if a CPT post exists
async function checkPostExists(slug, cpt) {
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/${cpt}?slug=${slug}&status=any`, {
      headers: { 'Authorization': authHeader }
    });
    if (res.ok) {
      const posts = await res.json();
      return posts && posts.length > 0 ? posts[0] : null;
    }
  } catch (err) {
    console.error(`Error checking slug "${slug}" on CPT "${cpt}":`, err.message);
  }
  return null;
}

// Upload a single CPT post
async function uploadPost(frontmatter, htmlContent, cpt, parentId = 0) {
  const slug = frontmatter.slug;
  const title = frontmatter.title;
  
  const postData = {
    title: title,
    slug: slug,
    content: htmlContent,
    status: 'publish'
  };

  if (parentId > 0) {
    postData.parent = parentId;
  }

  const existingPost = await checkPostExists(slug, cpt);

  try {
    let endpoint = `${WP_URL}/wp-json/wp/v2/${cpt}`;
    let method = 'POST';

    if (existingPost) {
      endpoint += `/${existingPost.id}`;
      console.log(`  Updating existing ${cpt} (ID: ${existingPost.id})...`);
    } else {
      console.log(`  Creating new ${cpt}...`);
    }

    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(postData)
    });

    const result = await response.json();
    if (response.ok) {
      console.log(`  ✅ Successfully synced "${title}"! ID: ${result.id}`);
      return result.id;
    } else {
      console.error(`  ❌ Failed to sync post:`, result.message || result);
    }
  } catch (err) {
    console.error(`  ❌ Network error uploading "${title}":`, err.message);
  }
  return null;
}

async function run() {
  console.log('🏁 Starting CPT-based Markdown Migration to WordPress...');

  // 1. First Pass: Migrate Pillars (Top-Level parents in CPT: guide)
  const pillarsDir = path.join(__dirname, '../content/pillars');
  console.log(`\n📂 Scanning Pillars directory: ${pillarsDir}...`);
  if (fs.existsSync(pillarsDir)) {
    const pillarFiles = fs.readdirSync(pillarsDir).filter(f => f.endsWith('.md'));
    console.log(`Found ${pillarFiles.length} pillar files to import first.`);
    
    for (const file of pillarFiles) {
      const filePath = path.join(pillarsDir, file);
      const { frontmatter, body } = parseMarkdownFile(filePath);
      
      const slug = frontmatter.slug || file.replace(/\.md$/, '');
      if (!slug || !frontmatter.title) continue;
      frontmatter.slug = slug;
      
      console.log(`\nProcessing Pillar: "${frontmatter.title}" (slug: ${frontmatter.slug})...`);
      const bodyHtml = markdownToHtml(body);
      const finalHtml = formatPostContent(frontmatter, bodyHtml);
      
      // Upload as parent (parentId = 0) to CPT: guide
      const postId = await uploadPost(frontmatter, finalHtml, 'guide', 0);
      if (postId) {
        pillarMap[frontmatter.slug] = postId;
      }
    }
  }

  // 2. Second Pass: Migrate Articles (Child pages under Pillars in CPT: guide)
  const articlesDir = path.join(__dirname, '../content/articles');
  console.log(`\n📂 Scanning Articles directory: ${articlesDir}...`);
  if (fs.existsSync(articlesDir)) {
    const articleFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));
    console.log(`Found ${articleFiles.length} article files to import.`);
    
    for (const file of articleFiles) {
      const filePath = path.join(articlesDir, file);
      const { frontmatter, body } = parseMarkdownFile(filePath);
      
      const slug = frontmatter.slug || file.replace(/\.md$/, '');
      if (!slug || !frontmatter.title) continue;
      frontmatter.slug = slug;
      
      console.log(`\nProcessing Article: "${frontmatter.title}" (slug: ${frontmatter.slug})...`);
      const bodyHtml = markdownToHtml(body);
      const finalHtml = formatPostContent(frontmatter, bodyHtml);
      
      // Lookup parent Pillar ID
      let parentId = 0;
      if (frontmatter.relatedPillarSlug && pillarMap[frontmatter.relatedPillarSlug]) {
        parentId = pillarMap[frontmatter.relatedPillarSlug];
        console.log(`  Found parent Pillar: "${frontmatter.relatedPillarSlug}" (ID: ${parentId})`);
      } else {
        console.log(`  No parent Pillar found for "${frontmatter.relatedPillarSlug || 'None'}". Creating at root.`);
      }
      
      await uploadPost(frontmatter, finalHtml, 'guide', parentId);
    }
  }

  // 3. Third Pass: Migrate News (CPT: news)
  const newsDir = path.join(__dirname, '../content/news');
  console.log(`\n📂 Scanning News directory: ${newsDir}...`);
  if (fs.existsSync(newsDir)) {
    const newsFiles = fs.readdirSync(newsDir).filter(f => f.endsWith('.md'));
    console.log(`Found ${newsFiles.length} news files to import.`);
    
    for (const file of newsFiles) {
      const filePath = path.join(newsDir, file);
      const { frontmatter, body } = parseMarkdownFile(filePath);
      
      const slug = frontmatter.slug || file.replace(/\.md$/, '');
      if (!slug || !frontmatter.title) continue;
      frontmatter.slug = slug;
      
      console.log(`\nProcessing News: "${frontmatter.title}" (slug: ${frontmatter.slug})...`);
      const bodyHtml = markdownToHtml(body);
      const finalHtml = formatPostContent(frontmatter, bodyHtml);
      
      await uploadPost(frontmatter, finalHtml, 'news', 0);
    }
  }

  console.log('\n🏆 Markdown CPT Migration Finished!');
}

run();
