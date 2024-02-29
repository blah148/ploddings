import sgMail from '@sendgrid/mail';
require('dotenv').config({ path: '../../.env' });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
      to: 'mpark@148@gmail.com', // Recipient email address
      from: 'info@ploddings.com', // Your verified sender
      subject: `Contact Form Submission: ${subject}`, // Subject line
      text: `You have received a new contact form submission.\n\nFrom: ${fname || 'N/A'} (${email})\nSubject: ${subject}\nMessage: ${message}`,
      html: `<h4>You have received a new contact form submission.</h4><p><strong>From:</strong> ${fname || 'N/A'} (${email})<br><strong>Subject:</strong> ${subject}<br><strong>Message:</strong> ${message}</p>`,
    };

    // Send the email
		console.log('heres the msg', msg);
    await sgMail.send(msg);
    res.status(200).json({ message: 'Contact form submission sent successfully.' });
  } catch (error) {
    console.error('Error in sending contact form submission:', error);
    res.status(500).json({ error: 'Error in sending contact form submission', details: error });
  }
}

