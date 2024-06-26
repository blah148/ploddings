import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const SubscribeButton = ({ email }) => {
  const handleClick = async () => {
    const stripe = await stripePromise;

    const response = await fetch('/api/checkout/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, productType: 'subscription' }),
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      lineItems: [{ price: 'price_1OyH9RKC15IuzqScWF0RXLmm', quantity: 1 }],
      mode: 'subscription',
      customerEmail: email,
      successUrl: window.location.href, // Use the current page URL as the success URL
      sessionId: session.id,
    });

    if (result.error) {
      console.error('Error redirecting to checkout:', result.error.message);
    }
  };

  return (
    <button onClick={handleClick}>Subscribe</button>
  );
};

export default SubscribeButton;

