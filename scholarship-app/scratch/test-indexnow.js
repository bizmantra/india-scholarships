async function testIndexNow() {
    const key = 'c0326e5e8e894b92b67f1b7454efb507';
    const body = {
        host: 'www.indiascholarships.in',
        key: key,
        keyLocation: `https://www.indiascholarships.in/${key}.txt`,
        urlList: [
            'https://www.indiascholarships.in/scholarships/tata-capital-pankh-scholarship',
            'https://www.indiascholarships.in/scholarships/aicte-pragati-scholarship-for-girl-students'
        ]
    };

    console.log('Testing IndexNow API ping...');
    const res = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body)
    });

    console.log('Status code:', res.status, res.statusText);
}

testIndexNow().catch(console.error);
