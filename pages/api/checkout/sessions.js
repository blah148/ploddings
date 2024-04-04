import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, productType } = req.body;
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: productType === 'one-time' ? 'price_1P1XjHKC15IuzqSc6M7w0XpD' : 'price_1P1XhzKC15IuzqSc4JdF2aeR',
            quantity: 1,
          },
        ],
        mode: productType === 'one-time' ? 'payment' : 'subscription',
        customer_email: email, // Pass the email here
      });

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

