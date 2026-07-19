const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
    console.log("Checking Turso cloud database records...");
    const res = await client.execute({
        sql: "SELECT slug, selection, renewal, step_guide FROM scholarships WHERE slug = 'rhodes-scholarship-india'",
        args: []
    });
    console.log(res.rows);
    client.close();
}

run();
