import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const OneTimePaymentButton = ({ email }) => {
  const handleClick = async () => {
    const stripe = await stripePromise;

    const response = await fetch('/api/checkout/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, productType: 'one-time' }), // Specify 'one-time' for productType
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      // Specify the one-time price ID here
      lineItems: [{ price: 'price_1P1XjHKC15IuzqSc6M7w0XpD', quantity: 1 }],
      mode: 'payment', // Set mode to 'payment' for a one-time payment
      customerEmail: email, // Optionally prefill the customer's email address
      successUrl: window.location.href, // Use the current page URL as the success URL
      cancelUrl: window.location.href, // Use the current page URL as the cancel URL
    });

    if (result.error) {
      console.error('Error redirecting to checkout:', result.error.message);
    }
  };

  return (
    <button onClick={handleClick}>Pay Now</button> // Adjust the button label to reflect the action
  );
};

export default OneTimePaymentButton;

