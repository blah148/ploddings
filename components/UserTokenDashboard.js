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
				console.log('stripe_id, active membership', userData.stripe_id, userData.active_membership);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  return (
    <div className={styles.tokenDashboard}>
      <div style={{ fontSize: "17px" }}>You have: </div>
      <div className={styles.dashboardRow}>
        <TokenIcon />
        <UserCreditBalance userId={userId} />
        <div>active credits</div>
      </div>
      {pendingCredits > 0 && (
        <div className={styles.dashboardRow}>
          <TokenIcon />
          <div style={{ margin: "auto 5px" }}>{pendingCredits}</div>
          <div style={{margin: "auto 8px auto 0"}}>pending credits</div>
					<InfoIcon tooltipMessage="Bonus tokens released with next subscription billing" />
        </div>
      )}
<div className={styles.membershipState}>
  {activeMembership === true && (
    <>
      <div>Your subscription is: <strong>active</strong></div>
      <ul>
        <li>
          <div className={styles.liItem}>
            <NextBillingDate userId={userId} />
            <InfoIcon tooltipMessage="You will receive 2 credits" />
          </div>
        </li>
        <li>
          <div className={styles.liItem}>
            <OneTimePaymentButton />
            <InfoIcon tooltipMessage="$3 one-time additional credit" />
          </div>
        </li>
      </ul>
    </>
  )}
  {activeMembership === false && (
    <>
      <div>Your subscription is: <strong>inactive</strong></div>
      <ul>
        <li>
          <div className={styles.liItem}>
            <ManageStripeAccount userId={userId} />
          </div>
        </li>
        <li>
          <div className={styles.liItem}>
            <SubscribeText userId={userId} text="Renew subscription"/>
            <InfoIcon tooltipMessage="2 credits per month" />
          </div>
        </li>
      </ul>
    </>
  )}
  {activeMembership === null && (
    <>
      <div>No active subscriptions</div>
      <ul>
        <li>
          <div className={styles.liItem}>
            <SubscribeText userId={userId} text="Activate subscription" />
            <InfoIcon tooltipMessage="2 credits per month" />
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

