// scripts/setup-wp-menu.js
// Configures a clean, professional primary navigation menu via WordPress REST API.
// Run: node scripts/setup-wp-menu.js

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

async function getPageBySlug(slug) {
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/pages?slug=${slug}`, {
      headers: { 'Authorization': authHeader }
    });
    if (res.ok) {
      const matches = await res.json();
      if (matches && matches.length > 0) {
        return matches[0];
      }
    }
  } catch (e) {
    console.error(`Error fetching page slug "${slug}":`, e.message);
  }
  return null;
}

async function setupMenu() {
  console.log('🔄 Setting up primary navigation menu on WordPress...');

  // 1. Get page IDs for menu items
  const scholarshipsPage = await getPageBySlug('scholarships');
  const statesPage = await getPageBySlug('state-scholarships');
  const categoriesPage = await getPageBySlug('scholarships-by-category');
  const newsPage = await getPageBySlug('news');
  const guidesPage = await getPageBySlug('guides');

  // 2. Check if the "Primary Menu" already exists
  let menuId = null;
  try {
    const checkRes = await fetch(`${WP_URL}/wp-json/wp/v2/menus`, {
      headers: { 'Authorization': authHeader }
    });
    if (checkRes.ok) {
      const menus = await checkRes.json();
      const existing = menus.find(m => m.name === 'Primary Menu');
      if (existing) {
        menuId = existing.id;
        console.log(`Menu "Primary Menu" already exists (ID: ${menuId}).`);
      }
    }
  } catch (e) {
    console.error('Error checking menus:', e.message);
  }

  // 3. Create the menu if it doesn't exist
  if (!menuId) {
    console.log('Creating "Primary Menu"...');
    try {
      const createRes = await fetch(`${WP_URL}/wp-json/wp/v2/menus`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Primary Menu',
          locations: ['primary']
        })
      });
      if (createRes.ok) {
        const newMenu = await createRes.json();
        menuId = newMenu.id;
        console.log(`✅ Created "Primary Menu" (ID: ${menuId}).`);
      } else {
        const err = await createRes.json();
        console.error('❌ Failed to create menu:', err);
        return;
      }
    } catch (e) {
      console.error('Error creating menu:', e.message);
      return;
    }
  }

  // 4. Set Menu Location to Primary
  console.log('Mapping menu to primary location...');
  try {
    await fetch(`${WP_URL}/wp-json/wp/v2/menus/${menuId}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locations: ['primary']
      })
    });
  } catch (e) {
    console.error('Error assigning menu location:', e.message);
  }

  // 5. Fetch existing menu items to avoid duplicates
  let existingItems = [];
  try {
    const itemsRes = await fetch(`${WP_URL}/wp-json/wp/v2/menu-items?menu=${menuId}`, {
      headers: { 'Authorization': authHeader }
    });
    if (itemsRes.ok) {
      existingItems = await itemsRes.json();
    }
  } catch (e) {
    console.error('Error checking menu items:', e.message);
  }

  const itemsToCreate = [
    { title: 'Home', url: '/', type: 'custom' },
    { title: 'All Scholarships', object_id: scholarshipsPage?.id, object: 'page', type: 'post_type' },
    { title: 'By State', object_id: statesPage?.id, object: 'page', type: 'post_type' },
    { title: 'By Category', object_id: categoriesPage?.id, object: 'page', type: 'post_type' },
    { title: 'Guides', object_id: guidesPage?.id, object: 'page', type: 'post_type' },
    { title: 'News', object_id: newsPage?.id, object: 'page', type: 'post_type' }
  ];

  let order = 1;
  for (const item of itemsToCreate) {
    // Check duplicate
    const isDuplicate = existingItems.some(existing => {
      if (item.type === 'custom') {
        return existing.title.rendered === item.title;
      }
      return existing.title.rendered === item.title || existing.object_id === item.object_id;
    });

    if (isDuplicate) {
      console.log(`Menu item "${item.title}" already exists. Skipping.`);
      order++;
      continue;
    }

    console.log(`Adding menu item: "${item.title}"...`);
    const payload = {
      title: item.title,
      menu: menuId,
      status: 'publish',
      menu_order: order
    };

    if (item.type === 'custom') {
      payload.url = item.url;
      payload.type = 'custom';
    } else {
      payload.object_id = item.object_id;
      payload.object = item.object;
      payload.type = 'post_type';
    }

    try {
      const itemRes = await fetch(`${WP_URL}/wp-json/wp/v2/menu-items`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (itemRes.ok) {
        console.log(`✅ Added "${item.title}" to menu.`);
      } else {
        const err = await itemRes.json();
        console.error(`❌ Failed to add "${item.title}":`, err);
      }
    } catch (e) {
      console.error(`Error adding "${item.title}":`, e.message);
    }
    order++;
  }

  console.log('\n🎉 Finished configuring primary navigation menu!');
}

setupMenu();
