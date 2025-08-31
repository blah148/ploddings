// pages/threads/[id]
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState, createContext, useContext } from 'react';
import TableDataFetcher from '../../utils/TableDataFetcher';
import Sidebar from '../../components/Sidebar';
import { supabase } from '../../utils/supabase'; // Adjust the import path as needed
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
import SEO from '../../components/SEO';
import StabilizerText from '../../components/StabilizerText';
import BeingWatchedMobile from '../../components/BeingWatchedMobile.js';	

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

export default function Thread({ userId=null, ip, threadData }) {

	const { isLoading, startLoading, stopLoading } = useLoading();
	const [parsedContent, setParsedContent] = useState({ firstPTag: '', remainingPTags: '' });

  // Function to log the page visit directly to the database
  const logPageVisit = async () => {
    try {
      const { data, error } = await supabase
        .from('visit_history')
        .insert([
          {
            ip: ip,
            page_id: threadData.id,
            visited_at: new Date()
          }
        ]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to log page visit:', error.message);
    }
  };

	useEffect(() => {
	  logPageVisit();
	}, [userId, ip]);

  return (
    <div className="bodyA">
       <SEO
				 title=Learn {threadData.name} songs with tablature
				 image={threadData.link_3}
				 page_type="threads"
				 slug={threadData.slug}
         description={threadData.meta_description}
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
							<div className={styles.headerContainer}>		
								<Image width={300} height={300} alt={threadData.featured_img_alt_text ? threadData.featured_img_alt_text : `${threadData.name} guitar portrait`} src={threadData.link_3 || 'https://f005.backblazeb2.com/file/ploddings-threads/featured_img_550px/default_550px.webp'} />
								<div className={styles.rightColumn}>
									<div className={styles.songNameContainer}>
										<h1>{threadData.name}</h1>
									</div>
									{threadData.lyrics && (<div className={styles.lifeAndDeath}>{threadData.lyrics}</div>)}
									<div className={styles.iconContainer}>
										{threadData.link_1 && (<WikipediaIcon link={threadData.link_1} />)}
										{threadData.link_2 && (<VictrolaIcon link={threadData.link_2} />)}
									</div>
									<div className={styles.storyText}>{threadData.body_text}</div>
								</div>
							</div>
							<h2>MuseScore tabs</h2>
							<TableDataFetcher threadId={threadData.id} userId={userId} />
						</div>
						<BeingWatchedMobile />
					</div>
				</div>
				<Footer userId={userId} />
			</div>
    </div>
  );
} 

export async function getServerSideProps({ params, req }) {
  // const userSession = verifyUserSession(req);
  const threadData = await fetchThreadData(params.id);
  
	const forwardedFor = req.headers['x-forwarded-for'];
 	const ip = forwardedFor ? forwardedFor.split(',')[0] : req.connection.remoteAddress;

  const props = {
    threadData, 
    ip,
    // userId: userSession?.id || null, 
  };

  return { props };
}

