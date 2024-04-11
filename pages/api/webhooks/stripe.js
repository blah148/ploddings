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
  let activateMembership = false; // Flag to track whether to activate membership

  if (productType === 'payment') {
    additionalCredits = 1;
  } else if (productType === 'subscription') {
    additionalCredits = 2;
    activateMembership = true; // Activate membership for subscriptions
  }

  try {
    console.log('Updating user data for email:', email);
    
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('credit_balance, active_membership, stripe_id, pending_credits')
      .eq('email', email)
      .single();

    if (fetchError) throw new Error(`Fetching user data failed: ${fetchError.message}`);
    console.log(`Fetched user data for ${email}:`, userData);

    let updateData = { 
      credit_balance: userData.credit_balance + additionalCredits + (userData.pending_credits > 0 ? 1 : 0), // Add pending credit if available
      pending_credits: userData.pending_credits > 0 ? userData.pending_credits - 1 : userData.pending_credits, // Decrement pending_credits by 1 if any
    };

    if (activateMembership || userData.pending_credits > 0) { // Adjust logic as needed
      updateData.active_membership = true;
    }
    
    if (userData.stripe_id !== stripeCustomerId) {
      updateData.stripe_id = stripeCustomerId;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('email', email);

    if (updateError) throw new Error(`Updating user data failed: ${updateError.message}`);
    console.log(`User data updated for ${email}:`, updateData);
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

        case 'customer.subscription.created':
          const subscriptionCreated = event.data.object;
          console.log(`Handling subscription creation for customer: ${subscriptionCreated.customer}`);
          await activateMembershipAndHandleCredits(subscriptionCreated.customer);
          break;

        case 'customer.subscription.updated':
          const subscriptionUpdate = event.data.object;
          console.log(`customer.subscription.updated with status: ${subscriptionUpdate.status}`);
          
          if (['incomplete', 'past_due', 'canceled', 'unpaid'].includes(subscriptionUpdate.status)) {
            const stripeCustomerId = subscriptionUpdate.customer;
            console.log(`Deactivating membership for customer: ${stripeCustomerId} due to status: ${subscriptionUpdate.status}`);
            await deactivateMembership(stripeCustomerId);
          } else if (subscriptionUpdate.status === 'active') {
            console.log(`Activating or maintaining active membership for customer: ${subscriptionUpdate.customer}`);
            await activateMembershipAndHandleCredits(subscriptionUpdate.customer);
          } else {
            console.log("Subscription update does not require any action.");
          }
          break;

        case 'customer.subscription.deleted':
          // Logic to handle immediate subscription cancellation
          const subscriptionDeleted = event.data.object;
          const stripeCustomerIdDeleted = subscriptionDeleted.customer;
          console.log(`Handling immediate subscription cancellation for customer: ${stripeCustomerIdDeleted}`);
          await deactivateMembership(stripeCustomerIdDeleted);
          break;

        case 'invoice.payment_failed':
          const invoice = event.data.object;
          const customerStripeId = invoice.customer;
          console.log(`Handling payment failure for customer: ${customerStripeId}`);
          await deactivateMembership(customerStripeId);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error(`Error in webhook handler: ${err.message}`);
      res.status(500).send(`Webhook handler error: ${err.message}`);
    }
  } else {
    console.log("Non-POST request made to webhook endpoint");
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

async function deactivateMembership(stripeCustomerId) {
  try {
    console.log(`Attempting to update active_membership to FALSE for customer ID: ${stripeCustomerId}`);
    const { data, error } = await supabase
      .from('users')
      .update({ active_membership: false })
      .eq('stripe_id', stripeCustomerId);

    if (error) {
      console.error(`Error deactivating membership for customer ID ${stripeCustomerId}: ${error.message}`);
      throw error;
    }

    console.log(`Membership deactivated for customer ID: ${stripeCustomerId}, response data:`, data);
  } catch (error) {
    console.error('Supabase operation error:', error.message);
  }
}

async function activateMembershipAndHandleCredits(stripeCustomerId) {
  try {
    console.log(`Fetching user data for Stripe Customer ID: ${stripeCustomerId}`);
    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('active_membership, pending_credits, credit_balance')
      .eq('stripe_id', stripeCustomerId)
      .single();

    if (userFetchError) {
      console.error('Error fetching user data:', userFetchError.message);
      return;
    }

    console.log(`User Data:`, userData);

    // Initialize the update object with active_membership set to true.
    // This ensures that active_membership is always true after this operation,
    // regardless of its previous state.
    const updateData = { active_membership: true };
		console.log("testing here", userData.pending_credits);

    // Dispense 1 pending credit if available, regardless of the active_membership status.
    if (userData.pending_credits > 0) {
      updateData.credit_balance = userData.credit_balance + 1; // Increase credit balance by 1
      updateData.pending_credits = userData.pending_credits - 1; // Decrease pending credits by 1
      console.log(`Dispensing 1 pending credit. New credit balance: ${updateData.credit_balance}, Remaining pending credits: ${updateData.pending_credits}`);
    } else {
      console.log('No pending credits to dispense.');
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('stripe_id', stripeCustomerId);

    if (updateError) {
      console.error('Error updating user data:', updateError.message);
      return;
    }

    console.log(`Membership status updated and/or credits dispensed for Stripe Customer ID: ${stripeCustomerId}`);
  } catch (error) {
    console.error('Unexpected error in activateMembershipAndHandleCredits:', error.message);
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

