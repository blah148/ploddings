// pages/threads/[id]
import axios from 'axios';
import React, { useEffect, useState, createContext, useContext } from 'react';
import TableDataFetcher from '../utils/TableDataFetcher';
import Sidebar from '../../components/Sidebar';
import FavoriteButton from '../../components/songFavorite';
import { supabase } from '../utils/supabase'; // Adjust the import path as needed
import ChatWithGPT from '../../components/ChatWithGPT.js';
import jwt from 'jsonwebtoken';
const { fetchThreadData } = require('../../db-utilities');
import { useLoading } from '../../context/LoadingContext';
import Loader from '../../components/Loader';
import styles from '../../styles/songs.module.css';
import Footer from '../../components/Footer';
import Menu from '../../components/Menu';
import IpodMenuLink from '../../components/ParentBackLink';
import VictrolaIcon from '../../components/VictrolaIcon';
import WikipediaIcon from '../../components/WikipediaIcon';

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

export default function Thread({ userId, ip, threadData }) {

	const { isLoading, startLoading, stopLoading } = useLoading();

  const logPageVisit = async () => {
    try {
      await axios.post('/api/log-visit', {
        page_id: threadData.id,
				userId,
				ip: !userId ? ip : null,
      });
    } catch (error) {
      console.error('Failed to log page visit:', error);
    }
  };

	useEffect(() => {
	  logPageVisit();
	}, [userId, ip]);
	
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
					  <div className={styles.headerContainer}>		
							<img src={threadData.link_3 || 'https://f005.backblazeb2.com/file/ploddings-threads/featured_img_550px/default_550px.webp'} />
							<div className={styles.rightColumn}>
								<div className={styles.songNameContainer}>
									<h1>{threadData.name}</h1>
									<FavoriteButton userId={userId} id={threadData.id} ip={ip} />
								</div>
								{threadData.body_text && (<div className={styles.lifeAndDeath}>{threadData.body_text}</div>)}
								<div className={styles.iconContainer}>
									{threadData.link_1 && (<WikipediaIcon link={threadData.link_1} />)}
									{threadData.link_2 && (<VictrolaIcon link={threadData.link_2} />)}
								</div>
								<ChatWithGPT initialPrompt={`who is ${threadData.name}`} />
							</div>
						</div>
						<TableDataFetcher threadId={threadData.id} />
					</div>
				</div>
				<Footer userId={userId} />
			</div>
    </div>
  );
} 

export async function getServerSideProps({ params, req }) {
  const userSession = verifyUserSession(req);
  const threadData = await fetchThreadData(params.id);
  
  let ip;
  // Check if `userSession` is not null before trying to access its properties
  if (userSession === null || userSession.id === null) {
    ip = req.connection.remoteAddress;
  }

  const props = {
    threadData, 
    ip,
    userId: userSession?.id || null, 
  };

  return { props };
}

