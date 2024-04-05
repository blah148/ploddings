import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase'; // Adjust the import path as necessary

const NextBillingDate = ({ userId }) => {
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [customerPortalUrl, setCustomerPortalUrl] = useState('');

  useEffect(() => {
    const fetchNextBillingDate = async () => {
      try {
        // Fetch the stripe_id from the Supabase users table
        const { data, error } = await supabase
          .from('users')
          .select('stripe_id')
          .eq('id', userId)
          .single();

        if (error) throw new Error(`Fetching user failed: ${error.message}`);
        if (!data || !data.stripe_id) throw new Error('Stripe ID not found.');

        // Fetch the next billing date using the stripe_id
        const billingResponse = await fetch(`/api/stripe/${data.stripe_id}`);
        if (!billingResponse.ok) throw new Error('Failed to fetch billing date.');

        const billingData = await billingResponse.json();
        setNextBillingDate(billingData.nextBillingDate);

        // Fetch the Customer Portal URL
        const portalResponse = await fetch('/api/stripe/create-portal-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId: data.stripe_id }),
        });
        if (!portalResponse.ok) throw new Error('Failed to fetch customer portal URL.');

        const portalData = await portalResponse.json();
        setCustomerPortalUrl(portalData.url);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchNextBillingDate();
  }, [userId]);

  return (
<div>
  <p>
    Next billing date:
    {nextBillingDate ? (
      <a style={{marginLeft: "5px"}} href={customerPortalUrl} target="_blank" rel="noopener noreferrer">
        {new Date(nextBillingDate).toLocaleDateString()}
      </a>
    ) : 'Loading...'}
  </p>
</div>

  );
};

export default NextBillingDate;

