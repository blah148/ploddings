// components/UserCreditBalance.js
import React, { useState, useEffect } from 'react';

const UserCreditBalance = ({ userId }) => {
  const [creditBalance, setCreditBalance] = useState(null);
  const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreditBalance = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/${userId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await res.json();
        setCreditBalance(data.creditBalance);
      } catch (error) {
        console.error('Failed to load user credit balance:', error);
        setError('Failed to load credit balance');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCreditBalance();
    }
  }, [userId]);

	if (loading) return <div style={{fontStyle: "italic", marginLeft: "4.5px", marginRight: "4.5px"}}>[loading...]</div>;

  return <div style={{marginLeft: "4.5px", marginRight: "4.5px"}}>{creditBalance}</div>;
};

export default UserCreditBalance;

