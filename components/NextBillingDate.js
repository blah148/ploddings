// components/NextBillingDate.js
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase'; // Adjust the import path as necessary

const NextBillingDate = ({ userId }) => {
  const [nextBillingDate, setNextBillingDate] = useState('');

  useEffect(() => {
    const fetchNextBillingDate = async () => {
      try {
        // Fetch the stripe_id from the Supabase users table
        let { data, error } = await supabase
          .from('users')
          .select('stripe_id')
          .eq('id', userId)
          .single();

        if (error) throw error;
        if (!data || !data.stripe_id) throw new Error('Stripe ID not found.');

        // Fetch the next billing date using the stripe_id
        const response = await fetch(`/api/stripe/${data.stripe_id}`);
        if (!response.ok) throw new Error('Failed to fetch billing date.');

        const { nextBillingDate } = await response.json();
        setNextBillingDate(nextBillingDate);
      } catch (error) {
        console.error('Failed to fetch next billing date:', error.message);
      }
    };

    fetchNextBillingDate();
  }, [userId]);

  return (
    <div>
      Next Billing Date: {nextBillingDate ? new Date(nextBillingDate).toLocaleDateString() : 'Loading...'}
    </div>
  );
};

export default NextBillingDate;

