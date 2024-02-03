import { supabase } from '../utils/supabase'; // Adjust the import path as needed
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Create a new user row in the "users" table
    const { data, error } = await supabase
      .from('users')
      .upsert([{ email }], { onConflict: ['email'], returning: 'minimal' });

    if (error) throw error;

    // Generate a JWT token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Respond with the JWT token
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
}

