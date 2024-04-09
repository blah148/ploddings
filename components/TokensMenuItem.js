import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../utils/supabase';
import styles from './TokenAndBalance.module.css';

const TokenAndBalance = ({ userId }) => {
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('credit_balance')
          .eq('id', userId)
          .single();

        if (error) {
          throw error;
        }
        
        setCredits(data.credit_balance);
      } catch (error) {
        console.error('Error fetching credits:', error.message);
      }
    };

      fetchCredits();
  }, [userId]);

  return (
		<div style={{alignSelf: "center"}}>
			<Link href="/account#credits" passHref>
				<div style={{ display: "flex", alignContent: "center" }}>
					<svg className={styles.tokenIcon} version="1.1" viewBox="-5.0 -10.0 110.0 135.0">
						<g className={styles.animation}>
							<path className={styles.sun} d="m50 3.125c-23.266 0-42.188 18.922-42.188 42.188v9.375c0 11.906 4.9688 22.688 12.938 30.359l0.046875 0.046875c2.9062 2.7969 6.2031 5.1719 9.8125 7.0312 0.015625 0 0.03125 0.03125 0.046875 0.03125 5.7969 3.0156 12.375 4.7188 19.344 4.7188s13.547-1.7031 19.344-4.7188c0.015625 0 0.03125-0.015625 0.046875-0.03125 3.6094-1.8594 6.9062-4.2344 9.8125-7.0312l0.046875-0.046875c7.9688-7.6719 12.938-18.453 12.938-30.359v-9.375c0-23.266-18.922-42.188-42.188-42.188zm-29.688 76.906c-4-4.6719-6.9062-10.297-8.3438-16.469 2.0938 4.3594 4.9375 8.3125 8.3438 11.688zm18.75 12.156c-2.1719-0.64062-4.25-1.4531-6.25-2.4375v-5.9219c2 0.89062 4.0938 1.6406 6.25 2.2188zm18.75 0.78125c-2.0312 0.40625-4.125 0.65625-6.25 0.73438v-6.25c2.125-0.078125 4.2188-0.3125 6.25-0.6875zm18.75-9.6719c-1.9219 1.7812-4 3.375-6.25 4.75v-5.7656c2.2188-1.2344 4.2969-2.6406 6.25-4.2188zm-26.562 1.0781c-21.547 0-39.062-17.516-39.062-39.062s17.516-39.062 39.062-39.062 39.062 17.516 39.062 39.062-17.516 39.062-39.062 39.062z"/>
							<path className={styles.cloud} d="m81.25 45.312c0 17.258-13.992 31.25-31.25 31.25s-31.25-13.992-31.25-31.25 13.992-31.25 31.25-31.25 31.25 13.992 31.25 31.25"/>
						</g>
					</svg>
					<div style={{color: "rgba(100, 92, 49, 0.9)", userSelect: "none"}}className={credits <= 10 ? styles.lowCredits : styles.highCredits}>
						{credits}
					</div>
				</div>
			</Link>
		</div>
  );
};

export default TokenAndBalance;

