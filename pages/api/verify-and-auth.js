// Next.js API route: pages/api/verify-and-auth.js

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// API route for verifying payment and creating an account
export default async function verifyAndCreateUser(req, res) {
  const { session_id } = req.query;
  
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid' && session.metadata.guestEmail) {
      // Create a user account here
      const newUser = await createUser(session.metadata.guestEmail);
      // Optionally, log the user in and issue a session/token
      const token = await loginUser(newUser);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: 'Payment verification failed or user data missing.' });
    }
  } catch (error) {
    console.error('Failed to verify payment or create user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

