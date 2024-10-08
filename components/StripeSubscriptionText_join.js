import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const SubscribeTextJoin = ({ email, text }) => {
  const handleClick = async () => {
    const stripe = await stripePromise;

    const response = await fetch('/api/checkout/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, productType: 'one-time' }),
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      lineItems: [{ price: 'price_1PowdBKC15IuzqScGKhDT7Uv', quantity: 1 }],
      mode: 'payment',
      customerEmail: email,
      successUrl: `${window.location.origin}/login`,
      sessionId: session.id,
    });

    if (result.error) {
      console.error('Error redirecting to checkout:', result.error.message);
    }
  };

  return (
    <a style={{color: "white", cursor: "pointer", margin: "auto 8px auto 0"}} onClick={handleClick}>{text}</a>
  );
};

export default SubscribeTextJoin;


