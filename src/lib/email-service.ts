import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface BoxCreationEmailData {
  firstName: string;
  email: string;
  boxDescription?: string;
  boxPrice?: number;
  boxLocation?: string;
}

export interface BoxDeletionEmailData {
  firstName: string;
  email: string;
  boxDescription?: string;
  boxPrice?: number;
  boxLocation?: string;
}

export async function sendBoxCreationEmail(data: BoxCreationEmailData) {
  try {
    const { firstName, email, boxDescription, boxPrice, boxLocation } = data;
    
    // Format the location
    const locationText = boxLocation ? ` in ${boxLocation}` : '';
    
    // Format the price
    const priceText = boxPrice ? ` under $${boxPrice.toLocaleString()}` : '';
    
    // Create the email content
    const emailHtml = `
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
            .button {
              display: inline-block;
              background: #2563eb;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Alset</div>
            <h1>✅ Buy Box Received — We're on it!</h1>
          </div>
          
          <div class="content">
            <p>Hi ${firstName},</p>
            
            <p>Thanks for submitting your Buy Box!</p>
            
            <div class="highlight">
              <strong>Your Search Criteria:</strong><br>
              ${boxDescription ? `• ${boxDescription}` : ''}
              ${priceText ? `• Price: $${boxPrice?.toLocaleString()}` : ''}
              ${locationText ? `• Location: ${boxLocation}` : ''}
            </div>
            
            <p>Our team is already reviewing your preferences and will begin searching for properties that match what you're looking for. We take your criteria seriously and will reach out as soon as we find opportunities that align.</p>
            
            <p>If anything changes or you'd like to update your preferences, feel free to visit your account and edit your Buy Boxes as needed.</p>
            
            <p>Let's find you the right deal.</p>
            
            <p>Best,<br>
            The Alset Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent because you created a new Buy Box on Alset.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Hi ${firstName},

Thanks for submitting your Buy Box!

Your Search Criteria:
${boxDescription ? `• ${boxDescription}` : ''}
${priceText ? `• Price: $${boxPrice?.toLocaleString()}` : ''}
${locationText ? `• Location: ${boxLocation}` : ''}

Our team is already reviewing your preferences and will begin searching for properties that match what you're looking for. We take your criteria seriously and will reach out as soon as we find opportunities that align.

If anything changes or you'd like to update your preferences, feel free to visit your account and edit your Buy Boxes as needed.

Let's find you the right deal.

Best,
The Alset Team

---
This email was sent because you created a new Buy Box on Alset.
If you have any questions, please contact our support team.
    `;

    const result = await resend.emails.send({
      from: 'Alset <noreply@alsetmaps.com>',
      to: [email],
      subject: '✅ Buy Box Received — We\'re on it!',
      html: emailHtml,
      text: emailText,
    });

    console.log('Email sent successfully:', result);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendBoxDeletionEmail(data: BoxDeletionEmailData) {
  try {
    const { firstName, email, boxDescription, boxPrice, boxLocation } = data;
    
    // Format the location
    const locationText = boxLocation ? ` in ${boxLocation}` : '';
    
    // Format the price
    const priceText = boxPrice ? ` under $${boxPrice.toLocaleString()}` : '';
    
    // Create the email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Buy Box Removed</title>
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
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
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
            .button {
              display: inline-block;
              background: #2563eb;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Alset</div>
            <h1>Your Buy Box Has Been Removed</h1>
          </div>
          
          <div class="content">
            <p>Hi ${firstName},</p>
            
            <p>We noticed you've removed your Buy Box preferences.</p>
            
            <div class="highlight">
              <strong>Removed Search Criteria:</strong><br>
              ${boxDescription ? `• ${boxDescription}` : ''}
              ${priceText ? `• Price: $${boxPrice?.toLocaleString()}` : ''}
              ${locationText ? `• Location: ${boxLocation}` : ''}
            </div>
            
            <p>No problem — your search is completely in your control. If you're still in the market and just refining your goals, you can resubmit a new Buy Box anytime that fits your updated criteria.</p>
            
            <p>Need help setting a new one up or have questions? We're here for you.</p>
            
            <p>Stay in touch,<br>
            The Alset Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent because you removed a Buy Box on Alset.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Hi ${firstName},

We noticed you've removed your Buy Box preferences.

Removed Search Criteria:
${boxDescription ? `• ${boxDescription}` : ''}
${priceText ? `• Price: $${boxPrice?.toLocaleString()}` : ''}
${locationText ? `• Location: ${boxLocation}` : ''}

No problem — your search is completely in your control. If you're still in the market and just refining your goals, you can resubmit a new Buy Box anytime that fits your updated criteria.

Need help setting a new one up or have questions? We're here for you.

Stay in touch,
The Alset Team

---
This email was sent because you removed a Buy Box on Alset.
If you have any questions, please contact our support team.
    `;

    const result = await resend.emails.send({
      from: 'Alset <noreply@alsetmaps.com>',
      to: [email],
      subject: 'Your Buy Box Has Been Removed',
      html: emailHtml,
      text: emailText,
    });

    console.log('Deletion email sent successfully:', result);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending deletion email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
