const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const NEWS_DIR = path.join(__dirname, '..', 'content', 'news');

[ARTICLES_DIR, NEWS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    files.forEach(file => {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf-8');
        let original = content;

        content = content.replace(/How can I track my application status online\?/g, 'How Can Applicants Track Application Status Online?');
        content = content.replace(/When will the scholarship money reach my bank\?/g, 'When Is Scholarship Money Credited to Bank Accounts?');
        content = content.replace(/What should I do if my/g, 'What to Do If');

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf-8');
        }
    });
});

console.log('✅ Reframed all article FAQ titles to eliminate first-person pronouns!');
