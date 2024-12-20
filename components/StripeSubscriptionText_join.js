// components/SubscribeTextJoin.jsx

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const SubscribeTextJoin = ({ email, text, priceId }) => {
  const handleClick = async () => {
    if (!priceId) {
      console.error('Price ID is missing.');
      return;
    }

    const stripe = await stripePromise;

    try {
      const response = await fetch('/api/checkout/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, priceId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create checkout session: ${errorText}`);
      }

      const session = await response.json();

      const result = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });

      if (result.error) {
        console.error('Error redirecting to checkout:', result.error.message);
      }
    } catch (error) {
      console.error('Error during checkout:', error.message);
      alert('There was an issue processing your payment. Please try again.');
    }
  };

  return (
    <button
      style={{ color: "white", cursor: "pointer", margin: "auto 8px auto 0" }}
      onClick={handleClick}
      className="formButton Stripe two" // Ensure these classes are styled appropriately
    >
      {text}
    </button>
  );
};

export default SubscribeTextJoin;

