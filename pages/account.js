import Link from 'next/link';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './utils/supabase';
import ThemeSelector from '../components/ThemeSelector';
import EmailUpdater from '../components/ChangeEmail';
import useStore from '../zustandStore';
import useGuestStore from '../zustandStore_guest';
import CreateAccountForm from '../components/createAccount';
import { useLoading } from '../context/LoadingContext';
import Loader from '../components/Loader';

const verifyUserSession = (req) => {
  const token = req.cookies['auth_token'];
  if (!token) {
    return null; // No session
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Session valid
  } catch (error) {
    return null; // Session invalid
  }
};

export default function Account({ ip, isAuthenticated, userId }) {

	const { isLoading, setIsLoading } = useLoading();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

	const { 
		visitHistory, 
		starred, 
		fetchAndSetStarred, 
		fetchAndSetVisitHistory,
	} = useStore();
	const guestStore = useGuestStore();
	const {
		starredCount
	} = useGuestStore();
		

	useEffect(() => {
		// Initialize guest data loading
		if (!isAuthenticated) {
			guestStore.initialize();
		} else {
			// For authenticated users, fetch from the server or database
			fetchAndSetStarred(userId);
		}
		// Execute for both authenticated and unauthenticated users if objectLimit > 0
		fetchAndSetVisitHistory(userId, null, ip);

	}, [userId, isAuthenticated]);

	// Determine which data to display based on authentication state
	const displayVisitHistory = visitHistory;
	const displayStarred = !userId && !isAuthenticated ? guestStore.starred : starred;

  if (isLoading) {
    return <Loader isLoading={isLoading} />;
  }

  return (
    <div>
			{!isAuthenticated && <CreateAccountForm />}
			<EmailUpdater userId={userId} />
      {message && <p>{message}</p>}
		  <div>
        <h2>Visit History</h2>
        <ul>
          {displayVisitHistory.map((visit, index) => (
            <li key={index}>
              {visit.page_type} - {visit.page_id} - {new Date(visit.visited_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
			<div>
				<h2>Starred</h2>
					<ul>
						{displayStarred.map((star, index) => (
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

export async function getServerSideProps({ params, req }) {

  const userSession = verifyUserSession(req);
  const ip = req.connection.remoteAddress;
  
  return {
    props: {
      ip,
      isAuthenticated: !!userSession,
      userId: userSession?.id || null,
    },
  };
}

