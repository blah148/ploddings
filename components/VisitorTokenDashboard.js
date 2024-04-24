import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './UserTokenDashboard.module.css';
import SubscribeText from '../components/StripeSubscriptionText';
import TokenIcon from '../components/TokenIcon';
import InfoIcon from '../components/InfoIcon';

const VisitorTokenDashboard = ({ userId }) => {
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
    <div className={styles.tokenDashboard} id="credits">
      <div style={{ fontSize: "17px" }}>You have: </div>
      <div className={styles.dashboardRow}>
        <TokenIcon />
				<div style={{ margin: "auto 5px" }}>0</div>
        <div style={{ margin: "auto 0px" }}>active credits</div>
      </div>
			<div className={styles.dashboardRow}>
				<TokenIcon />
				<div style={{ margin: "auto 5px" }}>1</div>
				<div style={{margin: "auto 8px auto 0"}}>pending credits</div>
				<InfoIcon tooltipMessage="Bonus credits released one at a time with next subscription billing" />
			</div>
			<div className={styles.membershipState}>
						<div className={styles.learnMore}>No active subscription. <Link href="/about">(Learn more)</Link></div>
						<ul>
							<li>
								<div className={styles.liItem}>
									<SubscribeText userId={userId} text="Activate subscription" />
									<InfoIcon tooltipMessage="Receive 2 unlock credits per month" />
								</div>
							</li>
						</ul>
			</div>

    </div>
  );
};

export default VisitorTokenDashboard;


