import { supabase } from '../../utils/supabase';
require('dotenv').config({ path: '../../.env' });
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  try {
    // First, find the user by email to get the user_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }
    // Retrieve the verification code using user_id
    const { data: verificationData, error: verificationError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('user_id', userData.id) // Use user_id to retrieve code
      .eq('used', false); // Ensure the code hasn't been used

    if (verificationError || !verificationData) {
      throw new Error('Verification failed');
    }
    // Check if the code matches and is not expired
    const isCodeValid = verificationData.code === code && new Date(verificationData.expires_at) > new Date();

		// Check if there is a matching and non-expired code in the verificationData array
	const matchingCodeData = verificationData.find(v => v.code === code && new Date(v.expires_at) > new Date());

	if (!matchingCodeData) {
    return res.status(401).json({ error: 'Invalid or expired code' });
  }
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', matchingCodeData.id);

    // Generate a JWT token for the user
    const token = jwt.sign({ id: userData.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Set the JWT token as a secure cookie
    res.setHeader('Set-Cookie', serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 24 * 60 * 60 * 7, // 7 days
      path: '/',
    }));

    res.status(200).json({ message: 'Successfully logged in' });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Error during verification', details: error.message });
  }
}

