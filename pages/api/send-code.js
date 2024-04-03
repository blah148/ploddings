import sgMail from '@sendgrid/mail';
import { supabase } from '../../utils/supabase';
require('dotenv').config({ path: '../../.env' });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
    
    // Calculate expiration date for the verification code, e.g., 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // First, look up the user by email to get the user_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    // Then, store the code in the database using the user's id
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert([
        { user_id: userData.id, code: verificationCode, expires_at: expiresAt, used: false }
      ]);

    if (insertError) throw insertError;

    const msg = {
      to: email,
      from: 'no-reply@ploddings.com', // Change to your verified sender
      subject: 'Your Verification Code',
      text: `Your verification code is: ${verificationCode}`,
      html: `<strong>Your verification code is:</strong> ${verificationCode}`,
    };
    
    // Send the email
    await sgMail.send(msg);
    res.status(200).json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Error in sending email or storing code:', error);
    res.status(500).json({ error: 'Error in sending email or storing code', details: error });
  }
}

