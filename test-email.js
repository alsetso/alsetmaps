// Simple test script to verify email functionality
// Run with: node test-email.js

const { sendBoxCreationEmail } = require('./src/lib/email-service.ts');

async function testEmail() {
  console.log('Testing email functionality...');
  
  const testData = {
    firstName: 'John',
    email: 'test@example.com', // Replace with your test email
    boxDescription: 'Looking for investment property in downtown area',
    boxPrice: 250000,
    boxLocation: 'Los Angeles, CA'
  };

  try {
    const result = await sendBoxCreationEmail(testData);
    console.log('Email test result:', result);
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmail();
