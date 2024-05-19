import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './UserTokenDashboard.module.css';
import SubscribeText from '../components/StripeSubscriptionText';
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
						<div className={styles.learnMore}>No active subscription. <Link href="/about">(Learn more)</Link></div>
						<ul>
							<li>
								<div className={styles.liItem}>
									<SubscribeText userId={userId} text="Activate subscription" />
									<InfoIcon tooltipMessage="Gain access to MIDI-tablature, slow-downer/pitch-shifter tool, & PDF download privileges" />
								</div>
							</li>
						</ul>
			</div>

    </div>
  );
};

export default VisitorTokenDashboard;


