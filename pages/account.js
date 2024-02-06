import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './utils/supabase';
import ThemeSelector from '../components/ThemeSelector';
import useStore from '../zustandStore';
import Loader from '../components/Loader';

export default function Account() {
  const { userId, isLoading } = useAuth();
	const { visitHistory, starred, fetchAndSetStarred, fetchAndSetVisitHistory } = useStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
	const objectLimit = 8;
		
  useEffect(() => {
    if (userId) {
      fetchAndSetStarred(userId, 3); // Assuming groupMax is 3 as defined in your store
    }
  }, [userId, fetchAndSetStarred]); // Added fetchAndSetStarred to dependency array

  useEffect(() => {
    if (userId) {
      fetchAndSetVisitHistory(userId, 3); // Assuming groupMax is 3 as defined in your store
    }
  }, [userId, fetchAndSetVisitHistory]); // Added fetchAndSetVisitHistory to dependency array

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

  if (isLoading) {
    return <Loader isLoading={isLoading} />; // Render the Loader while checking authentication status
  }

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
		  <div>
        <h2>Visit History</h2>
        <ul>
          {visitHistory.map((visit, index) => (
            <li key={index}>
              {visit.page_type} - {visit.page_id} - {new Date(visit.visited_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
			<div>
				<h2>Starred</h2>
					<ul>
						{starred.map((star, index) => (
							<li key={index}>
								{star.page_type} - {star.page_id} - {new Date(star.created_at).toLocaleString()}
							</li>
						))}
					</ul>
				</div>
				<ThemeSelector />
			</div>
  );
}
