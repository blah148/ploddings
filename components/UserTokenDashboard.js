import React, { useState, useEffect } from 'react';
import styles from './UserTokenDashboard.module.css';
import { supabase } from '../utils/supabase';
import UserCreditBalance from '../components/UserCreditBalance.js';
import NextBillingDate from '../components/NextBillingDate';
import ManageStripeAccount from '../components/ManageStripeAccount';
import OneTimePaymentButton from '../components/StripeOneTime';
import SubscribeText from '../components/StripeSubscriptionText';
import TokenIcon from '../components/TokenIcon';
import InfoIcon from '../components/InfoIcon';
import Link from 'next/link';

const UserTokenDashboard = ({ userId }) => {
  const [pendingCredits, setPendingCredits] = useState(null);
  const [stripeId, setStripeId] = useState(null);
	const [activeMembership, setActiveMembership] = useState(null);

  useEffect(() => {
    // Function to fetch pending credits and stripe_id from the database
    const fetchData = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('pending_credits, stripe_id, active_membership')
          .eq('id', userId)
          .single();

        if (userError) {
          throw userError;
        }
        
        setPendingCredits(userData.pending_credits);
        setStripeId(userData.stripe_id);
				setActiveMembership(userData.active_membership);
				// console.log('stripe_id, active membership', userData.stripe_id, userData.active_membership);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  return (
    <div className={styles.tokenDashboard} id="credits">
<div className={styles.membershipState}>
  {activeMembership === true && (
    <>
      <div className={styles.learnMore}>Your subscription is: <strong>active</strong>. <Link href="/about">(Learn more)</Link></div>
      <ul>
        <li>
          <div className={styles.liItem}>
            <NextBillingDate userId={userId} />
            <InfoIcon tooltipMessage="Access to MIDI-tablature, slow-downer/pitch-shifter tool, & PDF download privileges" />
          </div>
        </li>
      </ul>
    </>
  )}
  {activeMembership === false && (
    <>
      <div className={styles.learnMore}>Your subscription is: <strong>inactive</strong>. <Link href="/about">(Learn more)</Link></div>
      <ul>
        <li>
          <div className={styles.liItem}>
            <ManageStripeAccount userId={userId} />
          </div>
        </li>
        <li>
          <div className={styles.liItem}>
            <SubscribeText userId={userId} text="Renew subscription"/>
            <InfoIcon tooltipMessage="Regain access to MIDI-tablature, slow-downer/pitch-shifter tool, & PDF download privileges" />
          </div>
        </li>
      </ul>
    </>
  )}
  {activeMembership === null && (
    <>
      <div className={styles.learnMore}>No active subscription. <Link href="/about">(Learn more)</Link></div>
      <ul>
        <li>
          <div className={styles.liItem}>
            <SubscribeText userId={userId} text="Activate subscription" />
            <InfoIcon tooltipMessage="Gain access to MIDI-tablature, slow-downer/pitch-shifter tool, & PDF download privileges" />
          </div>
        </li>
      </ul>
    </>
  )}
</div>

    </div>
  );
};

export default UserTokenDashboard;

