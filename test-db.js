const { getScholarshipBySlug, getAllScholarships, getScholarshipsByLevel } = require('./scholarship-app/lib/db');
process.env.WORDPRESS_API_URL = 'https://indiapincode.org/wp-json/wp/v2';

async function test() {
  try {
    console.log('Testing getAllScholarships...');
    const all = await getAllScholarships();
    console.log('Total scholarships:', all.length);
    if (all.length > 0) {
      console.log('First scholarship:', all[0].title);
      console.log('First scholarship ID type:', typeof all[0].id);
    }

    console.log('\nTesting getScholarshipBySlug...');
    const one = await getScholarshipBySlug('glow-lovely-careers-scholarship-for-women');
    console.log('Found:', one ? one.title : 'Not found');

    console.log('\nTesting getScholarshipsByLevel...');
    const levels = await getScholarshipsByLevel('graduation-ug');
    console.log('Graduation UG count:', levels.length);
  } catch (e) {
    console.error('ERROR:', e);
  }
}

test();
