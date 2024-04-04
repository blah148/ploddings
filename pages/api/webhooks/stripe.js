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

async function updateCredits(email, productType) {
  let additionalCredits = 0;
  if (productType === 'payment') {
    additionalCredits = 1;
  } else if (productType === 'subscription') {
    additionalCredits = 2;
  }

  try {
		console.log('this is the email', email);
    // Fetch the current credit balance
    let { data: initialData, error: initialError } = await supabase
      .from('users')
      .select('credit_balance')
      .eq('email', email)
      .single();

    if (initialError) throw new Error(`Fetching initial credit balance failed: ${initialError.message}`);

    console.log(`Initial credit balance for ${email}:`, initialData.credit_balance);

    // Perform the update
    let { data: updatedData, error: updateError } = await supabase
      .from('users')
      .update({ credit_balance: initialData.credit_balance + additionalCredits })
      .eq('email', email);

    if (updateError) throw new Error(`Updating credit balance failed: ${updateError.message}`);

    // Fetch the updated credit balance for logging
    let { data: finalData, error: finalError } = await supabase
      .from('users')
      .select('credit_balance')
      .eq('email', email)
      .single();

    if (finalError) throw new Error(`Fetching final credit balance failed: ${finalError.message}`);

    console.log(`Final credit balance for ${email}:`, finalData.credit_balance);
  } catch (error) {
    console.error('Supabase operation error:', error.message);
    throw error; // Rethrow the error after logging it
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
          await updateCredits(userEmail, productType);
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

