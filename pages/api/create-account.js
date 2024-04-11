import { supabase } from '../../utils/supabase'; // Adjust the import path as needed
import jwt from 'jsonwebtoken';

// A simple regex for basic email validation
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export default async function handler(req, res) {
  console.log('Request method:', req.method); // Log the request method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  console.log('Received email:', email); // Log the received email
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Validate the email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Check if the email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log(`Email already exists: ${email}`);
      return res.status(409).json({ error: 'Email already exists' });
    }

    console.log('Attempting to upsert user in Supabase');
    // Attempt to create or update the user and retrieve user details
    const { data: userData, error: supabaseError } = await supabase
      .from('users')
      .upsert([{ email }], { onConflict: 'email', returning: 'representation' });

    console.log('Upsert operation completed'); // Log after attempting upsert

    let user;
    if (!userData) {
      console.log('No userData returned, attempting to fetch user by email');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      if (error) throw error;
      user = data;
      console.log('User fetched by email:', user);
    } else {
      user = userData[0];
    }

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      throw supabaseError;
    }

    // Generate a JWT token including the user's id and email
    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Set the JWT token as a secure, HTTP-only cookie on the client side
    res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`);

    // Respond to indicate the account was created or updated successfully
    res.status(200).json({ message: 'Account created/updated successfully', userId: user.id });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Error creating/updating user' });
  }
}

