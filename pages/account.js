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
		fetchAndSetStarred(userId, null, ip);
		fetchAndSetVisitHistory(userId, null, ip);
		fetchAndSetUnlockedSongs(userId, null);
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
												<Menu userId={userId} />
										</div>
										<div className="narrowedFeedBody">
											<h1>My profile</h1>
											<h2>Save settings</h2>
											{!userId &&
												<> 
												  <div className="alertNotice">Persist favorites and viewing history across devices</div>
											  	<CreateAccountForm />
												</>
											}
											{userId && (<EmailUpdater userId={userId} />)}
											{message && <p>{message}</p>}
											<div className="categoryGroup">
												<h2 id="unlocked-songs">Unlocked songs</h2>
												{unlockedSongs.length === 0 ? (
													<div>No unlocked songs</div>
												) : (
													<ul>
														{unlockedSongs.map((unlocked, index) => (
															<li key={unlocked.content.id}>
																<Link href={`/${unlocked.content.page_type}/${unlocked.content.slug}`} passHref>
																	<Image width={40} height={40} src={unlocked.content.thumbnail_200x200} alt={unlocked.content.featured_img_alt_text}/>
																	{window.innerWidth <= 768 && unlocked.content.name.length > 27
																		? unlocked.content.name.slice(0, 27) + '...'
																		: unlocked.content.name}
																	<div className="led"></div>
																</Link>
															</li>
														))}
													</ul>
												)}
											</div>
											<div className="categoryGroup">
												<h2 id="starred">Starred</h2>
												{starred.length === 0 ? (<div>No starred items</div>) : (
													<ul>
														{starred.map((star, index) => (
															<li key={star.content.id}>
																<Link href={`/${star.content.page_type}/${star.content.slug}`} passHref>
																	<Image width={40} height={40} src={star.content.thumbnail_200x200} alt={star.content.featured_img_alt_text}/>
																	{window.innerWidth <= 768 && star.content.name.length > 27
																		? star.content.name.slice(0, 27) + '...'
																		: star.content.name}
																	<div className="led"></div>
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
															<li key={visit.content.id}>
																<Link href={`/${visit.content.page_type}/${visit.content.slug}`} passHref>
																	<Image width={40} height={40} src={visit.content.thumbnail_200x200} alt={visit.content.featured_img_alt_text}/>
																	{window.innerWidth <= 768 && visit.content.name.length > 27
																		? visit.content.name.slice(0, 27) + '...'
																		: visit.content.name}
																	<div className="led"></div>
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

