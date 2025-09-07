// Direct email test script
// Run with: node test-email-direct.js

const { Resend } = require('resend');

// You'll need to set your RESEND_API_KEY in your environment
const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('Testing email to alsetsolutionsinc@gmail.com...');
  
  try {
    const result = await resend.emails.send({
      from: 'Alset <noreply@alset.com>', // You may need to change this to a verified domain
      to: ['alsetsolutionsinc@gmail.com'],
      subject: '✅ Buy Box Received — We\'re on it!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Buy Box Received</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
              }
              .content {
                background: #f8fafc;
                padding: 30px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
              .highlight {
                background: #dcfce7;
                border-left: 4px solid #22c55e;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                text-align: center;
                color: #6b7280;
                font-size: 14px;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">Alset</div>
              <h1>✅ Buy Box Received — We're on it!</h1>
            </div>
            
            <div class="content">
              <p>Hi Test User,</p>
              
              <p>Thanks for submitting your Buy Box!</p>
              
              <div class="highlight">
                <strong>Your Search Criteria:</strong><br>
                • Looking for investment property in downtown area<br>
                • Price: $250,000<br>
                • Location: Los Angeles, CA
              </div>
              
              <p>Our team is already reviewing your preferences and will begin searching for properties that match what you're looking for. We take your criteria seriously and will reach out as soon as we find opportunities that align.</p>
              
              <p>If anything changes or you'd like to update your preferences, feel free to visit your account and edit your Buy Boxes as needed.</p>
              
              <p>Let's find you the right deal.</p>
              
              <p>Best,<br>
              The Alset Team</p>
            </div>
            
            <div class="footer">
              <p>This is a test email to verify the email functionality is working correctly.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Hi Test User,

Thanks for submitting your Buy Box!

Your Search Criteria:
• Looking for investment property in downtown area
• Price: $250,000
• Location: Los Angeles, CA

Our team is already reviewing your preferences and will begin searching for properties that match what you're looking for. We take your criteria seriously and will reach out as soon as we find opportunities that align.

If anything changes or you'd like to update your preferences, feel free to visit your account and edit your Buy Boxes as needed.

Let's find you the right deal.

Best,
The Alset Team

---
This is a test email to verify the email functionality is working correctly.
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
}

testEmail();
