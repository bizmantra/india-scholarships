const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const nodemailer = require('nodemailer');

const emailUsername = process.env.EMAIL_USERNAME;
const emailPassword = process.env.EMAIL_PASSWORD;

if (!emailUsername || !emailPassword) {
    console.error('❌ Error: EMAIL_USERNAME or EMAIL_PASSWORD not found in environment/.env.local');
    console.log('Please define them in .env.local:');
    console.log('EMAIL_USERNAME=your_gmail@gmail.com');
    console.log('EMAIL_PASSWORD=your_gmail_app_password');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUsername,
        pass: emailPassword
    }
});

const mailOptions = {
    from: `"India Scholarships Freshness" <${emailUsername}>`,
    to: 'bizmantra@gmail.com',
    subject: 'Pipeline Verification Test Email',
    html: `
    <h3>Freshness Pipeline SMTP Verification</h3>
    <p>This is a test email sent from the India Scholarships freshness verification script.</p>
    <p>SMTP configuration is verified and working successfully!</p>
    `
};

console.log(`📡 Attempting to send test email to bizmantra@gmail.com via ${emailUsername}...`);

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('❌ Failed to send test email:', error.message);
        process.exit(1);
    }
    console.log('✅ Test email sent successfully! Message ID:', info.messageId);
    process.exit(0);
});
