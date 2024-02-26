import Link from 'next/link';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './utils/supabase';
import EmailUpdater from '../components/ChangeEmail';
import jwt from 'jsonwebtoken';
import IpodMenuLink from '../components/ParentBackLink';
import ThemeSelector from '../components/ThemeSelector';
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
											<h1>My profile</h1>
											<h2>Save settings</h2>
											{!userId && <CreateAccountForm />}
											{userId && (<EmailUpdater userId={userId} />)}
											{message && <p>{message}</p>}
											<div className="categoryGroup">
												<h2 id="starred">Starred</h2>
													<ul>
														{starred.map((star, index) => (
														 <li key={star.content.id}>
															 <Link href={`/${star.content.page_type}/${star.content.slug}`} passHref>
																 <img src={star.content.thumbnail_200x200} alt={star.content.featured_img_alt_text}/>
																 <div>{star.content.name}</div>
																 <div className="led"></div>
															 </Link>
														 </li>
														))}
													</ul>
											</div>
											<div className="categoryGroup">
												<h2 id="visit-history">Visit History</h2>
												<ul>
													{visitHistory.map((visit, index) => (
														 <li key={visit.content.id}>
															 <Link href={`/${visit.content.page_type}/${visit.content.slug}`} passHref>
																 <img src={visit.content.thumbnail_200x200} alt={visit.content.featured_img_alt_text}/>
																 <div>{visit.content.name}</div>
																 <div className="led"></div>
															 </Link>
														 </li>
													))}
												</ul>
												<ThemeSelector />
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

