// pages/api/webhooks/stripe.js

import Stripe from 'stripe';
import { supabase } from '../../../utils/supabase';
import { buffer } from 'micro';

// Disable Next.js's default body parser for this API route.
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Stripe with the updated API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia', // Ensure this matches your Stripe Dashboard's API version
});

// Function to create or update a user in Supabase
const createOrUpdateUser = async (email, stripeCustomerId) => {
  try {
    console.log(`🔍 Attempting to create or update user with email: ${email} and Stripe Customer ID: ${stripeCustomerId}`);

    // Check if the user already exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
      console.error(`❌ Error selecting user with email ${email}:`, error);
      throw error;
    }

    if (user) {
      // Update existing user
      console.log(`🛠️ User exists. Updating user: ${email}`);
      const { error: updateError } = await supabase
        .from('users')
        .update({ active_membership: true, stripe_id: stripeCustomerId })
        .eq('email', email);

      if (updateError) {
        console.error(`❌ Failed to update user ${email}:`, updateError);
        throw updateError;
      }
      console.log(`✅ Successfully updated user ${email} with active_membership: true`);
    } else {
      // Create new user
      console.log(`🆕 User does not exist. Creating new user: ${email}`);
      const { error: insertError } = await supabase
        .from('users')
        .insert({ email, active_membership: true, stripe_id: stripeCustomerId });

      if (insertError) {
        console.error(`❌ Failed to create user ${email}:`, insertError);
        throw insertError;
      }
      console.log(`✅ Successfully created new user ${email} with active_membership: true`);
    }
  } catch (error) {
    console.error('❗ Error in createOrUpdateUser:', error.message);
    throw error;
  }
};

// Function to deactivate a user's membership in Supabase
const deactivateUserMembership = async (stripeCustomerId) => {
  try {
    console.log(`🔄 Attempting to deactivate membership for Stripe Customer ID: ${stripeCustomerId}`);

    const { data, error } = await supabase
      .from('users')
      .update({ active_membership: false })
      .eq('stripe_id', stripeCustomerId);

    if (error) {
      console.error(`❌ Failed to deactivate membership for Stripe Customer ID ${stripeCustomerId}:`, error);
      throw error;
    }
    console.log(`✅ Successfully deactivated membership for Stripe Customer ID: ${stripeCustomerId}`);
  } catch (error) {
    console.error('❗ Error in deactivateUserMembership:', error.message);
    throw error;
  }
};

// Function to check if an event has already been processed (Idempotency)
const isEventProcessed = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from('processed_events')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
      console.error(`❌ Error checking processed events for Event ID ${eventId}:`, error);
      throw error;
    }

    if (data) {
      console.log(`🔄 Event ${eventId} has already been processed.`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❗ Error in isEventProcessed:', error.message);
    throw error;
  }
};

// Function to mark an event as processed (Idempotency)
const markEventAsProcessed = async (eventId) => {
  try {
    const { error } = await supabase
      .from('processed_events')
      .insert({ event_id: eventId, processed_at: new Date().toISOString() });

    if (error) {
      console.error(`❌ Failed to mark Event ID ${eventId} as processed:`, error);
      throw error;
    }

    console.log(`✅ Marked Event ID ${eventId} as processed.`);
  } catch (error) {
    console.error('❗ Error in markEventAsProcessed:', error.message);
    throw error;
  }
};

export default async function handler(req, res) {
  console.log('📥 Received a webhook event.');

  if (req.method !== 'POST') {
    console.warn("⚠️ Non-POST request made to webhook endpoint.");
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  let event;

  try {
    const rawBody = await buffer(req); // Use buffer to get raw body
    const sig = req.headers['stripe-signature'];

    // Debugging: Log the raw body and signature
    console.log('📄 Raw Body:', rawBody.toString());
    console.log('🔑 Stripe Signature:', sig);

    if (!sig) {
      console.error('❌ Missing Stripe signature.');
      return res.status(400).send('Missing Stripe signature');
    }

    // Extract the timestamp from the signature
    const sigParts = sig.split(',');
    const timestampPart = sigParts.find(part => part.startsWith('t='));
    const eventTimestamp = timestampPart ? parseInt(timestampPart.split('=')[1], 10) : null;

    // Get server's current timestamp
    const serverTimestamp = Math.floor(Date.now() / 1000);

    console.log(`🕒 Event Timestamp (t): ${eventTimestamp}`);
    console.log(`🕒 Server Timestamp: ${serverTimestamp}`);
    console.log(`⏱️ Timestamp Difference: ${Math.abs(serverTimestamp - eventTimestamp)} seconds`);

    if (!eventTimestamp) {
      console.error('❌ Missing timestamp in Stripe signature.');
      return res.status(400).send('Missing timestamp in Stripe signature');
    }

    // Check if the event is within the allowed tolerance (e.g., 5 minutes)
    const tolerance = 300; // 5 minutes in seconds
    const timeDifference = Math.abs(serverTimestamp - eventTimestamp);

    if (timeDifference > tolerance) {
      console.error(`❌ Timestamp difference (${timeDifference} seconds) exceeds tolerance (${tolerance} seconds).`);
      return res.status(400).send('Timestamp outside the tolerance zone');
    }

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET, 600);
      console.log(`🔐 Successfully verified Stripe webhook signature for Event ID: ${event.id}`);
    } catch (err) {
      console.error(`❌ Stripe signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Idempotency Check: Ensure the event hasn't been processed before
    const alreadyProcessed = await isEventProcessed(event.id);
    if (alreadyProcessed) {
      console.warn(`⚠️ Skipping already processed event: ${event.id}`);
      return res.status(200).json({ received: true });
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userEmail = session.customer_details?.email;
          const stripeCustomerId = session.customer;

          console.log(`🛒 Processing 'checkout.session.completed' for email: ${userEmail}, Customer ID: ${stripeCustomerId}`);

          if (userEmail && stripeCustomerId) {
            await createOrUpdateUser(userEmail, stripeCustomerId);
          } else {
            console.error('❌ Missing email or customer ID in checkout.session.completed event.');
          }
          break;
        }

        case 'customer.created': { // Handle customer.created event
          const customer = event.data.object;
          const email = customer.email;
          const stripeCustomerId = customer.id;

          console.log(`👤 Processing 'customer.created' for email: ${email}, Customer ID: ${stripeCustomerId}`);

          if (email && stripeCustomerId) {
            await createOrUpdateUser(email, stripeCustomerId);
          } else {
            console.error('❌ Missing email or customer ID in customer.created event.');
          }
          break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'invoice.payment_failed': {
          const subscription = event.data.object;
          const stripeCustomerId = subscription.customer;

          console.log(`🔄 Processing '${event.type}' for Customer ID: ${stripeCustomerId}`);
          await deactivateUserMembership(stripeCustomerId);
          break;
        }

        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }

      // Mark the event as processed to ensure idempotency
      await markEventAsProcessed(event.id);

      res.status(200).json({ received: true });
    } catch (err) {
      console.error(`❌ Webhook handler error: ${err.message}`);
      res.status(500).send(`Webhook handler error: ${err.message}`);
    }
  } catch (err) {
    console.error(`❌ Failed to parse webhook request: ${err.message}`);
    res.status(400).send(`Bad Request: ${err.message}`);
  }
}

