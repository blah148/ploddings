import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const SubscribeText = ({ email, text }) => {
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
      lineItems: [{ price: 'price_1P1XhzKC15IuzqSc4JdF2aeR', quantity: 1 }],
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
    <a style={{color: "blue", cursor: "pointer", margin: "auto 8px auto 0"}} onClick={handleClick}>{text}</a>
  );
};

export default SubscribeText;


