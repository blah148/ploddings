import sgMail from '@sendgrid/mail';
import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: '../../.env' });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Initialize Supabase client (not directly used in this handler, but might be useful for other parts of your application)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  // Extract data from the request body
  const { fname, email, subject, message } = req.body;
  if (!email || !subject || !message) {
    return res.status(400).json({ error: 'Email, Subject, and Message are required' });
  }

  try {
    // Prepare the email message
    const msg = {
      to: 'info@ploddings.com', // Recipient email address
      from: 'info@2dooz.today', // Your verified sender
      subject: `Contact Form Submission: ${subject}`, // Subject line
      text: `You have received a new contact form submission.\n\nFrom: ${fname || 'N/A'} (${email})\nSubject: ${subject}\nMessage: ${message}`,
      html: `<h4>You have received a new contact form submission.</h4><p><strong>From:</strong> ${fname || 'N/A'} (${email})<br><strong>Subject:</strong> ${subject}<br><strong>Message:</strong> ${message}</p>`,
    };

    // Send the email
    await sgMail.send(msg);
    res.status(200).json({ message: 'Contact form submission sent successfully.' });
  } catch (error) {
    console.error('Error in sending contact form submission:', error);
    res.status(500).json({ error: 'Error in sending contact form submission', details: error });
  }
}
