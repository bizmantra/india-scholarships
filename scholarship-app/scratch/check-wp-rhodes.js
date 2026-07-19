async function run() {
    const url = 'https://mediumpurple-sparrow-753119.hostingersite.com/wp-json/wp/v2/scholarship?slug=rhodes-scholarship-india';
    console.log("Fetching Rhodes post from WordPress REST API...");
    const res = await fetch(url);
    if (!res.ok) {
        console.error("HTTP Error:", res.status);
        return;
    }
    const data = await res.json();
    if (data && data.length > 0) {
        const post = data[0];
        console.log("Post ID:", post.id);
        console.log("Post Title:", post.title);
        console.log("ACF Fields:", JSON.stringify(post.acf, null, 2));
    } else {
        console.log("No post found on WordPress for this slug.");
    }
}

run();
