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

// Function to associate unique_id with the user for automatic login (if implemented)
const associateUniqueIdWithUser = async (uniqueId, userId) => {
  try {
    const { error } = await supabase
      .from('pending_logins')
      .update({ user_id: userId })
      .eq('unique_id', uniqueId);

    if (error) {
      console.error(`❌ Failed to associate unique_id ${uniqueId} with user ID ${userId}:`, error);
      throw error;
    }

    console.log(`✅ Associated unique_id ${uniqueId} with user ID ${userId}`);
  } catch (error) {
    console.error('❗ Error in associateUniqueIdWithUser:', error.message);
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
          const uniqueId = session.metadata?.unique_id;

          console.log(`🛒 Processing 'checkout.session.completed' for email: ${userEmail}, Customer ID: ${stripeCustomerId}, Unique ID: ${uniqueId}`);

          if (userEmail && stripeCustomerId && uniqueId) {
            // Create or update the user
            await createOrUpdateUser(userEmail, stripeCustomerId);

            // Fetch the user from Supabase to get their ID
            const { data: user, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('email', userEmail)
              .single();

            if (userError) {
              console.error(`❌ Error fetching user after creation:`, userError);
              throw userError;
            }

            // Associate unique_id with user for automatic login (if implemented)
            // await associateUniqueIdWithUser(uniqueId, user.id); // Uncomment if using automatic login
          } else {
            console.error('❌ Missing email, customer ID, or unique ID in checkout.session.completed event.');
          }
          break;
        }

        case 'invoice.payment_succeeded': { // Handle invoice.payment_succeeded event
          const invoice = event.data.object;
          const stripeCustomerId = invoice.customer;

          console.log(`💰 Processing 'invoice.payment_succeeded' for Customer ID: ${stripeCustomerId}`);

          if (stripeCustomerId) {
            await createOrUpdateUserByStripeId(stripeCustomerId);
          } else {
            console.error('❌ Missing customer ID in invoice.payment_succeeded event.');
          }
          break;
        }

        case 'customer.subscription.created': { // Handle customer.subscription.created event
          const subscription = event.data.object;
          const stripeCustomerId = subscription.customer;

          console.log(`📅 Processing 'customer.subscription.created' for Customer ID: ${stripeCustomerId}`);

          if (stripeCustomerId) {
            await createOrUpdateUserByStripeId(stripeCustomerId);
          } else {
            console.error('❌ Missing customer ID in customer.subscription.created event.');
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

case 'customer.subscription.updated': {
  const subscription = event.data.object;
  const stripeCustomerId = subscription.customer;

  // Check if the subscription is set to cancel at the end of the period
  if (subscription.cancel_at_period_end) {
    console.log(`📅 Subscription for Customer ID ${stripeCustomerId} set to end after current period.`);
    // Here you might want to schedule a job to update membership status at the period end
    // For now, let's log this and you can add a job scheduler like later.js or use a time-based trigger in your database
    console.log(`🕒 Will set active_membership to false for ${stripeCustomerId} at period end.`);
  } else {
    console.log(`🔄 Subscription update for Customer ID ${stripeCustomerId} does not affect cancellation.`);
    // Reactivate the membership if previously set to deactivate at period end if needed
  }
  break;
}

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

// Additional helper function to create or update user by stripe_id
const createOrUpdateUserByStripeId = async (stripeCustomerId) => {
  try {
    console.log(`🔍 Attempting to create or update user with Stripe Customer ID: ${stripeCustomerId}`);

    // Check if the user already exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('stripe_id', stripeCustomerId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
      console.error(`❌ Error selecting user with Stripe Customer ID ${stripeCustomerId}:`, error);
      throw error;
    }

    if (user) {
      // Update existing user
      console.log(`🛠️ User exists. Updating user: ${user.email}`);
      const { error: updateError } = await supabase
        .from('users')
        .update({ active_membership: true })
        .eq('stripe_id', stripeCustomerId);

      if (updateError) {
        console.error(`❌ Failed to update user ${user.email}:`, updateError);
        throw updateError;
      }
      console.log(`✅ Successfully updated user ${user.email} with active_membership: true`);
    } else {
      // Optionally, handle cases where the user does not exist
      console.warn(`⚠️ No user found with Stripe Customer ID: ${stripeCustomerId}`);
      // You may choose to create a user here or log for manual review
    }
  } catch (error) {
    console.error('❗ Error in createOrUpdateUserByStripeId:', error.message);
    throw error;
  }
};

