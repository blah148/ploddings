// pages/api/create-portal-session.js
import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const { customerId } = req.body;

      if (!customerId) {
        return res.status(400).json({ error: 'Customer ID is required' });
      }
			console.log('this is the customerId', customerId);

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${req.headers.origin}/account`,
      });

      return res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Stripe API error:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

