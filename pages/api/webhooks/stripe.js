import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Assuming this import correctly initializes the Supabase client
import { supabase } from '../../../utils/supabase';

// Disable Next.js's default body parser for this API route.
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2019-02-11',
});

async function updateCredits(email, productType, stripeCustomerId) {
  let additionalCredits = 0;
  if (productType === 'payment') {
    additionalCredits = 1;
  } else if (productType === 'subscription') {
    additionalCredits = 2;
  }

  try {
    console.log('Updating user data for email:', email);
    
    // Fetch the current credit balance and stripe_id (if it exists)
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('credit_balance, stripe_id')
      .eq('email', email)
      .single();

    if (fetchError) throw new Error(`Fetching user data failed: ${fetchError.message}`);
    console.log(`Fetched user data for ${email}:`, userData);

    // Define the update object, always include the credit balance update
    const updateData = { credit_balance: userData.credit_balance + additionalCredits };
    
    // Only add the stripeCustomerId to the update if it's different from what's already stored
    if (userData.stripe_id !== stripeCustomerId) {
      updateData.stripe_id = stripeCustomerId;
    }

    // Perform the update with conditional stripe_id update
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('email', email);

    if (updateError) throw new Error(`Updating user data failed: ${updateError.message}`);
    console.log(`User data updated for ${email}. New credit balance: ${updateData.credit_balance}, Stripe ID: ${updateData.stripe_id || userData.stripe_id}`);
  } catch (error) {
    console.error('Supabase operation error:', error.message);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const rawBody = await streamToBuffer(req);
      const sig = req.headers['stripe-signature'];
      const event = stripe.webhooks.constructEvent(rawBody.toString('utf-8'), sig, process.env.STRIPE_WEBHOOK_SECRET);

      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;

          // Directly extracting email from the nested customer_details object
          const userEmail = session.customer_details?.email;

          if (!userEmail) {
            console.error('No email address available for this session:', session.id);
            return res.status(400).send('Email address is missing in the event data.');
          }

          // Assuming mode can be 'payment' (one-time) or 'subscription'
          const productType = session.mode;
					const stripeCustomerId = session.customer;
					console.log('this is the customer id', stripeCustomerId);
          await updateCredits(userEmail, productType, stripeCustomerId);
          console.log(`Credits updated successfully for ${userEmail}`);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook handler error:', err);
      res.status(500).send(`Webhook handler error: ${err.message}`);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

// Helper function to read the raw request body
function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    readableStream.on('error', reject);
    readableStream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

