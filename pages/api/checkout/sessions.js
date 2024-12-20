// pages/api/checkout/sessions.js

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Define your valid price IDs to prevent misuse
const VALID_PRICE_IDS = [
  'prod_QgJFMGNqRWlCRP', // 1-Month
  'prod_RQjYwfUUsVTH1O', // 3-Months
  'prod_RQjZAHVkHrRwIe', // 12-Months
  // Alternatively, if these are product IDs, you should map to price IDs
];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, priceId } = req.body;

    // Basic validation
    if (!email || !priceId) {
      return res.status(400).json({ error: 'Missing email or priceId.' });
    }

    // Validate priceId
    if (!VALID_PRICE_IDS.includes(priceId)) {
      return res.status(400).json({ error: 'Invalid priceId.' });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription', // All plans are subscriptions
        customer_email: email, // Pass the email here
        success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/login?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/cancel`,
      });

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error('Stripe Checkout Session Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

