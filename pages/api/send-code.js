// pages/api/send-code.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Generate a random verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6 digits code

    // TODO: Store the code in your database associated with the user's email

    // Set up nodemailer transport
    const transporter = nodemailer.createTransport({
      // Use environment variables or configure your SMTP server details
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: '"Your App Name" <your-email@example.com>',
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${verificationCode}`,
      html: `<b>Your verification code is:</b> ${verificationCode}`,
    });

    res.status(200).json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Error in sending email:', error);
    res.status(500).json({ error: 'Error in sending email' });
  }
}

