import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../utils/supabase';
import EmailUpdater from '../components/ChangeEmail';
import jwt from 'jsonwebtoken';
import IpodMenuLink from '../components/ParentBackLink';
import ThemeSelector from '../components/ThemeSelector';
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import useStore from '../zustandStore';
import CreateAccountForm from '../components/createAccount';
import { useLoading } from '../context/LoadingContext';
import Loader from '../components/Loader';
import SEO from '../components/SEO';
import StabilizerText from '../components/StabilizerText';
import UserTokenDashboard from '../components/UserTokenDashboard';
import VisitorTokenDashboard from '../components/VisitorTokenDashboard';

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
		unlockedSongs,
		fetchAndSetStarred, 
		fetchAndSetVisitHistory,
		fetchAndSetUnlockedSongs,
	} = useStore();

	useEffect(() => {
		// Initialize guest data loading
		fetchAndSetStarred(userId, 3, ip);
		fetchAndSetVisitHistory(userId, ip, 4);
	}, [userId]);

  return (
		<div className="bodyA">
       <SEO
				 title="Account"
         description="Manage your Ploddings guitar account, toggling between light-and-dark mode, and checking back into your: (i) visit-history and (ii) starred guitar tablature"
         slug="/account"
       />
				<Sidebar userId={userId} ip={ip} />
				<div className="mainFeedAll">
						<div className="feedContainer">
								<Loader isLoading={isLoading} />
								<div className="mainFeed">
										<div className="topRow">
												<IpodMenuLink fallBack='' />
												<div style={{display: "flex"}}>
													<Menu userId={userId} />
												</div>
										</div>
										<div className="narrowedFeedBody">
											<StabilizerText />
											<h1>{userId ? "My profile" : "Visitor profile"}</h1>
											<h2>Save settings</h2>
											{!userId &&
												<> 
											  	<CreateAccountForm />
													<VisitorTokenDashboard />
												</>
											}
											{userId && (
													<>
														<EmailUpdater userId={userId} />
														<UserTokenDashboard userId={userId} />
													</>
											)}
											{message && <p>{message}</p>}
											<div className="categoryGroup">
												<h2 id="starred">Starred</h2>
												{starred.length === 0 ? (<div>No starred items</div>) : (
													<ul>
														{starred.map((star, index) => (
															<li key={star.id}>
																<Link href={`/${star.page_type}/${star.slug}`} passHref>
																	<Image width={40} height={40} src={star.thumbnail_200x200} alt={star.featured_img_alt_text}/>
																	{window.innerWidth <= 768 && star.name.length > 27
																		? star.name.slice(0, 27) + '...'
																		: star.name}
																	<div className={`led ${star.user_active_membership ? 'unlocked' : 'locked'}`}></div>
																</Link>
															</li>
														))}
													</ul>
												)}
											</div>
											<div className="categoryGroup">
												<h2 id="visit-history">Visit History</h2>
												{visitHistory.length === 0 ? (
													<div>No visit history</div>
												) : (
													<ul>
														{visitHistory.map((visit, index) => (
															<li key={visit.id}>
																<Link href={`/${visit.page_type}/${visit.slug}`} passHref>
																	<Image width={40} height={40} src={visit.thumbnail_200x200} alt={visit.featured_img_alt_text}/>
																	{window.innerWidth <= 768 && visit.name.length > 27
																		? visit.name.slice(0, 27) + '...'
																		: visit.name}
																  <div className={`led ${visit.user_active_membership ? 'unlocked' : 'locked'}`}></div>
																</Link>
															</li>
														))}
													</ul>
												)}
											</div>
											<ThemeSelector />
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
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = forwardedFor ? forwardedFor.split(',')[0] : req.connection.remoteAddress;
  
  return {
    props: {
      ip,
      userId: userSession?.id || null,
    },
  };
}

