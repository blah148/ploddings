// sendEmail.js

// Import SendGrid's Node.js Library
const sgMail = require('@sendgrid/mail');
require('dotenv').config({ path: '../../.env' });

// Set your SendGrid API Key
// Make sure to set your environment variable SENDGRID_API_KEY before running this script
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// Define the email message
const msg = {
  to: 'mpark148@gmail.com', // Change to your recipient's email address
  from: 'info@2dooz.today', // Change to your verified sender email address
  subject: 'ok real test now',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

// Send the email
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent successfully');
  })
  .catch((error) => {
    console.error('Error sending email:', error);
  });

