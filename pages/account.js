import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './utils/supabase';
import fetchVisitHistory from '../components/fetchVisitHistory';
import fetchStarred from '../components/fetchStarred';
import ThemeSelector from '../components/ThemeSelector';

export default function Account() {
  const { userId } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
	const [visitHistory, setVisitHistory] = useState([]);
	const [starred, setStarred] = useState([]);
	const objectLimit = 8;
		
	useEffect(() => {
		if (userId) {
			fetchStarred(userId)
				.then(({ data, count }) => {
					setStarred(data);
					console.log('Count of starred items:', count);
				})
				.catch(error => {
					console.error('Failed to fetch starred:', error);
				});
		}
	}, [userId]);

	useEffect(() => {
		if (userId) {
			fetchVisitHistory(userId)
				.then(({ data, count }) => {
					setVisitHistory(data);
					console.log('Count of visit history items:', count);
				})
				.catch(error => {
					console.error('Failed to fetch visit history:', error);
				});
		}
	}, [userId]);

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