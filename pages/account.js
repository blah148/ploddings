import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './utils/supabase';

export default function Account() {
  const { userId } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      setEmail(data.email);
    };

    fetchUserData();
  }, [userId]);

  const updateEmail = async (newEmail) => {
    setLoading(true);

    const { data, error } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('id', userId);

    setLoading(false);

    if (error) {
      setMessage('Failed to update email.');
      console.error('Error updating email:', error);
    } else {
      setMessage('Email updated successfully.');
      setEmail(newEmail); // Update email state to reflect the change
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    updateEmail(email);
  };

  if (!userId) {
    return <p>Please log in to view and update your account information.</p>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Email'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
