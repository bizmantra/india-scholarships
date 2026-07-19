const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found");
    process.exit(1);
}

async function test(url, payload) {
    console.log(`\nTesting URL: ${url}`);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.ok) {
            console.log("Success! Response contains text:", !!data.candidates?.[0]?.content?.parts?.[0]?.text);
            return true;
        } else {
            console.log("Error response:", JSON.stringify(data, null, 2));
            return false;
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
        return false;
    }
}

async function runTests() {
    // Test 1: v1beta endpoint with gemini-2.5-flash and camelCase generationConfig
    const url1 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload1 = {
        contents: [{ parts: [{ text: "Respond in JSON format: { \"hello\": \"world\" }" }] }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };
    await test(url1, payload1);

    // Test 2: v1 endpoint with gemini-2.5-flash and camelCase generationConfig
    const url2 = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload2 = {
        contents: [{ parts: [{ text: "Respond in JSON format: { \"hello\": \"world\" }" }] }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };
    await test(url2, payload2);
}

runTests();
