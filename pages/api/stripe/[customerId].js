// pages/api/stripe/[customerId].js
import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27', // Ensure you're using the latest API version
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { customerId } = req.query; // Extract the customerId from the request URL

      // Fetch the customer's subscriptions from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active', // You might want to adjust this depending on your needs
        limit: 1, // Assuming one active subscription per customer for simplicity
      });

      if (subscriptions.data.length === 0) {
        return res.status(404).json({ error: 'No active subscriptions found for this customer.' });
      }

      // Assuming the first subscription is the one we're interested in
      const nextBillingDate = new Date(subscriptions.data[0].current_period_end * 1000);
      
      return res.status(200).json({ nextBillingDate: nextBillingDate.toISOString() });
    } catch (error) {
      console.error('Stripe API error:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

