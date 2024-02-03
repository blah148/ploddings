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
    // Attempt to create or update the user and retrieve user details
    const { data: userData, error: supabaseError } = await supabase
      .from('users')
      .upsert([{ email }], { onConflict: 'email', returning: 'representation' }); // Change to 'representation' to get user details
			let user;
			if (!userData) {
					const { data, error } = await supabase
							.from('users')
							.select('*')
							.eq('email', email)
							.single();
					if (error) throw error;
					user = data;
			} else {
					user = userData[0];
			}
				console.log('User data:', user);

    if (supabaseError) throw supabaseError;

    // Generate a JWT token including the user's id and email
    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Set the JWT token as a secure, HTTP-only cookie on the client side
    res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`);

    // Respond to indicate the account was created or updated successfully
    res.status(200).json({ message: 'Account created/updated successfully', userId: user.id }); // Optionally return the user ID in the response
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Error creating/updating user' });
  }
}

