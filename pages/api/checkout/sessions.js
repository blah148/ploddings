import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia', // Replace with your Stripe API version
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Missing priceId.' });
    }

    try {
      const sessionParams = {
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin}/login?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/activate-user-account`,
        metadata: {}, // Add any metadata if needed
        subscription_data: {
          trial_period_days: 7 // Setting the trial period to 7 days
        }
      };

      if (email) {
        sessionParams.customer_email = email;
        // Optionally, add more metadata like userId if available
        // sessionParams.metadata.userId = userId;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

