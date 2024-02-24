import Link from 'next/link';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './utils/supabase';
import EmailUpdater from '../components/ChangeEmail';
import jwt from 'jsonwebtoken';
import IpodMenuLink from '../components/ParentBackLink';
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
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

export default function Account({ ip, userId }) {
	
	const { isLoading, startLoading, stopLoading } = useLoading();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

	const { 
		visitHistory, 
		starred, 
		fetchAndSetStarred, 
		fetchAndSetVisitHistory,
	} = useStore();

	useEffect(() => {
		// Initialize guest data loading
		fetchAndSetStarred(userId);
		fetchAndSetVisitHistory(userId, null, ip);

	}, [userId]);

  return (
		<div className="bodyA">
				<Sidebar userId={userId} ip={ip} />
				<div className="mainFeedAll">
						<div className="feedContainer">
								<Loader isLoading={isLoading} />
								<div className="mainFeed">
										<div className="topRow">
												<IpodMenuLink fallBack='/' />
												<Menu userId={userId} />
										</div>
										<div className="narrowedFeedBody">
											{!userId && <CreateAccountForm />}
											{userId && (<EmailUpdater userId={userId} />)}
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
										</div>
								</div> 
						</div> 
						<Footer userId={userId} />
				</div>
		</div>

  );
}

export async function getServerSideProps({ params, req }) {

  const userSession = verifyUserSession(req);
  const ip = req.connection.remoteAddress;
  
  return {
    props: {
      ip,
      userId: userSession?.id || null,
    },
  };
}

