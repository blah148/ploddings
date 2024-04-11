import { supabase } from '../../utils/supabase'; // Ensure this path matches your file structure
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
        // Check if a user with the given email already exists
        const { data: existingUser, error: existingUserError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUserError && existingUserError.message !== "No rows found") {
            throw existingUserError; // Handle unexpected errors
        }

        if (existingUser) {
            // User already exists, return a 409 conflict error
            return res.status(409).json({ error: 'An account already exists with this email.' });
        }

        // Proceed to insert the new user since one wasn't found
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ email }])
            .single();

        if (insertError) throw insertError; // Handle potential insertion errors

        // Generate a JWT token for the new user
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Set the JWT token as a secure, HTTP-only cookie on the client side
        res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`);

        // Respond to indicate the account was created successfully
        res.status(200).json({ message: 'Account created successfully', userId: newUser.id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error processing your request' });
    }
}

